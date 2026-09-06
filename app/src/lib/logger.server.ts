import { db } from '../db/client.server'
import { auditLog } from '../db/schema'

/** Log estruturado em JSON (uma linha por evento). */
export function logEvent(event:string,data:Record<string,unknown>={}):void{
  try{
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ts:new Date().toISOString(),event,...data}))
  }catch{/* log nunca deve derrubar a requisição */}
}

/**
 * Trilha de auditoria: registra o evento no log estruturado e na tabela audit_log.
 * user_id é texto sem FK para preservar o histórico após exclusão de conta (LGPD).
 */
export async function audit(userId:string|null,action:string,targetType?:string|null,targetId?:string|null,metadata:Record<string,unknown>={}):Promise<void>{
  logEvent(action,{userId:userId??null,targetType:targetType??null,targetId:targetId??null,...metadata})
  try{
    await db.insert(auditLog).values({userId:userId??null,action,targetType:targetType??null,targetId:targetId??null,metadata})
  }catch(error){
    logEvent('audit.write_failed',{action,error:error instanceof Error?error.message:'erro desconhecido'})
  }
}
