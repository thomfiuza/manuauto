import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuth,requireStaff } from './auth-middleware'

const askSchema=z.object({question:z.string().trim().min(5),vehicleId:z.string().uuid().nullable()})
const vehicleSchema=z.object({
  make:z.string().trim().min(2).max(60),model:z.string().trim().min(2).max(60),
  generation:z.string().trim().max(60).nullable().optional(),version:z.string().trim().max(80).nullable().optional(),
  yearStart:z.number().int().min(1900).max(2100).nullable().optional(),yearEnd:z.number().int().min(1900).max(2100).nullable().optional(),
  engineCode:z.string().trim().max(40).nullable().optional(),engineLabel:z.string().trim().max(80).nullable().optional(),
  fuel:z.string().trim().max(40).nullable().optional(),transmission:z.string().trim().max(40).nullable().optional(),
  vehicleKind:z.enum(['carro','moto','utilitario','caminhonete','van']).optional(),
})
const videoSchema=z.object({
  vehicleId:z.string().uuid().nullable(),youtubeUrl:z.string().trim().url().refine(url=>/(youtube\.com|youtu\.be)/.test(url),{message:'Informe um link do YouTube.'}),
  title:z.string().trim().min(5).max(160),component:z.string().trim().max(120).nullable().optional(),
})

export const askAssistant=createServerFn({method:'POST'}).middleware([requireAuth]).validator((input:unknown)=>askSchema.parse(input)).handler(async({data,context})=>{
  const[{answerQuestion},{checkRateLimit}]=await Promise.all([import('./rag.server'),import('./rate-limit.server')])
  checkRateLimit(context.userId,'consulta',60,60_000)
  return answerQuestion(context.userId,data.question,data.vehicleId)
})

export const processDocumentFn=createServerFn({method:'POST'}).middleware([requireAuth]).validator((input:unknown)=>z.object({documentId:z.string().uuid()}).parse(input)).handler(async({data,context})=>{
  if(process.env.VERCEL){
    const{processDocument}=await import('./rag.server')
    return processDocument(context.userId,data.documentId)
  }
  const{enqueueDocument}=await import('./jobs.server')
  enqueueDocument(context.userId,data.documentId)
  return{queued:true}
})

/* ─────────────────────────── catálogo e biblioteca ─────────────────────────── */

export const listVehicles=createServerFn({method:'GET'}).handler(async()=>{const s=await import('./manuauto.service.server');return s.getVehicles()})
export const createVehicle=createServerFn({method:'POST'}).middleware([requireStaff]).validator((input:unknown)=>vehicleSchema.parse(input)).handler(async({data,context})=>{const s=await import('./manuauto.service.server');return s.createVehicle(context.userId,data)})
export const listMyDocuments=createServerFn({method:'GET'}).middleware([requireAuth]).validator((input:unknown)=>z.object({offset:z.number().int().min(0).optional()}).parse(input??{})).handler(async({data,context})=>{const s=await import('./manuauto.service.server');return s.getMyDocuments(context.userId,data.offset??0)})
export const listMyDocumentStats=createServerFn({method:'GET'}).middleware([requireAuth]).handler(async({context})=>{const s=await import('./manuauto.service.server');return s.getMyDocumentStats(context.userId)})

/* ─────────────────────────── comunidade ─────────────────────────── */

export const listTips=createServerFn({method:'GET'}).middleware([requireAuth]).validator((input:unknown)=>z.object({vehicleId:z.string().uuid().nullable().optional(),includeOwn:z.boolean().optional()}).parse(input??{})).handler(async({data,context})=>{const s=await import('./manuauto.service.server');return s.getTips(context.userId,data)})
export const createTip=createServerFn({method:'POST'}).middleware([requireAuth]).validator((input:unknown)=>z.object({vehicleId:z.string().uuid().nullable(),engineCode:z.string().max(80).nullable(),topic:z.string().min(3).max(120),kind:z.enum(['recomendacao','defeito_cronico','macete','peca','alerta']),title:z.string().min(5).max(160),body:z.string().min(15).max(5000),partNumber:z.string().max(120).nullable(),sourceNote:z.string().max(1000).nullable()}).parse(input)).handler(async({data,context})=>{
  const[s,{checkRateLimit}]=await Promise.all([import('./manuauto.service.server'),import('./rate-limit.server')])
  checkRateLimit(context.userId,'dica',20,3_600_000)
  return s.addTip(context.userId,data)
})
export const voteTip=createServerFn({method:'POST'}).middleware([requireAuth]).validator((input:unknown)=>z.object({tipId:z.string().uuid(),worked:z.boolean()}).parse(input)).handler(async({data,context})=>{
  const[s,{checkRateLimit}]=await Promise.all([import('./manuauto.service.server'),import('./rate-limit.server')])
  checkRateLimit(context.userId,'voto',100,60_000)
  return s.setTipVote(context.userId,data)
})
export const reportTip=createServerFn({method:'POST'}).middleware([requireAuth]).validator((input:unknown)=>z.object({tipId:z.string().uuid()}).parse(input)).handler(async({data,context})=>{
  const[s,{checkRateLimit}]=await Promise.all([import('./manuauto.service.server'),import('./rate-limit.server')])
  checkRateLimit(context.userId,'denuncia',20,3_600_000)
  return s.reportTip(context.userId,data.tipId)
})

