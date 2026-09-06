import { and,desc,eq,sql } from 'drizzle-orm'
import { db } from '../db/client.server'
import { answerVotes,answers,auditLog,documents,tipVotes,tips,users,vehicles,videos } from '../db/schema'
import { audit } from './logger.server'
import { storage } from './storage.server'

const HISTORY_PAGE=20,DOCUMENTS_PAGE=12

function rowsOf(result:unknown):any[]{
  const value=result as {rows?:any[]}|any[]
  return Array.isArray(value)?value:(value?.rows??[])
}

/* ─────────────────────────── veículos e documentos ─────────────────────────── */

export async function getVehicles(){
  return db.select().from(vehicles).orderBy(vehicles.make,vehicles.model)
}

export async function createVehicle(actorId:string,data:{
  make:string;model:string;generation?:string|null;version?:string|null
  yearStart?:number|null;yearEnd?:number|null;engineCode?:string|null;engineLabel?:string|null
  fuel?:string|null;transmission?:string|null;vehicleKind?:string|null
}){
  const[row]=await db.insert(vehicles).values({
    make:data.make.trim(),model:data.model.trim(),generation:data.generation?.trim()||null,
    version:data.version?.trim()||null,yearStart:data.yearStart??null,yearEnd:data.yearEnd??null,
    engineCode:data.engineCode?.trim()||null,engineLabel:data.engineLabel?.trim()||null,
    fuel:data.fuel?.trim()||null,transmission:data.transmission?.trim()||null,
    vehicleKind:data.vehicleKind||'carro',
  }).returning()
  await audit(actorId,'vehicle.created','vehicle',row.id,{make:row.make,model:row.model,engineCode:row.engineCode})
  return row
}

export async function getMyDocumentStats(userId:string){
  const rows=rowsOf(await db.execute(sql`
    select count(*)::int all,
      count(*) filter(where status='approved')::int approved,
      count(*) filter(where status='pending_review')::int pending,
      count(*) filter(where status='processing')::int processing,
      count(*) filter(where status in ('failed','rejected'))::int failed
    from documents where owner_id=${userId}`))
  const stats=rows[0]??{all:0,approved:0,pending:0,processing:0,failed:0}
  return{all:Number(stats.all),approved:Number(stats.approved),pending:Number(stats.pending),processing:Number(stats.processing),failed:Number(stats.failed)}
}

export async function getMyDocuments(userId:string,offset=0){
  const items=await db.select().from(documents).where(eq(documents.ownerId,userId)).orderBy(desc(documents.createdAt)).limit(DOCUMENTS_PAGE).offset(offset)
  return{items,more:items.length===DOCUMENTS_PAGE}
}

/* ─────────────────────────── dicas da comunidade ─────────────────────────── */

export async function getTips(userId:string,data:{vehicleId?:string|null;includeOwn?:boolean}){
  return db.select().from(tips).where(and(
    data.vehicleId?eq(tips.vehicleId,data.vehicleId):sql`true`,
    data.includeOwn?sql`(${tips.status}='approved' or ${tips.authorId}=${userId})`:eq(tips.status,'approved'),
  )).orderBy(desc(tips.upvotes)).limit(50)
}

export async function addTip(userId:string,data:any){
  const[row]=await db.insert(tips).values({...data,authorId:userId,status:'pending_review'}).returning()
  await audit(userId,'tip.created','tip',row.id,{kind:row.kind,vehicleId:row.vehicleId})
  return row
}

export async function reportTip(userId:string,tipId:string){
  const[tip]=await db.select().from(tips).where(eq(tips.id,tipId)).limit(1)
  if(!tip)throw new Error('Contribuição não encontrada.')
  await db.update(tips).set({status:'pending_review',updatedAt:new Date()}).where(eq(tips.id,tipId))
  await audit(userId,'tip.reported','tip',tipId,{previousStatus:tip.status})
  return{ok:true}
}

export async function setTipVote(userId:string,data:{tipId:string;worked:boolean}){
  await db.insert(tipVotes).values({tipId:data.tipId,userId,worked:data.worked}).onConflictDoUpdate({target:[tipVotes.tipId,tipVotes.userId],set:{worked:data.worked}})
  const result=await db.execute(sql`select count(*) filter(where worked)::int up, count(*) filter(where not worked)::int down from tip_votes where tip_id=${data.tipId}::uuid`)
  const counts=rowsOf(result)[0]??{up:0,down:0}
  await db.update(tips).set({upvotes:Number(counts.up),downvotes:Number(counts.down),updatedAt:new Date()}).where(eq(tips.id,data.tipId))
  return{upvotes:Number(counts.up),downvotes:Number(counts.down),worked:data.worked}
}

