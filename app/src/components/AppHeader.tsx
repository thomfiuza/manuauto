import { Link,useNavigate } from '@tanstack/react-router'
import { BookOpen,Car,ClipboardCheck,History,Lightbulb,Search,UserCircle2,Video,Wrench } from 'lucide-react'
import { signOut,useSession } from '../lib/auth-client'
const links=[{to:'/consulta',label:'Consultar',icon:Search},{to:'/historico',label:'Histórico',icon:History},{to:'/biblioteca',label:'Biblioteca',icon:BookOpen},{to:'/dicas',label:'Dicas',icon:Lightbulb},{to:'/moderacao',label:'Revisão',icon:ClipboardCheck}] as const
const staffLinks=[{to:'/veiculos',label:'Veículos',icon:Car},{to:'/videos',label:'Vídeos',icon:Video}] as const
export function AppHeader(){
  const navigate=useNavigate()
  const{data:session}=useSession()
  const role=(session?.user as {role?:string}|undefined)?.role
  const isStaff=role==='admin'||role==='moderator'
  async function logout(){await signOut();void navigate({to:'/auth'})}
  return <header className="app-header">
    <div className="header-inner">
      <Link to="/consulta" className="brand" aria-label="Manuauto — início"><span className="brand-mark"><Wrench size={18}/></span><span><b>Manuauto</b><small>Conhecimento que move</small></span></Link>
      <nav className="main-nav" aria-label="Navegação principal">
        {links.map(({to,label,icon:Icon})=><Link key={to} to={to} activeProps={{className:'active'}}><Icon size={16}/><span>{label}</span></Link>)}
        {isStaff?staffLinks.map(({to,label,icon:Icon})=><Link key={to} to={to} activeProps={{className:'active'}} className="staff-link"><Icon size={16}/><span>{label}</span></Link>):null}
      </nav>
      <Link to="/perfil" className="account-badge account-button" aria-label="Perfil e configurações da conta" title="Perfil"><UserCircle2 size={18}/></Link>
      <button className="account-badge account-button header-logout" aria-label="Sair da conta" title="Sair" onClick={()=>void logout()}>×</button>
    </div>
  </header>
}
