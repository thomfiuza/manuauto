import { cp,mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'

/**
 * Backup local do Manuauto (modo PGlite): copia o banco e os arquivos enviados
 * para uma pasta com data/hora. Pare o servidor antes de executar em produção local.
 * Em produção com PostgreSQL, prefira pg_dump + política de retenção do storage.
 */
const stamp=new Date().toISOString().replace(/[:.]/g,'-').slice(0,19)
const target=`../backups/manuauto-${stamp}`
await mkdir(target,{recursive:true})
const sources:Array<[string,string]>=[
  ['banco',process.env.PGLITE_DATA_DIR||'./.data/pglite'],
  ['uploads',process.env.LOCAL_STORAGE_DIR||'./.data/uploads'],
]
let copied=0
for(const[label,dir]of sources){
  if(existsSync(dir)){await cp(dir,`${target}/${label}`,{recursive:true});copied+=1;console.log(`Copiado: ${dir} → ${target}/${label}`)}
  else console.log(`Ignorado (não existe): ${dir}`)
}
console.log(JSON.stringify({backup:target,items:copied,notice:'Guarde esta pasta em local seguro. Restaure copiando de volta com o servidor parado.'},null,2))
