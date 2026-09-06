import { readFile,readdir } from 'node:fs/promises'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { db,dbClient } from '../src/db/client.server'
import { normalizeText } from '../src/lib/search-utils'

const postgres=Boolean(process.env.DATABASE_URL?.match(/^postgres(ql)?:\/\//))
if(postgres){
  await migrate(db,{migrationsFolder:'./drizzle'})
  console.log('Migrações PostgreSQL aplicadas.')
  process.exit(0)
}

await dbClient.exec(`create table if not exists _manuauto_migrations (name text primary key, applied_at timestamptz not null default now())`)
await dbClient.query(`update _manuauto_migrations set name='0000_manuauto_initial' where name='0000_wealthy_luke_cage'`)
const applied=new Set<string>(((await dbClient.query(`select name from _manuauto_migrations`)) as {rows:Array<{name:string}>}).rows.map(row=>row.name))
const files=(await readdir('./drizzle')).filter(name=>name.endsWith('.sql')).sort()
let appliedNow=0
for(const file of files){
  const name=file.replace(/\.sql$/,'')
  if(applied.has(name))continue
  let sql=await readFile(`./drizzle/${file}`,'utf8')
  sql=sql.replace('CREATE EXTENSION IF NOT EXISTS vector;','').replace(/"embedding" vector\(1536\)/g,'"embedding" jsonb').replace(/CREATE INDEX "doc_chunks_embedding_hnsw_idx"[^;]+;/g,'')
  for(const statement of sql.split('--> statement-breakpoint').map(part=>part.trim()).filter(Boolean))await dbClient.exec(statement)
  await dbClient.query(`insert into _manuauto_migrations(name) values($1)`,[name])
  appliedNow+=1
  console.log(`Migração PGlite aplicada: ${name}`)
}

// Normalização de busca para trechos existentes (retrocompatibilidade).
const pending=((await dbClient.query(`select id, content from doc_chunks where content_norm = ''`)) as {rows:Array<{id:string;content:string}>}).rows
for(const row of pending)await dbClient.query(`update doc_chunks set content_norm=$1 where id=$2::uuid`,[normalizeText(row.content),row.id])
if(pending.length)console.log(`Normalização de busca: ${pending.length} trecho(s) atualizado(s).`)

if(!appliedNow&&!pending.length)console.log('PGlite já está atualizado.')
await dbClient.close?.()
process.exit(0)
