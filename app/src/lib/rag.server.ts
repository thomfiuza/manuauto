import { and,desc,eq,sql } from 'drizzle-orm'
import { db } from '../db/client.server'
import { answers,docChunks,documents,tips,videos } from '../db/schema'
import { chatComplete,embedOne,embedTexts,isAIConfigured,isVectorSearchConfigured } from './ai.server'
import { extractPdfChunks } from './pdf.server'
import { audit,logEvent } from './logger.server'
import { fuzzyChunkScore,normalizeText } from './search-utils'
import { storage } from './storage.server'
import { SYSTEM_PROMPT } from './system-prompt'

const MAX_CHUNKS=600,FALLBACK_SCAN_LIMIT=4000,TOP_RESULTS=8

export async function processDocument(userId:string,documentId:string){
  const[doc]=await db.select().from(documents).where(and(eq(documents.id,documentId),eq(documents.ownerId,userId))).limit(1)
  if(!doc)throw new Error('Documento não encontrado.')
  try{
    const bytes=await storage().get(doc.storageKey)
    const{pageCount,chunks}=await extractPdfChunks(Uint8Array.from(bytes).buffer)
    if(!chunks.length)throw new Error('O PDF não possui texto pesquisável. Será necessário OCR.')
    const limited=chunks.slice(0,MAX_CHUNKS)
    const vectors=isVectorSearchConfigured()?await embedTexts(limited.map(x=>x.content)):[]
    await db.delete(docChunks).where(eq(docChunks.documentId,documentId))
    for(let i=0;i<limited.length;i+=100){
      await db.insert(docChunks).values(limited.slice(i,i+100).map((chunk,j)=>({
        documentId,vehicleId:doc.vehicleId,page:chunk.page,section:chunk.section,
        content:chunk.content,contentNorm:normalizeText(chunk.content),
        embedding:vectors[i+j]??null,
      })))
    }
    const status=doc.visibility==='public'?'pending_review':'approved'
    await db.update(documents).set({status,pageCount,chunkCount:limited.length,errorMessage:null,updatedAt:new Date()}).where(eq(documents.id,documentId))
    await audit(userId,'document.processed','document',documentId,{pageCount,chunkCount:limited.length,truncated:chunks.length>limited.length,searchMode:vectors.length?'hybrid':'lexical'})
    return{pageCount,chunkCount:limited.length,truncated:chunks.length>limited.length,searchMode:vectors.length?'hybrid':'lexical'}
  }catch(cause){
    const message=cause instanceof Error?cause.message:'Falha ao processar o documento.'
    await db.update(documents).set({status:'failed',errorMessage:message,updatedAt:new Date()}).where(eq(documents.id,documentId))
    await audit(userId,'document.failed','document',documentId,{message})
    throw new Error(message)
  }
}

type SearchRow={
  chunk_id:string;document_id:string;title:string;source_type:string
  page:number|null;section:string|null;content:string
  similarity?:number;lexical?:number;fuzzy?:number
}

function rowsOf(result:unknown):SearchRow[]{
  const value=result as {rows?:SearchRow[]}|SearchRow[]
  return Array.isArray(value)?value:(value?.rows??[])
}

type SearchOutcome={rows:SearchRow[];mode:'hybrid'|'lexical'|'tolerante'}

async function searchChunks(userId:string,question:string,vehicleId:string|null):Promise<SearchOutcome>{
  const vehicleFilter=vehicleId?sql`and c.vehicle_id = ${vehicleId}::uuid`:sql``
  const accessFilter=sql`and (d.owner_id=${userId} or (d.visibility='public' and d.status='approved'))`
  if(isVectorSearchConfigured()){
    const vector=await embedOne(question)
    const literal=`[${vector.join(',')}]`
    const result=await db.execute(sql`
      with lexical as (
        select c.id, ts_rank(to_tsvector('portuguese', coalesce(c.content_norm,c.content)), websearch_to_tsquery('portuguese', ${normalizeText(question)})) rank
        from doc_chunks c
      )
      select c.id chunk_id, c.document_id, d.title, d.source_type, c.page, c.section, c.content,
        1-(c.embedding <=> ${literal}::vector) similarity,
        coalesce(l.rank,0) lexical,
        ((1-(c.embedding <=> ${literal}::vector))*.75 + least(coalesce(l.rank,0),1)*.25) score
      from doc_chunks c
      join documents d on d.id = c.document_id
      left join lexical l on l.id = c.id
      where c.embedding is not null ${vehicleFilter} ${accessFilter}
      order by score desc limit ${TOP_RESULTS}`)
    const rows=rowsOf(result)
    if(rows.length)return{rows,mode:'hybrid'}
  }
  // Busca lexical com texto normalizado (acentos e plurais tolerados pelo stemmer).
  const normalized=normalizeText(question)
  const lexicalResult=await db.execute(sql`
    select c.id chunk_id, c.document_id, d.title, d.source_type, c.page, c.section, c.content,
      ts_rank(to_tsvector('portuguese', coalesce(c.content_norm,c.content)), websearch_to_tsquery('portuguese', ${normalized})) lexical
    from doc_chunks c
    join documents d on d.id = c.document_id
    where to_tsvector('portuguese', coalesce(c.content_norm,c.content)) @@ websearch_to_tsquery('portuguese', ${normalized})
      ${vehicleFilter} ${accessFilter}
    order by lexical desc limit ${TOP_RESULTS}`)
  const lexicalRows=rowsOf(lexicalResult)
  if(lexicalRows.length)return{rows:lexicalRows,mode:'lexical'}
  // Modo tolerante: varredura com pontuação difusa (erro de digitação, grafia alternativa).
  const candidates=rowsOf(await db.execute(sql`
    select c.id chunk_id, c.document_id, d.title, d.source_type, c.page, c.section, c.content
    from doc_chunks c
    join documents d on d.id = c.document_id
    where true ${vehicleFilter} ${accessFilter}
    order by d.updated_at desc
    limit ${FALLBACK_SCAN_LIMIT}`))
  const tolerant=candidates
    .map(row=>({...row,fuzzy:fuzzyChunkScore(question,row.content)}))
    .filter(row=>(row.fuzzy??0)>=0.4)
    .sort((a,b)=>(b.fuzzy??0)-(a.fuzzy??0))
    .slice(0,TOP_RESULTS)
  if(tolerant.length)logEvent('search.tolerant',{question:lengthOf(question),hits:tolerant.length})
  return{rows:tolerant,mode:'tolerante'}
}

