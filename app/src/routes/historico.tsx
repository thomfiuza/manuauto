import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useEffect,useState } from 'react'
import { BookOpen,CheckCircle2,Clock3,History,Trash2 } from 'lucide-react'
import { Layout } from '../components/Layout'
import { deleteAnswerHistory,listAnswerHistory } from '../lib/manuauto.functions'
export const Route=createFileRoute('/historico')({component:HistoryPage})
function HistoryPage(){
  const list=useServerFn(listAnswerHistory),remove=useServerFn(deleteAnswerHistory)
  const[items,setItems]=useState<any[]>([]),[more,setMore]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState('')
  async function load(offset=0){
    try{
      const page=await list({data:{offset}})
      setItems(current=>offset?[...current,...page.items]:page.items)
      setMore(page.more);setError('')
    }catch(e){setError(e instanceof Error?e.message:'Falha ao carregar.')}
    finally{setLoading(false)}
  }
  useEffect(()=>{void load(0)},[])
  async function erase(id:string){
    if(!confirm('Remover esta consulta do seu histórico?'))return
    try{await remove({data:{id}});setItems(current=>current.filter(item=>item.id!==id))}
    catch(e){setError(e instanceof Error?e.message:'Falha ao remover.')}
  }
  return <Layout>
    <header className="page-title">
      <span className="eyebrow"><History size={14}/> Consultas salvas</span>
      <h1>Histórico</h1>
      <p>Respostas e fontes usadas nas suas consultas, visíveis somente na sua conta.</p>
    </header>
    {error?<p className="error-box" role="alert">{error}</p>:null}
    {loading?<div className="empty-state"><Clock3/><p>Carregando consultas…</p></div>
    :items.length?<>
      <section className="history-list">{items.map(item=><HistoryCard key={item.id} item={item} onDelete={()=>erase(item.id)}/>)}</section>
      {more?<div className="load-more"><button onClick={()=>void load(items.length)}>Carregar mais consultas</button></div>:null}
    </>
    :<div className="empty-state"><History size={30}/><h2>Nenhuma consulta registrada</h2><p>As próximas respostas fundamentadas aparecerão aqui.</p></div>}
  </Layout>
}
function HistoryCard({item,onDelete}:{item:any;onDelete:()=>void}){
  const sources=Array.isArray(item.sources)?item.sources:[]
  const date=new Intl.DateTimeFormat('pt-BR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(item.createdAt))
  return <details className="history-card">
    <summary>
      <div className="history-icon"><BookOpen size={17}/></div>
      <div>
        <strong>{item.question}</strong>
        <span>{[item.vehicleMake,item.vehicleModel,item.engineCode].filter(Boolean).join(' · ')||'Sem veículo'} · {date}</span>
      </div>
      <span className="history-source-count">{sources.length} fontes</span>
    </summary>
    <div className="history-detail">
      {item.confirmations>0||item.rejections>0?
        <p className="history-feedback"><CheckCircle2 size={13}/> Confirmações: {item.confirmations} · Sem efeito: {item.rejections}</p>:null}
      <p>{item.answer}</p>
      {sources.length?
        <div className="history-sources">{sources.map((source:any,index:number)=>
          <div key={`${source.documentId}-${index}`}>
            <b>[{index+1}] {source.title}</b>
            <span>Página {source.page??'—'}{source.section?` · ${source.section}`:''}</span>
            <p>{source.excerpt}</p>
          </div>)}
        </div>
      :<p className="history-no-source">A resposta não registrou fontes.</p>}
      <button className="history-delete" onClick={onDelete}><Trash2 size={14}/> Remover do histórico</button>
    </div>
  </details>
}
