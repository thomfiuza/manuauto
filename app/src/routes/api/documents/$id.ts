import { createFileRoute } from '@tanstack/react-router'
import { and,eq,or } from 'drizzle-orm'
import { auth } from '../../../lib/auth.server'
import { db } from '../../../db/client.server'
import { documents } from '../../../db/schema'
import { storage } from '../../../lib/storage.server'
async function session(request:Request){return auth.api.getSession({headers:request.headers})}
export const Route=createFileRoute('/api/documents/$id')({server:{handlers:{
 GET:async({request,params})=>{const current=await session(request);if(!current?.user)return new Response('Não autorizado',{status:401});const role=(current.user as typeof current.user&{role?:string}).role,[doc]=await db.select().from(documents).where(and(eq(documents.id,params.id),or(eq(documents.ownerId,current.user.id),and(eq(documents.visibility,'public'),eq(documents.status,'approved')),['admin','moderator'].includes(role??'')?eq(documents.id,params.id):eq(documents.ownerId,current.user.id)))).limit(1);if(!doc)return new Response('Documento não encontrado',{status:404});const bytes=await storage().get(doc.storageKey);return new Response(bytes.slice().buffer as ArrayBuffer,{headers:{'Content-Type':'application/pdf','Content-Disposition':`inline; filename="${doc.originalFilename.replace(/["\r\n]/g,'_')}"`,'Cache-Control':'private, no-store'}})},
 DELETE:async({request,params})=>{const current=await session(request);if(!current?.user)return Response.json({error:'Não autorizado.'},{status:401});const[doc]=await db.select().from(documents).where(and(eq(documents.id,params.id),eq(documents.ownerId,current.user.id))).limit(1);if(!doc)return Response.json({error:'Documento não encontrado.'},{status:404});await db.delete(documents).where(eq(documents.id,doc.id));await storage().delete(doc.storageKey);const{audit}=await import('../../../lib/logger.server');await audit(current.user.id,'document.deleted','document',doc.id,{title:doc.title});return Response.json({ok:true})},
}}})
