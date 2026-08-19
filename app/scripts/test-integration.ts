import assert from 'node:assert/strict'
import { and,eq,sql } from 'drizzle-orm'
import { db,dbClient } from '../src/db/client.server'
import { answers,docChunks,documents,tips,users,vehicles } from '../src/db/schema'
import { answerQuestion } from '../src/lib/rag.server'
import { addTip,reviewContent,setTipVote } from '../src/lib/manuauto.service.server'
import { storage } from '../src/lib/storage.server'
const[user]=await db.select().from(users).where(eq(users.email,'thomaz@manuauto.local')).limit(1);assert(user,'Usuário seed ausente')
const[vehicle]=await db.select().from(vehicles).where(and(eq(vehicles.model,'Symbol'),eq(vehicles.engineCode,'K4M'))).limit(1);assert(vehicle,'Symbol K4M ausente')
const[doc]=await db.select().from(documents).where(eq(documents.ownerId,user.id)).limit(1);assert(doc,'Manual ausente');assert(doc.pageCount>=1);assert(doc.chunkCount>=1)
const[countRow]=await db.select({count:sql<number>`count(*)`}).from(docChunks).where(eq(docChunks.documentId,doc.id));assert(Number(countRow.count)>=1)
const pdf=await storage().get(doc.storageKey);assert.equal(new TextDecoder('latin1').decode(pdf.slice(0,5)),'%PDF-')
const answer=await answerQuestion(user.id,'pneus',vehicle.id);assert(answer.sources.length>0);assert(answer.sources.some((x:any)=>Number(x.page)>=1));if(answer.answerId)await db.delete(answers).where(eq(answers.id,answer.answerId))
const tip=await addTip(user.id,{vehicleId:vehicle.id,engineCode:'K4M',topic:'teste integração',kind:'recomendacao',title:'Teste automatizado de integração',body:'Registro temporário com conteúdo suficiente para validar moderação e votos.',partNumber:null,sourceNote:'teste local'});assert.equal(tip.status,'pending_review');await reviewContent({kind:'tip',id:tip.id,status:'approved'});const vote=await setTipVote(user.id,{tipId:tip.id,worked:true});assert.equal(vote.upvotes,1);await db.delete(tips).where(eq(tips.id,tip.id))
console.log(JSON.stringify({user:true,vehicle:true,pages:doc.pageCount,chunks:Number(countRow.count),searchSources:answer.sources.length,storage:true,moderation:true,votes:true},null,2))
await dbClient?.close?.();await dbClient?.end?.();process.exit(0)
