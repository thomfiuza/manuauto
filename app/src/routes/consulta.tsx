import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useEffect,useState } from 'react'
import type { FormEvent } from 'react'
import { AlertTriangle,BookOpen,ExternalLink,Plus,Search,Sparkles,ThumbsDown,ThumbsUp,Video } from 'lucide-react'
import { Layout } from '../components/Layout'
import { AnswerBody } from '../components/AnswerBody'
import { TipCard } from '../components/TipCard'
import { askAssistant,createTip,listVehicles,reportTip,voteAnswer } from '../lib/manuauto.functions'
export const Route=createFileRoute('/consulta')({component:ConsultaPage})
const suggestions=['Qual óleo devo usar?','Pressão dos pneus','Luz da injeção acesa','Onde ficam os fusíveis?']
function ConsultaPage(){
  const ask=useServerFn(askAssistant),getVehicles=useServerFn(listVehicles),sendVote=useServerFn(voteAnswer),sendReport=useServerFn(reportTip)
  const[vehicles,setVehicles]=useState<any[]>([]),[vehicleId,setVehicleId]=useState<string|null>(null),[query,setQuery]=useState(''),[data,setData]=useState<any>(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[modal,setModal]=useState(false),[feedback,setFeedback]=useState<any>(null)
  useEffect(()=>{void getVehicles().then(v=>{setVehicles(v);const symbol=v.find((x:any)=>x.make==='Renault'&&x.model==='Symbol'&&x.engineCode==='K4M');setVehicleId(symbol?.id??v[0]?.id??null)})},[])
  const vehicle=vehicles.find(v=>v.id===vehicleId)
  async function runSearch(value=query){
    if(value.trim().length<5)return
    setQuery(value);setLoading(true);setError('');setFeedback(null)
    try{setData(await ask({data:{question:value,vehicleId}}))}
    catch(e){setError(e instanceof Error?e.message:'Falha na consulta.')}
    finally{setLoading(false)}
  }
  async function confirmSolution(worked:boolean){
    if(!data?.answerId)return
    try{setFeedback(await sendVote({data:{answerId:data.answerId,worked}}))}
    catch(e){setError(e instanceof Error?e.message:'Falha ao registrar.')}
  }
  async function denounce(tipId:string){
    try{await sendReport({data:{tipId}});setData((current:any)=>current?{...current,tips:current.tips.filter((t:any)=>t.id!==tipId)}:current)}
    catch(e){setError(e instanceof Error?e.message:'Falha ao denunciar.')}
  }
  return <Layout>
    <section className="vehicle-strip">
      <div><span>Veículo selecionado</span><select className="vehicle-select" aria-label="Selecionar veículo" value={vehicleId??''} onChange={e=>setVehicleId(e.target.value||null)}>{vehicles.map(v=><option key={v.id} value={v.id}>{v.make} {v.model} · {v.version??''} · {v.engineCode??''}</option>)}</select></div>
      <div><span>Motorização</span><strong>{vehicle?.engineLabel??'Selecione o veículo'}</strong></div>
      <span className="private-pill">Acesso por sessão</span>
    </section>
    <section className="hero-copy">
      <span className="eyebrow"><Sparkles size={14}/> Assistente técnico rastreável</span>
      <h1>Consulte o manual.<br/><em>Complete com experiência.</em></h1>
      <p>A informação documental permanece visível e separada das contribuições comunitárias.</p>
    </section>
    <section className="search-card">
      <form onSubmit={e=>{e.preventDefault();void runSearch()}}>
        <Search size={21} aria-hidden="true"/>
        <input value={query} onChange={e=>setQuery(e.target.value)} aria-label="Descreva a dúvida, sintoma ou código de falha" placeholder="Descreva a dúvida, sintoma ou código de falha…"/>
        <button disabled={loading||query.trim().length<5}>{loading?'Buscando…':'Consultar'}</button>
      </form>
      <div className="suggestions">{suggestions.map(item=><button key={item} onClick={()=>void runSearch(item)}>{item}</button>)}</div>
    </section>
    {error?<div className="error-box" role="alert"><AlertTriangle size={18}/>{error}</div>:null}
    {data?(
    <section className="answer-panel" aria-live="polite">
      <div className="answer-header">
        <div><span className="eyebrow">Resposta atual · busca {data.searchMode}</span><h2>{data.sources.length?'Encontrado com fontes':'Não localizado'}</h2></div>
        <span className="source-count">{data.sources.length} páginas relacionadas</span>
      </div>
      {data.answerId?(
        <div className="answer-feedback">
          <span>{feedback?'Registro salvo. Isso ajuda a medir a qualidade das respostas.':'Isso resolveu a sua dúvida?'}</span>
          {feedback?(
            <small>{feedback.confirmations} confirmação(ões) · {feedback.rejections} sem efeito</small>
          ):(
            <div className="feedback-buttons">
              <button className="feedback-yes" onClick={()=>void confirmSolution(true)}><ThumbsUp size={14}/> Resolveu</button>
              <button className="feedback-no" onClick={()=>void confirmSolution(false)}><ThumbsDown size={14}/> Não resolveu</button>
            </div>
          )}
        </div>
      ):null}
      <AnswerBody text={data.answer} claims={data.sources.slice(0,3).map((s:any)=>({text:s.title,citations:[{pdf_page:s.page??0,manual_page:s.section??null}]}))}/>
      <div className="section-title"><div><BookOpen size={18}/><h3>O que consta nos documentos</h3></div><small>Confira sempre a página original</small></div>
      <div className="manual-results">{data.sources.map((s:any,i:number)=>
        <article className="manual-result" key={`${s.documentId}-${i}`}>
          <div className="result-number">{s.page??'—'}</div>
          <div className="result-body"><strong>{s.section??s.title}</strong><p>{s.excerpt}</p><div className="tags"><span>{s.sourceType}</span></div></div>
          <a href={`/api/documents/${s.documentId}#page=${s.page??1}`} target="_blank" rel="noreferrer">Ver página <ExternalLink size={13}/></a>
        </article>)}
      </div>
      {data.videos?.length?(
        <>
          <div className="section-title"><div><Video size={18}/><h3>Demonstrações em vídeo</h3></div><small>Conteúdo externo curado pela equipe</small></div>
          <div className="video-list">{data.videos.map((v:any)=>
            <a className="video-card" key={v.id} href={v.url} target="_blank" rel="noreferrer">
              <span className="video-badge"><Video size={15}/></span>
              <span className="video-body"><strong>{v.title}</strong>{v.component?<small>{v.component}</small>:null}</span>
              <ExternalLink size={14}/>
            </a>)}
          </div>
        </>
      ):null}
      <div className="section-title community-title"><div><Sparkles size={18}/><h3>Experiência da comunidade</h3></div><button onClick={()=>setModal(true)}><Plus size={15}/> Recomendar</button></div>
      {data.tips.length?
        <div className="tips-grid">{data.tips.map((t:any)=><TipCard key={t.id} tip={{id:t.id,title:t.title,recommendation:t.body,engine:t.engineCode??'Aplicação do veículo',evidence:t.sourceNote??'',status:'Aprovada',confirmations:t.upvotes,downvotes:t.downvotes}} onReport={()=>void denounce(t.id)}/>)}</div>
        :<div className="empty-community"><p>Nenhuma sugestão aprovada relacionada.</p><button onClick={()=>setModal(true)}>Contribuir</button></div>}
      <div className="decision-note"><AlertTriangle size={18}/><p><strong>Você decide como usar a sugestão.</strong> Verifique aplicação, evidência, riscos e revisão.</p></div>
    </section>):null}
    {modal?<TipModal vehicleId={vehicleId} query={query} onClose={()=>setModal(false)} onSaved={()=>setModal(false)}/>:null}
  </Layout>
}
function TipModal({vehicleId,query,onClose,onSaved}:{vehicleId:string|null;query:string;onClose:()=>void;onSaved:()=>void}){
  const create=useServerFn(createTip),[busy,setBusy]=useState(false),[error,setError]=useState('')
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault()
    const f=new FormData(e.currentTarget)
    if(!f.get('ack'))return setError('Confirme a natureza comunitária.')
    setBusy(true)
    try{
      await create({data:{vehicleId,engineCode:String(f.get('engine')||'')||null,topic:String(f.get('symptom')||f.get('title')),kind:'recomendacao',title:String(f.get('title')),body:String(f.get('recommendation')),partNumber:null,sourceNote:String(f.get('evidence')||'')||null}})
      onSaved()
    }catch(e){setError(e instanceof Error?e.message:'Falha ao salvar.')}
    finally{setBusy(false)}
  }
  return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Recomendar informação" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <form className="tip-modal" onSubmit={submit}>
      <div className="modal-heading"><div><span className="eyebrow">Contribuição comunitária</span><h2>Recomendar informação</h2></div><button type="button" aria-label="Fechar" onClick={onClose}>×</button></div>
      <label>Título<input name="title" defaultValue={query} required/></label>
      <div className="two-cols"><label>Motor<input name="engine" placeholder="Ex.: K4M"/></label><label>Assunto<input name="symptom" defaultValue={query}/></label></div>
      <label>Recomendação<textarea name="recommendation" rows={5} required/></label>
      <label>Evidência<input name="evidence"/></label>
      <label className="ack"><input type="checkbox" name="ack"/> Entendo que não é instrução oficial.</label>
      {error?<p className="form-error" role="alert">{error}</p>:null}
      <div className="modal-actions"><button type="button" className="outline" onClick={onClose}>Cancelar</button><button disabled={busy}>{busy?'Salvando…':'Enviar para revisão'}</button></div>
    </form>
  </div>
}
