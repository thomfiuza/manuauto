import { createFileRoute } from '@tanstack/react-router'
import { sql } from 'drizzle-orm'
import { db } from '../../db/client.server'
import { isAIConfigured } from '../../lib/ai.server'
import { queueLength } from '../../lib/jobs.server'

export const Route=createFileRoute('/api/health')({
 server:{handlers:{
  GET:async()=>{
   try{
    await db.execute(sql`select 1`)
    return Response.json({
      status:'ok',database:'ok',storage:process.env.STORAGE_DRIVER||'local',
      ai:isAIConfigured()?'configured':'optional',
      queue:{documents:queueLength()},
      runtime:{node:process.version,uptimeSeconds:Math.round(process.uptime())},
      time:new Date().toISOString(),
    })
   }catch{
    return Response.json({status:'degraded',database:'error'},{status:503})
   }
  },
 }},
})
