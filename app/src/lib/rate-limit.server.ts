type Entry={count:number;resetAt:number}
const state=(globalThis as typeof globalThis&{__manuautoRateLimit?:Map<string,Entry>}).__manuautoRateLimit??=new Map<string,Entry>()
export function checkRateLimit(subject:string,scope:string,limit:number,windowMs:number){const key=`${scope}:${subject}`,now=Date.now(),entry=state.get(key);if(!entry||entry.resetAt<=now){state.set(key,{count:1,resetAt:now+windowMs});return}if(entry.count>=limit)throw new Error('Limite temporário atingido. Tente novamente mais tarde.');entry.count++}
