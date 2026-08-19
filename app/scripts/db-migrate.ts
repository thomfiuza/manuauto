import { readFile } from 'node:fs/promises'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { db,dbClient } from '../src/db/client.server'
const postgres=Boolean(process.env.DATABASE_URL?.match(/^postgres(ql)?:\/\//))
if(postgres){await migrate(db,{migrationsFolder:'./drizzle'});console.log('Migrações PostgreSQL aplicadas.');process.exit(0)}
await dbClient.exec(`create table if not exists _manuauto_migrations (name text primary key, applied_at timestamptz not null default now())`)
const name='0000_manuauto_initial'
const done=await dbClient.query(`select name from _manuauto_migrations where name=$1 or name=$2`,[name,'0000_wealthy_luke_cage'])
if(done.rows?.length){if(done.rows[0].name!==name)await dbClient.query(`update _manuauto_migrations set name=$1 where name=$2`,[name,done.rows[0].name]);console.log('PGlite já está atualizado.');process.exit(0)}
let sql=await readFile('./drizzle/0000_manuauto_initial.sql','utf8')
sql=sql.replace('CREATE EXTENSION IF NOT EXISTS vector;','').replace(/"embedding" vector\(1536\)/g,'"embedding" jsonb').replace(/CREATE INDEX "doc_chunks_embedding_hnsw_idx"[^;]+;/g,'')
for(const statement of sql.split('--> statement-breakpoint').map(x=>x.trim()).filter(Boolean))await dbClient.exec(statement)
await dbClient.query(`insert into _manuauto_migrations(name) values($1)`,[name])
console.log('Migração PGlite local aplicada.')
