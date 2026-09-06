import { createFileRoute,Link,useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useEffect,useState } from 'react'
import { AlertTriangle,Download,FileText,Lightbulb,LogOut,Search,ShieldAlert,UserCircle2 } from 'lucide-react'
import { Layout } from '../components/Layout'
import { deleteMyAccount,exportMyData,getMyProfile } from '../lib/manuauto.functions'
import { signOut,useSession } from '../lib/auth-client'
export const Route=createFileRoute('/perfil')({component:PerfilPage})
const roleLabels:Record<string,string>={admin:'Administrador',moderator:'Moderador',user:'Usuário'}
function PerfilPage(){
  const navigate=useNavigate()
  const{data:session}=useSession()
  const profileFn=useServerFn(getMyProfile),exportFn=useServerFn(exportMyData),deleteFn=useServerFn(deleteMyAccount)
  const[profile,setProfile]=useState<any>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[confirmText,setConfirmText]=useState('')
  useEffect(()=>{void profileFn().then(setProfile).catch(e=>setError(e instanceof Error?e.message:'Falha ao carregar.'))},[])
  async function exportData(){
    setBusy(true);setError('')
    try{
      const data=await exportFn()
      const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'})
      const url=URL.createObjectURL(blob),link=document.createElement('a')
      link.href=url;link.download=`manuauto-meus-dados-${new Date().toISOString().slice(0,10)}.json`
      link.click();URL.revokeObjectURL(url)
    }catch(e){setError(e instanceof Error?e.message:'Falha ao exportar.')}
    finally{setBusy(false)}
  }
  async function destroyAccount(){
    if(confirmText.trim().toUpperCase()!=='EXCLUIR')return
    setBusy(true);setError('')
    try{
      await deleteFn()
      await signOut()
      void navigate({to:'/'})
    }catch(e){setError(e instanceof Error?e.message:'Falha ao excluir a conta.')}
    finally{setBusy(false)}
  }
  async function logout(){await signOut();void navigate({to:'/auth'})}
  const since=profile?new Intl.DateTimeFormat('pt-BR',{dateStyle:'long'}).format(new Date(profile.createdAt)):''
  return <Layout>
    <header className="page-title">
      <span className="eyebrow"><UserCircle2 size={14}/> Sua conta</span>
      <h1>Perfil</h1>
      <p>Seus dados, suas estatísticas e seus direitos de titular (LGPD).</p>
    </header>
    {error?<p className="error-box" role="alert">{error}</p>:null}
    <section className="profile-grid">
      <article className="profile-card">
        <UserCircle2 size={30}/>
        <strong>{session?.user?.name??profile?.name??'—'}</strong>
        <span>{session?.user?.email??profile?.email??'—'}</span>
        <small>{profile?roleLabels[profile.role]??profile.role:''} · no Manuauto desde {since}</small>
        <button className="profile-logout" onClick={()=>void logout()}><LogOut size={14}/> Sair da conta</button>
      </article>
      <article className="profile-stat"><Search size={20}/><strong>{profile?.answers??'—'}</strong><span>consultas respondidas</span></article>
      <article className="profile-stat"><FileText size={20}/><strong>{profile?.documents??'—'}</strong><span>documentos enviados</span></article>
      <article className="profile-stat"><Lightbulb size={20}/><strong>{profile?.tips??'—'}</strong><span>contribuições</span></article>
    </section>
    <section className="upload-panel">
      <div className="form-caption"><Download/><div><strong>Seus dados (LGPD)</strong><span>Exporte um arquivo JSON com suas consultas, contribuições, votos e metadados de documentos.</span></div></div>
      <button className="publish-button" disabled={busy} onClick={()=>void exportData()}>{busy?'Aguarde…':'Baixar meus dados'}</button>
    </section>
    <section className="upload-panel danger-panel">
      <div className="form-caption"><ShieldAlert/><div><strong>Zona de exclusão da conta</strong><span>Remove sua conta, documentos, arquivos armazenados, consultas e contribuições. A trilha de auditoria é preservada sem identificar você.</span></div></div>
      <div className="two-cols">
        <label>Digite EXCLUIR para confirmar<input value={confirmText} onChange={e=>setConfirmText(e.target.value)} placeholder="EXCLUIR" aria-label="Digite EXCLUIR para confirmar a exclusão"/></label>
        <button className="danger-button" disabled={busy||confirmText.trim().toUpperCase()!=='EXCLUIR'} onClick={()=>void destroyAccount()}><AlertTriangle size={14}/> Excluir definitivamente</button>
      </div>
    </section>
    <p className="legal-links">Documentos: <Link to="/termos">Termos de uso</Link> · <Link to="/privacidade">Política de privacidade</Link></p>
  </Layout>
}
