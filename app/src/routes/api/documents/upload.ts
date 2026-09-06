import { createFileRoute } from '@tanstack/react-router'
import { createHash,randomUUID } from 'node:crypto'
import { and,eq } from 'drizzle-orm'
import { auth } from '../../../lib/auth.server'
import { db } from '../../../db/client.server'
import { documents } from '../../../db/schema'
import { enqueueDocument } from '../../../lib/jobs.server'
import { audit } from '../../../lib/logger.server'
import { storage } from '../../../lib/storage.server'
import { checkRateLimit } from '../../../lib/rate-limit.server'
const MAX_SIZE=25*1024*1024
export const Route=createFileRoute('/api/documents/upload')({server:{handlers:{POST:async({request})=>{
 const session=await auth.api.getSession({headers:request.headers})
 if(!session?.user)return Response.json({error:'Não autorizado.'},{status:401})
 checkRateLimit(session.user.id,'upload',10,3_600_000)
 const form=await request.formData(),file=form.get('file'),vehicleId=String(form.get('vehicleId')||''),title=String(form.get('title')||''),visibility=String(form.get('visibility')||'private') as 'private'|'public',rights=String(form.get('rights')||'false')==='true'
 if(!(file instanceof File)||file.type!=='application/pdf')return Response.json({error:'Envie um arquivo PDF válido.'},{status:400})
 if(file.size<5||file.size>MAX_SIZE)return Response.json({error:'O PDF deve ter até 25 MB.'},{status:400})
 if(!/^[0-9a-f-]{36}$/i.test(vehicleId))return Response.json({error:'Selecione o veículo.'},{status:400})
 if(visibility==='public'&&!rights)return Response.json({error:'Confirme a autorização para compartilhar.'},{status:400})
 const bytes=new Uint8Array(await file.arrayBuffer())
 if(new TextDecoder('latin1').decode(bytes.slice(0,5))!=='%PDF-')return Response.json({error:'O conteúdo enviado não é um PDF.'},{status:400})
 const sha256=createHash('sha256').update(bytes).digest('hex'),duplicate=await db.select({id:documents.id}).from(documents).where(and(eq(documents.ownerId,session.user.id),eq(documents.sha256,sha256))).limit(1)
 if(duplicate.length)return Response.json({error:'Este documento já existe na sua biblioteca.'},{status:409})
 const id=randomUUID(),key=`${session.user.id}/${id}.pdf`
 await storage().put({key,bytes,contentType:'application/pdf'})
 let inserted=false
 try{
  const[row]=await db.insert(documents).values({id,ownerId:session.user.id,vehicleId,title:title.trim()||file.name.replace(/\.pdf$/i,''),sourceType:'comunidade',visibility,status:'processing',storageKey:key,originalFilename:file.name,mimeType:file.type,fileSize:file.size,sha256,rightsDeclaration:visibility==='public'?'Titular declarou autorização para compartilhar':null}).returning()
  inserted=true
  await audit(session.user.id,'document.uploaded','document',row.id,{title:row.title,visibility,fileSize:file.size})
  enqueueDocument(session.user.id,row.id)
  return Response.json({document:row,queued:true},{status:201})
 }catch(error){if(!inserted)await storage().delete(key);throw error}
}}}})