/* ─────────────────────────── histórico e confirmação ─────────────────────────── */

export async function getAnswerHistory(userId:string,offset=0){
  const items=await db.select({
    id:answers.id,question:answers.question,answer:answers.answer,sources:answers.sources,createdAt:answers.createdAt,
    vehicleMake:vehicles.make,vehicleModel:vehicles.model,engineCode:vehicles.engineCode,
    confirmations:sql<number>`(select count(*) from answer_votes av where av.answer_id=${answers.id} and av.worked)::int`,
    rejections:sql<number>`(select count(*) from answer_votes av where av.answer_id=${answers.id} and av.worked=false)::int`,
  }).from(answers).leftJoin(vehicles,eq(answers.vehicleId,vehicles.id)).where(eq(answers.userId,userId)).orderBy(desc(answers.createdAt)).limit(HISTORY_PAGE).offset(offset)
  return{items,more:items.length===HISTORY_PAGE}
}

export async function removeAnswer(userId:string,id:string){
  const rows=await db.delete(answers).where(and(eq(answers.id,id),eq(answers.userId,userId))).returning({id:answers.id})
  if(!rows.length)throw new Error('Consulta não encontrada.')
  return{ok:true}
}

export async function setAnswerVote(userId:string,data:{answerId:string;worked:boolean}){
  const[answer]=await db.select({id:answers.id}).from(answers).where(eq(answers.id,data.answerId)).limit(1)
  if(!answer)throw new Error('Consulta não encontrada.')
  await db.insert(answerVotes).values({answerId:data.answerId,userId,worked:data.worked}).onConflictDoUpdate({target:[answerVotes.answerId,answerVotes.userId],set:{worked:data.worked}})
  const result=await db.execute(sql`select count(*) filter(where worked)::int ok, count(*) filter(where not worked)::int nok from answer_votes where answer_id=${data.answerId}::uuid`)
  const counts=rowsOf(result)[0]??{ok:0,nok:0}
  await audit(userId,'answer.voted','answer',data.answerId,{worked:data.worked})
  return{worked:data.worked,confirmations:Number(counts.ok),rejections:Number(counts.nok)}
}

/* ─────────────────────────── moderação ─────────────────────────── */

export async function getModerationQueue(){
  return{
    documents:await db.select().from(documents).where(and(eq(documents.visibility,'public'),eq(documents.status,'pending_review'))).orderBy(documents.createdAt),
    tips:await db.select().from(tips).where(eq(tips.status,'pending_review')).orderBy(tips.createdAt),
  }
}

export async function reviewContent(moderatorId:string,data:{kind:'document'|'tip';id:string;status:'approved'|'rejected'}){
  if(data.kind==='document')await db.update(documents).set({status:data.status,updatedAt:new Date()}).where(eq(documents.id,data.id))
  else await db.update(tips).set({status:data.status,updatedAt:new Date()}).where(eq(tips.id,data.id))
  await audit(moderatorId,'moderation.decision',data.kind,data.id,{status:data.status})
  return{ok:true}
}

export async function listAuditLog(limit=60){
  return db.select({
    id:auditLog.id,action:auditLog.action,targetType:auditLog.targetType,targetId:auditLog.targetId,
    metadata:auditLog.metadata,createdAt:auditLog.createdAt,userName:users.name,userEmail:users.email,
  }).from(auditLog).leftJoin(users,eq(auditLog.userId,users.id)).orderBy(desc(auditLog.createdAt)).limit(limit)
}

/* ─────────────────────────── vídeos curados ─────────────────────────── */

function youtubeIdOf(url:string):string|null{
  const match=url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/)
  return match?.[1]??null
}

