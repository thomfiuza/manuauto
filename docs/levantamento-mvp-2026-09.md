# Manuauto — Levantamento de Evolução (setembro/2026)

Levantamento técnico verificado diretamente no código e no repositório em 01/09/2026.
Base: commit `25dcf7b` ("feat: adiciona histórico e painel de documentos"), CI verde.

> **ATUALIZAÇÃO (01/09/2026 — execução da Onda 1 + robustez):** implementados nesta rodada:
> busca tolerante (acentos/plurais/erro de digitação), resposta extrativa sem IA, confirmação de
> solução ("isso resolveu?"), denúncia de contribuições, catálogo de veículos para a equipe,
> curadoria de vídeos, paginação (histórico/biblioteca), perfil com exportação e exclusão LGPD,
> termos de uso + política de privacidade com fluxo de remoção autoral, processamento assíncrono
> com fila, trilha de auditoria (tabela + log estruturado + tela), health check com estado da fila,
> script de backup local e testes de integração expandidos (12 verificações).
> **MVP estimado agora: ~92%.** Pendências principais: deploy real, OCR, E2E, worker dedicado.

---

## 1. Estado atual verificado

**Infraestrutura e repositório**
- [x] Repositório público: `github.com/thomfiuza/manuauto` (5 commits, histórico limpo).
- [x] CI completo no GitHub Actions: instalar, migrar, seed, typecheck, testes estáticos, testes de integração, build e smoke HTTP.
- [x] Stack independente: TanStack Start, React, TypeScript, Drizzle, PGlite (dev) / PostgreSQL+pgvector (prod), Better Auth, storage local/S3, Nodemailer.

**Funcionalidades em produção no código**
- [x] Autenticação completa (cadastro, login, sessão, logout, recuperação, papéis: usuário/moderador/admin).
- [x] Upload de PDF autenticado com validação (MIME, assinatura, tamanho, SHA-256).
- [x] Extração de texto, chunking e persistência com página/seção.
- [x] Busca textual PostgreSQL em português + busca híbrida opcional (embeddings).
- [x] Respostas com fontes citadas (documento, seção, página) e separação manual × comunidade.
- [x] Dicas da comunidade com moderação (pendentes por padrão) e votos únicos.
- [x] Moderação de documentos e dicas (fila + aprovação/recusa).
- [x] Histórico de consultas com exclusão.
- [x] Painel da biblioteca com status de processamento, filtros e ações (abrir/reprocessar/excluir).
- [x] Exclusão de documento com limpeza do objeto armazenado (API DELETE + UI).
- [x] PWA instalável (manifest, ícones, service worker).
- [x] Testes: estáticos, integração (9 verificações) e smoke HTTP.

**Dimensão do código:** ~700 linhas em `src/`, 12 tabelas no banco. Enxuto e coeso.

**Progresso estimado do MVP: ~84%.** O núcleo funcional está pronto; falta robustez de processamento, deploy real e camada jurídica.

---

## 2. O que falta — por área

Legenda de esforço: **P** = pequeno (horas), **M** = médio (1–3 dias), **G** = grande (1+ semana). 💰 = tem custo recorrente.

### Área 1 — Núcleo técnico (robustez)
| # | Item | Problema atual | Esforço |
|---|------|----------------|---------|
| 1.1 | Processamento assíncrono (fila/worker) | O PDF é processado dentro da própria requisição; manual grande trava ou estoura timeout. A UI já exibe status, falta o backend em background. | M |
| 1.2 | OCR para PDFs escaneados | Hoje retorna erro: "O PDF não possui texto pesquisável. Será necessário OCR." | M/G |
| 1.3 | Busca tolerante a variações | Busca lexical exige termos exatos; plural, erro de digitação ou sinônimo → resultado vazio. Fallback com trigram/normalização. | P/M |
| 1.4 | Resposta extrativa sem IA | Sem modelo configurado, a resposta é só "Encontrei N trechos". Dá para montar um resumo com as próprias passagens. | P |
| 1.5 | Visualizador de PDF com página destacada | O link `#page=N` não abre na página na maioria dos visualizadores. Faltam coordenadas/scroll exato. | M |
| 1.6 | Confirmação de solução (7 e 30 dias) | A tabela `answer_votes` **existe mas não é usada em nenhum fluxo**. Fecha o loop de qualidade ("isso resolveu seu problema?"). | P/M |

### Área 2 — Gestão de conteúdo e UX
| # | Item | Problema atual | Esforço |
|---|------|----------------|---------|
| 2.1 | UI admin para veículos | Não há tela/rota para criar/editar veículos — hoje só via seed. | P |
| 2.2 | Curadoria de vídeos | Tabela `videos` pronta, consulta implementada, mas **sem UI** para cadastrar/aprovar. | P/M |
| 2.3 | Paginação nas listas | Histórico, dicas e documentos têm limite fixo (50) sem paginação. | P |
| 2.4 | Página de perfil do usuário | Sem tela "meus dados" (LGPD também pede exportação/exclusão). | M |
| 2.5 | Auditoria de acessibilidade | Contraste, navegação por teclado, ARIA — nunca auditado. | M |

