import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useEffect,useState } from 'react'
import { CheckCircle2,ClipboardCheck,Clock3,ScrollText,ShieldAlert,X } from 'lucide-react'
import { Layout } from '../components/Layout'
import { listAuditTrail,moderateContent,moderationQueue } from '../lib/manuauto.functions'
export const Route=createFileRoute('/moderacao')({component:ModeracaoPage})
const actionLabels:Record<string,string>={
  'document.uploaded':'Documento enviado','document.processed':'Documento processado','document.failed':'Falha no processamento','document.deleted':'Documento excluído',
  'tip.created':'Contribuição criada','tip.reported':'Contribuição denunciada',
  'answer.voted':'Confirmação de resposta','moderation.decision':'Decisão de moderação',
  'vehicle.created':'Veículo cadastrado','video.created':'Vídeo cadastrado','video.approved':'Vídeo aprovado','video.unapproved':'Vídeo desaprovado','video.removed':'Vídeo removido',
  'account.exported':'Dados exportados (LGPD)','account.deleted':'Conta excluída (LGPD)',
}
function ModeracaoPage(){
  const queueFn=useServerFn(moderationQueue),decideFn=useServerFn(moderateContent),auditFn=useServerFn(listAuditTrail)
  const[docs,setDocs]=useState<any[]>([]),[tips,setTips]=useState<any[]>([]),[entries,setEntries]=useState<any[]>([]),[error,setError]=useState('')
  async function load(){
    try{const q=await queueFn();setDocs(q.documents);setTips(q.tips);setError('')}
    catch(e){setError(e instanceof Error?e.message:'Acesso restrito.');return}
    try{setEntries(await auditFn())}catch{/* trilha opcional */}
  }
  useEffect(()=>{void load()},[])
  async function decide(kind:'document'|'tip',id:string,status:'approved'|'rejected'){
    try{await decideFn({data:{kind,id,status}});await load()}
    catch(e){setError(e instanceof Error?e.message:'Falha ao revisar.')}
  }
  return <Layout>
    <header className="page-title">
      <span className="eyebrow"><ClipboardCheck size={14}/> Curadoria técnica</span>
      <h1>Fila de revisão</h1>
      <p>Conteúdo público só participa das consultas após análise da equipe.</p>
    </header>
    {error?<div className="copyright-box"><ShieldAlert/><div><strong>Área restrita</strong><p>{error}</p></div></div>:<>
      <section className="review-stats">
        <div><Clock3/><strong>{docs.length+tips.length}</strong><span>Aguardando revisão</span></div>
        <div><CheckCircle2/><strong>{entries.filter(e=>e.action==='moderation.decision').length}</strong><span>Decisões registradas</span></div>
        <div><ShieldAlert/><strong>{entries.filter(e=>e.action==='tip.reported').length}</strong><span>Denúncias recentes</span></div>
      </section>
      <div className="review-list">
        {docs.map(d=><Review key={d.id} title={d.title} body={`${d.pageCount} páginas · ${d.rightsDeclaration??'sem declaração'}`} onYes={()=>decide('document',d.id,'approved')} onNo={()=>decide('document',d.id,'rejected')}/>)}
        {tips.map(t=><Review key={t.id} title={t.title} body={`${t.body} · ${t.engineCode??'motor não informado'}`} onYes={()=>decide('tip',t.id,'approved')} onNo={()=>decide('tip',t.id,'rejected')}/>)}
      </div>
      {!docs.length&&!tips.length?<div className="empty-state"><ClipboardCheck/><h2>A fila está vazia</h2></div>:null}
      <section className="audit-section">
        <div className="section-title"><div><ScrollText size={18}/><h3>Atividade recente (trilha de auditoria)</h3></div><small>Últimos 60 eventos</small></div>
        {entries.length?<div className="audit-list">
          {entries.map(entry=>{
            const date=new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(entry.createdAt))
            return <div key={entry.id} className="audit-entry">
              <span className="audit-action">{actionLabels[entry.action]??entry.action}</span>
              <span className="audit-target">{entry.targetType?`${entry.targetType}${entry.targetId?` · ${String(entry.targetId).slice(0,8)}…`:''}`:'—'}</span>
              <span className="audit-user">{entry.userName??entry.userEmail??(entry.userId?'usuário removido':'sistema')}</span>
              <time>{date}</time>
            </div>}
          )}
        </div>:<div className="empty-state"><ScrollText/><h2>Sem eventos registrados</h2></div>}
      </section>
    </>}
  </Layout>
}
function Review({title,body,onYes,onNo}:{title:string;body:string;onYes:()=>void;onNo:()=>void}){
  return <article>
    <div><span className="community-badge">Pendente</span><h3>{title}</h3><p>{body}</p></div>
    <div className="review-actions">
      <button onClick={onYes}><CheckCircle2 size={14}/> Aprovar</button>
      <button onClick={onNo}><X size={14}/> Recusar</button>
    </div>
  </article>
}