/* ─────────────────────────── histórico e confirmação ─────────────────────────── */

export const listAnswerHistory=createServerFn({method:'GET'}).middleware([requireAuth]).validator((input:unknown)=>z.object({offset:z.number().int().min(0).optional()}).parse(input??{})).handler(async({data,context})=>{const s=await import('./manuauto.service.server');return s.getAnswerHistory(context.userId,data.offset??0)})
export const deleteAnswerHistory=createServerFn({method:'POST'}).middleware([requireAuth]).validator((input:unknown)=>z.object({id:z.string().uuid()}).parse(input)).handler(async({data,context})=>{const s=await import('./manuauto.service.server');return s.removeAnswer(context.userId,data.id)})
export const voteAnswer=createServerFn({method:'POST'}).middleware([requireAuth]).validator((input:unknown)=>z.object({answerId:z.string().uuid(),worked:z.boolean()}).parse(input)).handler(async({data,context})=>{
  const[s,{checkRateLimit}]=await Promise.all([import('./manuauto.service.server'),import('./rate-limit.server')])
  checkRateLimit(context.userId,'voto',100,60_000)
  return s.setAnswerVote(context.userId,data)
})

/* ─────────────────────────── moderação e auditoria ─────────────────────────── */

export const moderationQueue=createServerFn({method:'GET'}).middleware([requireStaff]).handler(async()=>{const s=await import('./manuauto.service.server');return s.getModerationQueue()})
export const moderateContent=createServerFn({method:'POST'}).middleware([requireStaff]).validator((input:unknown)=>z.object({kind:z.enum(['document','tip']),id:z.string().uuid(),status:z.enum(['approved','rejected'])}).parse(input)).handler(async({data,context})=>{const s=await import('./manuauto.service.server');return s.reviewContent(context.userId,data)})
export const listAuditTrail=createServerFn({method:'GET'}).middleware([requireStaff]).handler(async()=>{const s=await import('./manuauto.service.server');return s.listAuditLog()})

/* ─────────────────────────── vídeos curados ─────────────────────────── */

export const listCuratedVideos=createServerFn({method:'GET'}).middleware([requireStaff]).handler(async()=>{const s=await import('./manuauto.service.server');return s.listVideos()})
export const addCuratedVideo=createServerFn({method:'POST'}).middleware([requireStaff]).validator((input:unknown)=>videoSchema.parse(input)).handler(async({data,context})=>{
  const[s,{checkRateLimit}]=await Promise.all([import('./manuauto.service.server'),import('./rate-limit.server')])
  checkRateLimit(context.userId,'video',50,3_600_000)
  return s.addVideo(context.userId,data)
})
export const setCuratedVideoApproval=createServerFn({method:'POST'}).middleware([requireStaff]).validator((input:unknown)=>z.object({id:z.string().uuid(),approved:z.boolean()}).parse(input)).handler(async({data,context})=>{const s=await import('./manuauto.service.server');return s.setVideoApproval(context.userId,data)})
export const removeCuratedVideo=createServerFn({method:'POST'}).middleware([requireStaff]).validator((input:unknown)=>z.object({id:z.string().uuid()}).parse(input)).handler(async({data,context})=>{const s=await import('./manuauto.service.server');return s.removeVideo(context.userId,data)})

/* ─────────────────────────── perfil e LGPD ─────────────────────────── */

export const getMyProfile=createServerFn({method:'GET'}).middleware([requireAuth]).handler(async({context})=>{const s=await import('./manuauto.service.server');return s.getMyProfile(context.userId)})
export const exportMyData=createServerFn({method:'GET'}).middleware([requireAuth]).handler(async({context})=>{const s=await import('./manuauto.service.server');return s.exportMyData(context.userId)})
export const deleteMyAccount=createServerFn({method:'POST'}).middleware([requireAuth]).handler(async({context})=>{const s=await import('./manuauto.service.server');return s.deleteMyAccount(context.userId)})
