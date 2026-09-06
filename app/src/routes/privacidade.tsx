import { createFileRoute,Link } from '@tanstack/react-router'
import { Wrench } from 'lucide-react'
export const Route=createFileRoute('/privacidade')({component:PrivacidadePage})
function PrivacidadePage(){
  return <main className="legal-page">
    <header><Link to="/" className="brand"><span className="brand-mark"><Wrench size={18}/></span><span><b>Manuauto</b><small>Conhecimento que move</small></span></Link></header>
    <article>
      <h1>Política de privacidade</h1>
      <p className="legal-updated">Versão 1.0 · projeto em desenvolvimento (MVP) · Lei nº 13.709/2018 (LGPD)</p>
      <section>
        <h2>1. Responsável pelo tratamento</h2>
        <p>O tratamento de dados do Manuauto é de responsabilidade de <strong>Thomaz Fiuza</strong>. Contato para questões de privacidade: canal oficial do projeto em <span className="legal-link">github.com/thomfiuza/manuauto</span>.</p>
      </section>
      <section>
        <h2>2. Dados tratados</h2>
        <ul>
          <li><strong>Dados de conta:</strong> nome, e-mail e senha protegida por hash. Nenhum dado de terceiros é solicitado no cadastro.</li>
          <li><strong>Conteúdo do usuário:</strong> documentos enviados, consultas realizadas, contribuições e votos. Documentos privados ficam disponíveis somente na conta de quem os enviou.</li>
          <li><strong>Registros técnicos:</strong> trilha de auditoria de ações relevantes (upload, moderação, exclusões) para segurança do serviço. Após a exclusão da conta, esses registros permanecem sem identificar o titular.</li>
        </ul>
      </section>
      <section>
        <h2>3. Finalidade e base legal</h2>
        <p>Os dados são tratados para executar o serviço solicitado (consulta à sua biblioteca e ao histórico) e para segurança e prevenção de abusos. O compartilhamento público de conteúdo depende de declaração expressa do usuário.</p>
      </section>
      <section>
        <h2>4. Compartilhamento</h2>
        <p>O Manuauto não vende dados e não utiliza rastreadores de terceiros. Serviços de infraestrutura (hospedagem, banco, armazenamento e e-mail) atuam apenas como operadores sob instrução, quando configurados pelo mantenedor.</p>
      </section>
      <section>
        <h2>5. Seus direitos</h2>
        <ul>
          <li><strong>Exportação:</strong> na página Perfil, baixe um arquivo JSON com seus dados (LGPD, art. 18, II).</li>
          <li><strong>Exclusão:</strong> na página Perfil, exclua definitivamente sua conta, documentos e arquivos armazenados (art. 18, VI).</li>
          <li><strong>Correção:</strong> dados de conta podem ser atualizados na própria plataforma.</li>
        </ul>
      </section>
      <section>
        <h2>6. Retenção</h2>
        <p>Dados permanecem enquanto a conta existir. Sessões expiram automaticamente. Arquivos de documentos são removidos junto com a exclusão do documento ou da conta.</p>
      </section>
      <p className="legal-links">Veja também os <Link to="/termos">Termos de uso</Link> · <Link to="/">Voltar ao início</Link></p>
    </article>
  </main>
}
