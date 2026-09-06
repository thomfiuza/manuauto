import assert from 'node:assert/strict'
import { and,eq,sql } from 'drizzle-orm'
import { db,dbClient } from '../src/db/client.server'
import { answers,auditLog,documents,docChunks,tips,users,vehicles,videos } from '../src/db/schema'
import { answerQuestion } from '../src/lib/rag.server'
import { addTip,createVehicle,reviewContent,setAnswerVote,setTipVote,addVideo,setVideoApproval } from '../src/lib/manuauto.service.server'
import { storage } from '../src/lib/storage.server'

const[user]=await db.select().from(users).where(eq(users.email,'thomaz@manuauto.local')).limit(1);assert(user,'Usuário seed ausente')
const[vehicle]=await db.select().from(vehicles).where(and(eq(vehicles.model,'Symbol'),eq(vehicles.engineCode,'K4M'))).limit(1);assert(vehicle,'Symbol K4M ausente')
const[doc]=await db.select().from(documents).where(eq(documents.ownerId,user.id)).limit(1);assert(doc,'Manual ausente');assert(doc.pageCount>=1);assert(doc.chunkCount>=1)
const[countRow]=await db.select({count:sql<number>`count(*)`}).from(docChunks).where(eq(docChunks.documentId,doc.id));assert(Number(countRow.count)>=1)
const[normRow]=await db.select({count:sql<number>`count(*)`}).from(docChunks).where(and(eq(docChunks.documentId,doc.id),sql`content_norm <> ''`));assert(Number(normRow.count)>=1,'content_norm não preenchido')

// Consulta com acento: a busca normalizada deve casar com o conteúdo sem acento.
const accented=await answerQuestion(user.id,'pressão dos pneus',vehicle.id)
assert(accented.sources.length>0,'busca com acento falhou')
assert(['lexical','tolerante','hybrid'].includes(accented.searchMode))

// Consulta com erro de digitação: o modo tolerante deve recuperar o trecho.
const typo=await answerQuestion(user.id,'pressao dos peneus',vehicle.id)
assert(typo.sources.length>0,'busca tolerante (typo) falhou')
assert(typo.searchMode==='tolerante','modo tolerante não acionado')
assert(typo.answer.length>40,'resposta extrativa vazia')

// Confirmação de solução (answer_votes).
const voteResult=await setAnswerVote(user.id,{answerId:accented.answerId!,worked:true})
assert.equal(voteResult.confirmations,1)
const flipped=await setAnswerVote(user.id,{answerId:accented.answerId!,worked:false})
assert.equal(flipped.rejections,1);assert.equal(flipped.confirmations,0)

// Dicas: criação, moderação e votos.
const tip=await addTip(user.id,{vehicleId:vehicle.id,engineCode:'K4M',topic:'teste integração',kind:'recomendacao',title:'Teste automatizado de integração',body:'Registro temporário com conteúdo suficiente para validar moderação e votos.',partNumber:null,sourceNote:'teste local'});assert.equal(tip.status,'pending_review')
await reviewContent(user.id,{kind:'tip',id:tip.id,status:'approved'})
const vote=await setTipVote(user.id,{tipId:tip.id,worked:true});assert.equal(vote.upvotes,1)

// Catálogo: cadastro de veículo pela equipe.
const novoVeiculo=await createVehicle(user.id,{make:'Fiat',model:'Mobi Like',engineCode:'B8D1',engineLabel:'1.0 Fire',vehicleKind:'carro'})
assert(novoVeiculo.id,'veículo não criado')

// Vídeos curados: cadastro + aprovação + retorno na consulta.
const video=await addVideo(user.id,{vehicleId:vehicle.id,youtubeUrl:'https://www.youtube.com/watch?v=abcdefghijk',title:'Vídeo sintético de teste',component:'Motor'})
await setVideoApproval(user.id,{id:video.id,approved:true})
const comVideo=await answerQuestion(user.id,'pneus',vehicle.id)
assert(comVideo.videos.length>=1,'vídeo aprovado não retornado na consulta')

// Trilha de auditoria registrando as ações.
const[auditRow]=await db.select({count:sql<number>`count(*)`}).from(auditLog)
assert(Number(auditRow.count)>=1,'trilha de auditoria vazia')

// Armazenamento legível e limpeza dos dados temporários.
const pdf=await storage().get(doc.storageKey);assert.equal(new TextDecoder('latin1').decode(pdf.slice(0,5)),'%PDF-')
await db.delete(videos).where(eq(videos.id,video.id))
await db.delete(vehicles).where(eq(vehicles.id,novoVeiculo.id))
await db.delete(tips).where(eq(tips.id,tip.id))
await db.delete(answers).where(eq(answers.userId,user.id))

console.log(JSON.stringify({
  user:true,vehicle:true,pages:doc.pageCount,chunks:Number(countRow.count),
  searchAccents:accented.sources.length,searchTypoTolerant:typo.sources.length,
  answerVotes:true,moderation:true,votes:true,vehicleCatalog:true,curatedVideos:comVideo.videos.length,
  auditEntries:Number(auditRow.count),storage:true,
},null,2))
await dbClient?.close?.()
await dbClient?.end?.()
process.exit(0)
