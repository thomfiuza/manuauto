import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useEffect,useState } from 'react'
import type { FormEvent } from 'react'
import { CheckCircle2,ExternalLink,Trash2,Video,XCircle } from 'lucide-react'
import { Layout } from '../components/Layout'
import { addCuratedVideo,listCuratedVideos,listVehicles,removeCuratedVideo,setCuratedVideoApproval } from '../lib/manuauto.functions'
import { useSession } from '../lib/auth-client'
export const Route=createFileRoute('/videos')({component:VideosPage})
function VideosPage(){
  const{data:session}=useSession()
  const role=(session?.user as {role?:string}|undefined)?.role
  const listFn=useServerFn(listCuratedVideos),addFn=useServerFn(addCuratedVideo),approveFn=useServerFn(setCuratedVideoApproval),removeFn=useServerFn(removeCuratedVideo),vehiclesFn=useServerFn(listVehicles)
  const[videos,setVideos]=useState<any[]>([]),[vehicles,setVehicles]=useState<any[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('')
  async function load(){
    try{const[v,vs]=await Promise.all([listFn(),vehiclesFn()]);setVideos(v);setVehicles(vs)}
    catch(e){setError(e instanceof Error?e.message:'Falha ao carregar.')}
  }
  useEffect(()=>{void load()},[])
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault()
    const f=new FormData(e.currentTarget)
    setBusy(true);setMessage('');setError('')
    try{
      await addFn({data:{
        vehicleId:String(f.get('vehicleId')||'')||null,
        youtubeUrl:String(f.get('youtubeUrl')),
        title:String(f.get('title')),
        component:String(f.get('component')||'')||null,
      }})
      e.currentTarget.reset();setMessage('Vídeo cadastrado. Aprove para exibi-lo nas consultas.');await load()
    }catch(e){setError(e instanceof Error?e.message:'Falha ao cadastrar.')}
    finally{setBusy(false)}
  }
  async function toggle(video:any){
    try{await approveFn({data:{id:video.id,approved:!video.approved}});await load()}
    catch(e){setError(e instanceof Error?e.message:'Falha ao atualizar.')}
  }
  async function remove(video:any){
    if(!confirm('Remover este vídeo da curadoria?'))return
    try{await removeFn({data:{id:video.id}});await load()}
    catch(e){setError(e instanceof Error?e.message:'Falha ao remover.')}
  }
  if(role!=='admin'&&role!=='moderator')return <Layout>
    <header className="page-title"><span className="eyebrow"><Video size={14}/> Curadoria</span><h1>Vídeos</h1></header>
    <div className="copyright-box"><XCircle/><div><strong>Área restrita</strong><p>A curadoria de vídeos é mantida pela equipe.</p></div></div>
  </Layout>
  return <Layout>
    <header className="page-title">
      <span className="eyebrow"><Video size={14}/> Curadoria</span>
      <h1>Vídeos de demonstração</h1>
      <p>Vídeos aprovados aparecem nas consultas como conteúdo externo, sempre separados da documentação.</p>
    </header>
    {message?<div className="library-message" role="status">{message}</div>:null}
    {error?<p className="error-box" role="alert">{error}</p>:null}
    <section className="upload-panel">
      <div className="form-caption"><Video/><div><strong>Novo vídeo</strong><span>Links do YouTube passam por aprovação antes de aparecer nas consultas.</span></div></div>
      <form onSubmit={submit}>
        <label>Veículo<select name="vehicleId" required><option value="">Selecione</option>{vehicles.map((v:any)=><option key={v.id} value={v.id}>{v.make} {v.model} · {v.engineCode??''}</option>)}</select></label>
        <div className="two-cols">
          <label>Título*<input name="title" required placeholder="Ex.: Troca de óleo — passo a passo"/></label>
          <label>Componente<input name="component" placeholder="Ex.: Motor 1.6 16V"/></label>
        </div>
        <label>Link do YouTube*<input name="youtubeUrl" type="url" required placeholder="https://www.youtube.com/watch?v=…"/></label>
        <button className="publish-button" disabled={busy}>{busy?'Salvando…':'Cadastrar vídeo'}</button>
      </form>
    </section>
    <section className="library-list">
      <div className="library-list-head"><div><span className="eyebrow">Curadoria</span><h2>{videos.length} vídeos · {videos.filter(v=>v.approved).length} aprovados</h2></div></div>
      {videos.length?<div className="video-admin-list">
        {videos.map(v=><article key={v.id} className={`video-admin-card ${v.approved?'is-approved':''}`}>
          <div className="video-admin-body">
            <strong>{v.title}</strong>
            <small>{[v.vehicleMake,v.vehicleModel,v.engineCode].filter(Boolean).join(' · ')||'Sem veículo'}{v.component?` · ${v.component}`:''}</small>
            <a href={v.youtubeUrl} target="_blank" rel="noreferrer">Abrir no YouTube <ExternalLink size={11}/></a>
          </div>
          <div className="video-admin-actions">
            <button onClick={()=>void toggle(v)}><CheckCircle2 size={13}/> {v.approved?'Aprovado':'Aprovar'}</button>
            <button className="danger" onClick={()=>void remove(v)}><Trash2 size={13}/></button>
          </div>
        </article>)}
      </div>:<div className="empty-state"><Video size={28}/><h3>Nenhum vídeo cadastrado</h3><p>Cadastre o primeiro link de demonstração acima.</p></div>}
    </section>
  </Layout>
}