### Área 3 — Deploy e produção
| # | Item | Situação | Esforço |
|---|------|----------|---------|
| 3.1 | Host Node 22 + PostgreSQL/pgvector | Adaptadores prontos, falta escolher (Railway, Fly.io, VPS) e subir. 💰 | M |
| 3.2 | Storage S3/R2 em produção | Adaptador S3 pronto, falta bucket real. 💰 | P |
| 3.3 | SMTP real (Resend/Postmark) | Mailer pronto, falta provedor. 💰 | P |
| 3.4 | Domínio próprio + HTTPS | — | P 💰 |
| 3.5 | Backup/restore automatizado e testado | — | M |
| 3.6 | Logs estruturados + alertas de uptime | Só `/api/health` existe. | M |
| 3.7 | Antivírus/sandbox para uploads públicos | Upload aceita PDF de qualquer usuário autenticado. | M |

### Área 4 — Jurídico (obrigatório antes de abrir para público)
| # | Item | Situação | Esforço |
|---|------|----------|---------|
| 4.1 | Termos de uso + política de privacidade | Não existem páginas. | P/M |
| 4.2 | LGPD: consentimento, exportação e deleção de dados | Parcial (conta existe; falta fluxo). | M |
| 4.3 | Fluxo de remoção de conteúdo autoral (takedown) | **Crítico**: plataforma que hospeda manuais de montadoras precisa de canal de remoção e aviso de direitos no upload. | P |
| 4.4 | Declaração de direito no upload | Checkbox "declaro ter direito de uso do material". | P |

### Área 5 — Qualidade interna
| # | Item | Situação | Esforço |
|---|------|----------|---------|
| 5.1 | Testes E2E com navegador real (Playwright) no CI | Não existem. | M |
| 5.2 | Testes de integração das features novas | Histórico, painel e exclusão não cobertos pelo `test-integration`. | P |
| 5.3 | Formatação de código | Arquivos com linhas únicas enormes dificultam manutenção futura (Prettier). | P |
| 5.4 | Eliminar `any` | Vários pontos (tips, sources, rows). | P/M |

### Área 6 — Expansão (pós-MVP)
- Catálogo amplo de veículos/motos brasileiros.
- Reputação de autores e revisores.
- Evidências com fotos e anexos nas dicas.
- App Android com Capacitor.
- Embeddings + geração de resposta quando houver orçamento de API. 💰

---

## 3. O que precisa melhorar no que já existe

1. **Consulta sem IA é fraca** (1.4): a experiência "grátis" do produto não mostra valor sozinha — responder com um resumo das passagens relevantes resolve sem custo.
2. **Fragilidade da busca** (1.3): hoje "fusivel" (sem acento errado) ou "pneus" (plural de "pneu") podem não casar com "Fusíveis"/"pressão dos pneus".
3. **Processamento síncrono** (1.1):Upload de manual de 100+ páginas pode falhar por timeout — é o gargalo para o caso de uso principal do produto.
4. **Loop de feedback aberto** (1.6): não sabemos se as respostas resolvem; sem isso não há métrica de qualidade real do produto.
5. **Roadmap desatualizado**: itens concluídos ainda marcados como pendentes (corrigido neste documento).

---

## 4. Plano recomendado — 3 ondas

### Onda 1 — MVP funcionalmente completo (sem custo, desenvolve local)
1. Busca tolerante (trigram + normalização) — 1.3
2. Resposta extrativa sem IA — 1.4
3. Confirmação de solução com `answer_votes` — 1.6
4. UI admin de veículos — 2.1
5. Paginação — 2.3
6. Testes das features novas — 5.2

**Resultado: ~92% do MVP.**

### Onda 2 — Pronto para usuários reais (custo baixo mensal)
1. Deploy (Railway/Fly/VPS + Postgres/pgvector + R2 + SMTP) — 3.1–3.4
2. Termos, privacidade, LGPD, takedown e declaração no upload — 4.1–4.4
3. Backup + monitoramento básico — 3.5/3.6

**Resultado: MVP público para teste com usuários reais.**

### Onda 3 — Diferenciação
OCR (1.2), worker assíncrono (1.1), visualizador com destaque (1.5), E2E (5.1), vídeos curados (2.2), perfil (2.4), Android.

---

## 5. Decisões estratégicas pendentes

1. **IA paga agora ou depois?** Recomendo: depois do deploy, começando com modelo barato (o código já aceita qualquer API compatível com OpenAI via `AI_BASE_URL`).
2. **Modelo de manuais:** cada usuário envia o seu manual privado (mais seguro juridicamente) vs. biblioteca pública compartilhada (mais útil, mais risco autoral). Hoje o sistema suporta ambos — a política define o padrão.
3. **Primeiro público:** donos de veículo (B2C, volume) ou oficinas/mecânicos (B2B, valor). Afeta prioridades de UI e conteúdo.

---

## 6. Métricas de sucesso a instrumentar

- Taxa de consultas com pelo menos uma fonte citada.
- Taxa de "resolveu meu problema" (após implementar 1.6).
- Tempo até o usuário abrir a página citada.
- Cobertura do catálogo de veículos.
- Incidentes de conteúdo incorreto/removido.