function lengthOf(value:string){return value.length}

function firstSentences(text:string,max=220):string{
  const clean=text.replace(/\s+/g,' ').trim()
  if(clean.length<=max)return clean
  return `${clean.slice(0,max).replace(/\s+\S*$/,'')}…`
}

/** Resposta extrativa: resumo direto das passagens, sem custo de IA. */
function extractiveAnswer(rows:SearchRow[],community:Array<unknown>):string{
  if(!rows.length){
    const suffix=community.length?` A comunidade registrou ${community.length} experiência(s) relacionada(s) — avalie aplicação e evidência antes de usar.`:''
    return `Sem passagens na documentação para esta dúvida.${suffix}`
  }
  const lines=rows.slice(0,4).map((row,index)=>{
    const where=row.page?` — página ${row.page}`:''
    return `• [${index+1}] ${row.title}${where}: ${firstSentences(row.content)}`
  })
  const communityNote=community.length?`\n\nA comunidade registrou ${community.length} experiência(s) relacionada(s), listadas separadamente abaixo.`:''
  return `Encontrei ${rows.length} trecho(s) relacionado(s) na documentação deste veículo. Sem modelo generativo configurado, este é um resumo direto das passagens — confirme sempre na página original:\n\n${lines.join('\n')}${communityNote}\n\nO Manuauto não transforma automaticamente esses trechos em diagnóstico.`
}

type CommunityItem={id:string;title:string;body:string;kind:string;topic:string;partNumber:string|null;sourceNote:string|null;engineCode:string|null;upvotes:number;downvotes:number}
export async function answerQuestion(userId:string,question:string,vehicleId:string|null){
  const{rows,mode}=await searchChunks(userId,question,vehicleId)
  const tipRows=await db.select().from(tips).where(and(eq(tips.status,'approved'),vehicleId?eq(tips.vehicleId,vehicleId):sql`true`)).orderBy(desc(tips.upvotes)).limit(5)
  const community:CommunityItem[]=tipRows.map((tip:typeof tips.$inferSelect)=>({id:tip.id,title:tip.title,body:tip.body,kind:tip.kind,topic:tip.topic,partNumber:tip.partNumber,sourceNote:tip.sourceNote,engineCode:tip.engineCode,upvotes:tip.upvotes,downvotes:tip.downvotes}))
  const sources=rows.map(row=>({documentId:row.document_id,title:row.title,sourceType:row.source_type,page:row.page,section:row.section,excerpt:row.content.slice(0,420)}))
  let answer:string
  if(!rows.length&&!community.length){
    answer='Não encontrei isso nos documentos deste veículo. Envie outro manual ou uma nota técnica para ampliar a biblioteca.'
  }else if(isAIConfigured()){
    const context=rows.map((row,index)=>`[${index+1}] ${row.title}, página ${row.page??'?'}${row.section?`, seção ${row.section}`:''}\n${row.content}`).join('\n\n---\n\n')
    const tipContext=community.map((tip,index)=>`[D${index+1}] ${tip.title}\n${tip.body}`).join('\n\n')
    answer=(await chatComplete(SYSTEM_PROMPT,`PERGUNTA:\n${question}\n\nDOCUMENTOS:\n${context||'Nenhum'}\n\nCOMUNIDADE:\n${tipContext||'Nenhuma'}`)).replace(/BUSCA_YOUTUBE:.*$/m,'').trim()
  }else{
    answer=extractiveAnswer(rows,community)
  }
  const[saved]=await db.insert(answers).values({userId,vehicleId,question,answer,sources}).returning({id:answers.id})
  const videoRows=vehicleId?await db.select().from(videos).where(and(eq(videos.vehicleId,vehicleId),eq(videos.approved,true))).limit(6):[]
  return{
    answerId:saved?.id??null,answer,sources,tips:community,
    youtubeSearch:`https://www.youtube.com/results?search_query=${encodeURIComponent(question)}`,
    videos:videoRows.map((video:typeof videos.$inferSelect)=>({id:video.id,title:video.title,url:video.youtubeUrl,component:video.component})),
    searchMode:mode,
  }
}
