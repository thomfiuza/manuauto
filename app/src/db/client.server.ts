import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres'
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite'
import { PGlite } from '@electric-sql/pglite'
import { Pool } from 'pg'
import { dirname } from 'node:path'
import { mkdirSync } from 'node:fs'
import * as schema from './schema'

const url=process.env.DATABASE_URL?.trim()
if(process.env.NODE_ENV==='production'&&!url&&process.env.ALLOW_PGLITE_PRODUCTION!=='true')throw new Error('DATABASE_URL é obrigatório em produção.')
const globalDb=globalThis as typeof globalThis&{__manuautoDb?:any;__manuautoDbClient?:any}
function create(){
 if(url?.startsWith('postgres://')||url?.startsWith('postgresql://')){const pool=new Pool({connectionString:url,max:10,idleTimeoutMillis:30_000,connectionTimeoutMillis:5_000});globalDb.__manuautoDbClient=pool;return drizzleNode(pool,{schema})}
 const location=process.env.PGLITE_DATA_DIR||'./.data/pglite'
 mkdirSync(dirname(location),{recursive:true})
 const client=new PGlite(location)
 globalDb.__manuautoDbClient=client
 return drizzlePglite(client,{schema})
}
export const db:any=globalDb.__manuautoDb??(globalDb.__manuautoDb=create())
export const dbClient:any=globalDb.__manuautoDbClient
export type Database=typeof db