export async function listVideos(){
  return db.select({
    id:videos.id,title:videos.title,youtubeUrl:videos.youtubeUrl,component:videos.component,
    approved:videos.approved,createdAt:videos.createdAt,vehicleId:videos.vehicleId,
    vehicleMake:vehicles.make,vehicleModel:vehicles.model,engineCode:vehicles.engineCode,
  }).from(videos).leftJoin(vehicles,eq(videos.vehicleId,vehicles.id)).orderBy(desc(videos.createdAt)).limit(100)
}

export async function addVideo(userId:string,data:{vehicleId:string|null;youtubeUrl:string;title:string;component?:string|null}){
  const[row]=await db.insert(videos).values({
    vehicleId:data.vehicleId,youtubeUrl:data.youtubeUrl.trim(),youtubeId:youtubeIdOf(data.youtubeUrl),
    title:data.title.trim(),component:data.component?.trim()||null,approved:false,submittedBy:userId,
  }).returning()
  await audit(userId,'video.created','video',row.id,{title:row.title,vehicleId:row.vehicleId})
  return row
}

export async function setVideoApproval(userId:string,data:{id:string;approved:boolean}){
  await db.update(videos).set({approved:data.approved}).where(eq(videos.id,data.id))
  await audit(userId,data.approved?'video.approved':'video.unapproved','video',data.id,{})
  return{ok:true}
}

export async function removeVideo(userId:string,data:{id:string}){
  await db.delete(videos).where(eq(videos.id,data.id))
  await audit(userId,'video.removed','video',data.id,{})
  return{ok:true}
}

/* ─────────────────────────── perfil e LGPD ─────────────────────────── */

export async function getMyProfile(userId:string){
  const[user]=await db.select({id:users.id,name:users.name,email:users.email,role:users.role,createdAt:users.createdAt}).from(users).where(eq(users.id,userId)).limit(1)
  if(!user)throw new Error('Usuário não encontrado.')
  const counters=rowsOf(await db.execute(sql`
    select
      (select count(*) from documents where owner_id=${userId})::int documents,
      (select count(*) from answers where user_id=${userId})::int answers,
      (select count(*) from tips where author_id=${userId})::int tips`))
  const row=counters[0]??{documents:0,answers:0,tips:0}
  return{...user,documents:Number(row.documents),answers:Number(row.answers),tips:Number(row.tips)}
}

export async function exportMyData(userId:string){
  const[user]=await db.select({id:users.id,name:users.name,email:users.email,role:users.role,createdAt:users.createdAt}).from(users).where(eq(users.id,userId)).limit(1)
  if(!user)throw new Error('Usuário não encontrado.')
  const[myDocuments,myAnswers,myTips,myTipVotes,myAnswerVotes]=await Promise.all([
    db.select({id:documents.id,title:documents.title,sourceType:documents.sourceType,visibility:documents.visibility,status:documents.status,pageCount:documents.pageCount,chunkCount:documents.chunkCount,createdAt:documents.createdAt}).from(documents).where(eq(documents.ownerId,userId)),
    db.select().from(answers).where(eq(answers.userId,userId)),
    db.select().from(tips).where(eq(tips.authorId,userId)),
    db.select({tipId:tipVotes.tipId,worked:tipVotes.worked,createdAt:tipVotes.createdAt}).from(tipVotes).where(eq(tipVotes.userId,userId)),
    db.select({answerId:answerVotes.answerId,worked:answerVotes.worked,createdAt:answerVotes.createdAt}).from(answerVotes).where(eq(answerVotes.userId,userId)),
  ])
  await audit(userId,'account.exported','user',userId,{documents:myDocuments.length,answers:myAnswers.length,tips:myTips.length})
  return{
    exportedAt:new Date().toISOString(),notice:'Exportação de dados pessoais do Manuauto (LGPD, art. 18). Documentos PDF não são incluídos; use a biblioteca para baixá-los.',
    user,documents:myDocuments,answers:myAnswers,tips:myTips,tipVotes:myTipVotes,answerVotes:myAnswerVotes,
  }
}

export async function deleteMyAccount(userId:string){
  const myDocuments=await db.select({storageKey:documents.storageKey}).from(documents).where(eq(documents.ownerId,userId))
  for(const doc of myDocuments){
    try{await storage().delete(doc.storageKey)}catch{/* objeto já ausente */}
  }
  await audit(userId,'account.deleted','user',userId,{documents:myDocuments.length})
  await db.delete(users).where(eq(users.id,userId))
  return{ok:true,removedDocuments:myDocuments.length}
}
