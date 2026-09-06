import { logEvent } from './logger.server'

/**
 * Fila em processo para processamento assíncrono de documentos.
 * O upload responde imediatamente e o PDF é processado em segundo plano;
 * o status fica visível na biblioteca (processando/pronto/falha).
 * Caminho de evolução: extrair este runner para um worker dedicado
 * (processo separado + fila persistente) sem alterar as telas.
 */
type DocumentJob={userId:string;documentId:string}
const state=(globalThis as typeof globalThis&{__manuautoJobs?:{queue:DocumentJob[];running:boolean}}).__manuautoJobs??={queue:[],running:false}

export function queueLength():number{
  return state.queue.length+(state.running?1:0)
}

export function enqueueDocument(userId:string,documentId:string):void{
  state.queue.push({userId,documentId})
  logEvent('job.enqueued',{documentId,queue:state.queue.length})
  void runQueue()
}

async function runQueue():Promise<void>{
  if(state.running)return
  state.running=true
  try{
    while(state.queue.length){
      const job=state.queue.shift()
      if(!job)break
      try{
        const{processDocument}=await import('./rag.server')
        await processDocument(job.userId,job.documentId)
      }catch(error){
        // processDocument já marca o documento como failed com mensagem; aqui só registramos.
        logEvent('job.failed',{documentId:job.documentId,error:error instanceof Error?error.message:'erro desconhecido'})
      }
    }
  }finally{
    state.running=false
  }
}
