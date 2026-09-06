import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { Flag,ThumbsDown,ThumbsUp,Users,Wrench } from 'lucide-react'
import { voteTip } from '../lib/manuauto.functions'
export type TipCardData={id:string;title:string;recommendation:string;engine:string;evidence?:string;status:string;confirmations:number;downvotes?:number}
export function TipCard({tip,onReport}:{tip:TipCardData;onReport?:()=>void}){
  const voteFn=useServerFn(voteTip)
  const[up,setUp]=useState(tip.confirmations),[down,setDown]=useState(tip.downvotes??0),[myVote,setMyVote]=useState<boolean|null>(null),[busy,setBusy]=useState(false),[reported,setReported]=useState(false)
  async function vote(worked:boolean){
    setBusy(true)
    try{const result=await voteFn({data:{tipId:tip.id,worked}});setUp(result.upvotes);setDown(result.downvotes);setMyVote(worked)}
    finally{setBusy(false)}
  }
  function report(){
    if(!confirm('Denunciar esta contribuição? Ela voltará para a fila de revisão.'))return
    setReported(true)
    onReport?.()
  }
  return <article className="tip-card">
    <div className="tip-heading"><span className="community-badge"><Users size={13}/> Comunidade</span><strong>{tip.title}</strong></div>
    <p>{tip.recommendation}</p>
    {tip.evidence?<p className="evidence"><Wrench size={13}/> Evidência informada: {tip.evidence}</p>:null}
    <div className="tip-meta">Motor/aplicação: {tip.engine} · {tip.status}</div>
    <p className="disclaimer">Experiência de usuário, não procedimento de fábrica. A orientação oficial permanece válida.</p>
    <div className="vote-row">
      <button className={myVote===true?'selected':''} disabled={busy} aria-pressed={myVote===true} onClick={()=>vote(true)}><ThumbsUp size={14}/> Funcionou ({up})</button>
      <button className={myVote===false?'selected':''} disabled={busy} aria-pressed={myVote===false} onClick={()=>vote(false)}><ThumbsDown size={14}/> Não funcionou ({down})</button>
      {onReport?<button className="report-button" disabled={reported} onClick={report} title="Denunciar para revisão"><Flag size={12}/> {reported?'Denunciada':'Denunciar'}</button>:null}
    </div>
  </article>
}
