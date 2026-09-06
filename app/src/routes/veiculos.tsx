import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useEffect,useState } from 'react'
import type { FormEvent } from 'react'
import { Car,CarFront,CirclePlus,Gauge } from 'lucide-react'
import { Layout } from '../components/Layout'
import { createVehicle,listVehicles } from '../lib/manuauto.functions'
import { useSession } from '../lib/auth-client'
export const Route=createFileRoute('/veiculos')({component:VeiculosPage})
function VeiculosPage(){
  const{data:session}=useSession()
  const role=(session?.user as {role?:string}|undefined)?.role
  const getVehicles=useServerFn(listVehicles),create=useServerFn(createVehicle)
  const[vehicles,setVehicles]=useState<any[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('')
  async function load(){try{setVehicles(await getVehicles())}catch(e){setError(e instanceof Error?e.message:'Falha ao carregar.')}}
  useEffect(()=>{void load()},[])
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault()
    const f=new FormData(e.currentTarget)
    setBusy(true);setMessage('');setError('')
    try{
      await create({data:{
        make:String(f.get('make')),model:String(f.get('model')),
        generation:String(f.get('generation')||'')||null,version:String(f.get('version')||'')||null,
        yearStart:f.get('yearStart')?Number(f.get('yearStart')):null,yearEnd:f.get('yearEnd')?Number(f.get('yearEnd')):null,
        engineCode:String(f.get('engineCode')||'')||null,engineLabel:String(f.get('engineLabel')||'')||null,
        fuel:String(f.get('fuel')||'')||null,transmission:String(f.get('transmission')||'')||null,
        vehicleKind:String(f.get('vehicleKind')||'carro') as any,
      }})
      e.currentTarget.reset();setMessage('Veículo cadastrado no catálogo.');await load()
    }catch(e){setError(e instanceof Error?e.message:'Falha ao cadastrar.')}
    finally{setBusy(false)}
  }
  if(role!=='admin'&&role!=='moderator')return <Layout>
    <header className="page-title"><span className="eyebrow"><Car size={14}/> Catálogo</span><h1>Veículos</h1></header>
    <div className="copyright-box"><Gauge/><div><strong>Área restrita</strong><p>O catálogo é mantido pela equipe de curadoria.</p></div></div>
  </Layout>
  return <Layout>
    <header className="page-title">
      <span className="eyebrow"><Car size={14}/> Catálogo</span>
      <h1>Veículos</h1>
      <p>Cadastre carros e motos para receber manuais, dicas e vídeos compatíveis.</p>
    </header>
    {message?<div className="library-message" role="status">{message}</div>:null}
    {error?<p className="error-box" role="alert">{error}</p>:null}
    <section className="upload-panel">
      <div className="form-caption"><CirclePlus/><div><strong>Novo veículo</strong><span>Preencha marca e modelo; os demais campos são opcionais.</span></div></div>
      <form onSubmit={submit}>
        <div className="two-cols">
          <label>Marca*<input name="make" required placeholder="Ex.: Renault"/></label>
          <label>Modelo*<input name="model" required placeholder="Ex.: Symbol"/></label>
        </div>
        <div className="two-cols">
          <label>Versão<input name="version" placeholder="Ex.: Expression"/></label>
          <label>Geração<input name="generation" placeholder="Ex.: II"/></label>
        </div>
        <div className="two-cols">
          <label>Código do motor<input name="engineCode" placeholder="Ex.: K4M"/></label>
          <label>Descrição do motor<input name="engineLabel" placeholder="Ex.: 1.6 16V"/></label>
        </div>
        <div className="two-cols">
          <label>Ano inicial<input name="yearStart" type="number" min={1900} max={2100} placeholder="2015"/></label>
          <label>Ano final<input name="yearEnd" type="number" min={1900} max={2100} placeholder="2021"/></label>
        </div>
        <div className="two-cols">
          <label>Combustível<select name="fuel"><option value="">—</option><option>Gasolina</option><option>Etanol</option><option>Flex</option><option>Diesel</option><option>Elétrico</option><option>Híbrido</option></select></label>
          <label>Transmissão<select name="transmission"><option value="">—</option><option>Manual</option><option>Automática</option><option>CVT</option><option>Automatizada</option></select></label>
        </div>
        <label>Tipo<select name="vehicleKind"><option value="carro">Carro</option><option value="moto">Moto</option><option value="utilitario">Utilitário</option><option value="van">Van</option><option value="caminhonete">Caminhonete</option></select></label>
        <button className="publish-button" disabled={busy}>{busy?'Salvando…':'Cadastrar veículo'}</button>
      </form>
    </section>
    <section className="library-list">
      <div className="library-list-head"><div><span className="eyebrow">Catálogo atual</span><h2>{vehicles.length} veículos</h2></div></div>
      <div className="vehicle-grid">
        {vehicles.map(v=><article key={v.id} className="vehicle-card">
          <span className="vehicle-icon"><CarFront size={20}/></span>
          <div><strong>{v.make} {v.model}</strong>
            <small>{[v.version,v.engineLabel,v.engineCode&&`cód. ${v.engineCode}`].filter(Boolean).join(' · ')||'Sem detalhes'}</small>
            <small>{[v.yearStart&&v.yearEnd?`${v.yearStart}–${v.yearEnd}`:null,v.fuel,v.transmission,v.vehicleKind].filter(Boolean).join(' · ')}</small>
          </div>
        </article>)}
      </div>
    </section>
  </Layout>
}
