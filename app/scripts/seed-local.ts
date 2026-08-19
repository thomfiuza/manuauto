import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { and,eq } from 'drizzle-orm'
import { auth } from '../src/lib/auth.server'
import { db,dbClient } from '../src/db/client.server'
import { documents,users,vehicles } from '../src/db/schema'
import { storage } from '../src/lib/storage.server'
import { processDocument } from '../src/lib/rag.server'
const email=process.env.SEED_ADMIN_EMAIL||'thomaz@manuauto.local',password=process.env.SEED_ADMIN_PASSWORD||'ManuautoLocal2026!'
let[user]=await db.select().from(users).where(eq(users.email,email)).limit(1)
if(!user){await auth.api.signUpEmail({body:{name:'Thomaz Fiuza',email,password}});[user]=await db.select().from(users).where(eq(users.email,email)).limit(1)}
if(!user)throw new Error('Não foi possível criar o usuário local.')
await db.update(users).set({role:'admin',updatedAt:new Date()}).where(eq(users.id,user.id))
const[vehicle]=await db.select().from(vehicles).where(and(eq(vehicles.make,'Renault'),eq(vehicles.model,'Symbol'),eq(vehicles.engineCode,'K4M'))).limit(1)
if(!vehicle)throw new Error('Symbol K4M não cadastrado.')
const privateManual='../../uploads/79155803-Manual-Symbol.pdf',sample='../tests/fixtures/sample-manual.pdf',source=process.env.SEED_MANUAL_PATH||(existsSync(privateManual)?privateManual:sample),isSample=source===sample,bytes=new Uint8Array(await readFile(source)),sha256=createHash('sha256').update(bytes).digest('hex')
let[doc]=await db.select().from(documents).where(and(eq(documents.ownerId,user.id),eq(documents.sha256,sha256))).limit(1)
if(!doc){const id=crypto.randomUUID(),key=`${user.id}/${id}.pdf`;await storage().put({key,bytes,contentType:'application/pdf'});[doc]=await db.insert(documents).values({id,ownerId:user.id,vehicleId:vehicle.id,title:isSample?'Manual sintético de teste':'Manual de Utilização — Renault Symbol',description:isSample?'Documento livre criado para testes automatizados.':'Manual piloto enviado pelo titular.',sourceType:'oficial',visibility:'private',status:'processing',storageKey:key,originalFilename:'Manual-Symbol.pdf',mimeType:'application/pdf',fileSize:bytes.length,sha256}).returning();await processDocument(user.id,doc.id)}
console.log(JSON.stringify({email,password,vehicle:vehicle.id,document:doc.id,notice:'Credenciais somente para desenvolvimento local.'},null,2))
await dbClient?.close?.()
await dbClient?.end?.()
process.exit(0)
