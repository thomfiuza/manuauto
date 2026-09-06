import { createFileRoute,Link } from '@tanstack/react-router'
import { Wrench } from 'lucide-react'
export const Route=createFileRoute('/termos')({component:TermosPage})
function TermosPage(){
  return <main className="legal-page">
    <header><Link to="/" className="brand"><span className="brand-mark"><Wrench size={18}/></span><span><b>Manuauto</b><small>Conhecimento que move</small></span></Link></header>
    <article>
      <h1>Termos de uso</h1>
      <p className="legal-updated">Versão 1.0 · projeto em desenvolvimento (MVP)</p>
      <section>
        <h2>1. Sobre o serviço</h2>
        <p>O Manuauto é uma plataforma de conhecimento automotivo desenvolvida e mantida por <strong>Thomaz Fiuza</strong>. O serviço organiza manuais e documentos técnicos enviados pelos próprios usuários, permite consultas por dúvida ou sintoma e apresenta separadamente contribuições da comunidade, sempre indicando a fonte (documento, seção e página) de cada informação técnica.</p>
      </section>
      <section>
        <h2>2. Natureza da informação</h2>
        <p>O Manuauto é uma ferramenta de <strong>apoio à consulta</strong>. As respostas não substituem o manual do fabricante, uma avaliação técnica presencial nem serviços de segurança, que devem ser executados por profissional qualificado. Cada usuário decide como usar as informações, verificando aplicação, motor, versão e riscos.</p>
      </section>
      <section>
        <h2>3. Conteúdo enviado pelos usuários</h2>
        <ul>
          <li>Ao enviar um documento, você declara ter o direito de usá-lo. Documentos marcados como públicos exigem declaração expressa de autorização e passam por revisão antes de circular.</li>
          <li>Contribuições da comunidade representam experiência de usuários e <strong>não</strong> são procedimento oficial de fábrica. Elas começam pendentes de revisão e podem ser denunciadas por qualquer usuário.</li>
          <li>É proibido enviar conteúdo ilegal, difamatório, perigoso ou que viole direitos de terceiros.</li>
        </ul>
      </section>
      <section>
        <h2>4. Direitos autorais e remoção de conteúdo</h2>
        <p>Manuais de fabricantes são obras protegidas. O Manuauto adota o modelo em que cada usuário envia material para <strong>uso privado na própria conta</strong>; o compartilhamento público é opcional, declarado e revisado. Se você é titular de direitos e identificou conteúdo não autorizado, solicite a remoção abrindo uma comunicação no repositório oficial do projeto: <span className="legal-link">github.com/thomfiuza/manuauto</span>. Análise e remoção acontecem com prioridade.</p>
      </section>
      <section>
        <h2>5. Contas e conduta</h2>
        <p>O acesso aos recursos requer conta autenticada. São aplicados limites de uso (uploads, consultas e contribuições) para proteger o serviço. Contas podem ser suspensas em caso de abuso.</p>
      </section>
      <section>
        <h2>6. Limitação de responsabilidade</h2>
        <p>O serviço é fornecido "no estado em que se encontra", sem garantia de resultado diagnóstico. O Manuauto não fabrica, representa nem substitui qualquer montadora. Marcas citadas pertencem aos respectivos titulares.</p>
      </section>
      <section>
        <h2>7. Alterações</h2>
        <p>Estes termos podem evoluir junto com o projeto. A versão vigente estará sempre nesta página.</p>
      </section>
      <p className="legal-links">Veja também a <Link to="/privacidade">Política de privacidade</Link> · <Link to="/">Voltar ao início</Link></p>
    </article>
  </main>
}
