# Manuauto — Substituição completa da infraestrutura

**Data:** 18/08/2026  
**Titular:** Thomaz Fiuza  
**Progresso anterior:** 61%  
**Progresso atual validado:** **78%**  
**Pendente:** **22%**

## Resultado

A dependência anterior de banco, autenticação e armazenamento foi removida integralmente. O Manuauto agora funciona localmente sem conta externa e possui caminho direto para PostgreSQL/pgvector em produção.

Não restaram pacotes, arquivos, nomes, variáveis, URLs, SDKs ou documentação ligados às plataformas que o titular decidiu remover. O lockfile foi regenerado e a auditoria de dependências encontrou zero vulnerabilidades conhecidas.

## Nova arquitetura

- TanStack Start, React e TypeScript.
- PGlite local persistente, sem instalação.
- PostgreSQL 17 com pgvector em produção.
- Drizzle ORM.
- Better Auth executado pelo próprio Manuauto.
- Cookies HttpOnly e sessões persistidas no banco.
- Filesystem local ou armazenamento S3 compatível.
- SMTP configurável e Mailpit no desenvolvimento.
- Busca textual PostgreSQL em português sem custo de IA.
- Embeddings e geração opcionais.

## Implementado

### Banco e migrations

- Schema Drizzle para 12 tabelas.
- Usuários, sessões, contas e verificações.
- Veículos, documentos, chunks e respostas.
- Dicas, votos e vídeos.
- Enums de função, origem, visibilidade, status e tipo de dica.
- Migration PostgreSQL própria.
- Extensão pgvector e coluna `vector(1536)`.
- Índice HNSW.
- Índices full-text em português.
- Índices de propriedade, veículo e unicidade.
- Migração adaptada automaticamente para PGlite local.
- Migração idempotente.

### Autenticação

- Cadastro com nome, e-mail e senha.
- Login e logout.
- Sessão de sete dias.
- Cookies HttpOnly e SameSite Lax.
- Recuperação de senha.
- Verificação de e-mail configurável.
- SMTP próprio.
- Rate limiting de autenticação.
- Funções `user`, `moderator` e `admin`.
- Middleware de usuário e equipe.
- Conta administradora local criada pelo seed.

### Documentos e armazenamento

- Adaptador de armazenamento independente.
- Filesystem local.
- S3 compatível com MinIO, R2 ou AWS.
- Upload autenticado.
- Limite de 25 MB.
- Validação de MIME.
- Verificação da assinatura `%PDF-`.
- SHA-256 e bloqueio de duplicidade por usuário.
- Chaves de objeto isoladas por usuário.
- Download privado autorizado.
- Documento público somente após aprovação.
- Exclusão do documento, chunks e objeto.
- Reprocessamento de documentos que falharam.
- Arquivo preservado quando a extração falha.

### Manual do Symbol

- Usuário local criado.
- Symbol K4M e K7M cadastrados.
- Manual armazenado no novo adaptador.
- 144 páginas processadas.
- 198 chunks persistidos.
- Documento privado.
- Busca por pressão dos pneus retorna a página 5.

### Busca e resposta

- Full-text search em português.
- Filtro por veículo.
- Filtro de autorização na própria recuperação.
- Documentos privados visíveis só ao proprietário.
- Conteúdo público somente se aprovado.
- Busca híbrida preparada para PostgreSQL/pgvector.
- Sem IA configurada, nenhuma síntese técnica é inventada.
- Respostas e fontes persistidas no histórico.

### Comunidade

- Cadastro de recomendação, defeito crônico, macete, peça e alerta.
- Motor, assunto, código de peça e evidência.
- Status inicial pendente.
- Autor visualiza a própria contribuição.
- Público vê somente conteúdo aprovado.
- Fila administrativa.
- Aprovação e rejeição.
- Voto único por usuário.
- Alteração de voto.
- Recontagem persistente.

### Operação

- Health check em `/api/health`.
- Proteção CSRF para Server Functions.
- Rate limiting para consulta, upload, dica e voto.
- Bloqueio de PGlite acidental em produção.
- Bloqueio de armazenamento local acidental em produção.
- Docker Compose opcional com PostgreSQL/pgvector, MinIO e Mailpit.
- Seed local idempotente.
- Dependências fixadas em versões exatas.
- PWA básica com manifest, ícones e service worker.
- O service worker não armazena páginas autenticadas nem APIs.

## Testes aprovados

- TypeScript sem erros.
- Geração de rotas.
- Build cliente.
- Build SSR.
- Migration PGlite nova.
- Reexecução idempotente da migration.
- Seed novo.
- Reexecução idempotente do seed.
- Cadastro interno via Better Auth.
- Login HTTP real.
- Cookie `session_token` real.
- Recuperação da sessão.
- Função administrativa persistida.
- Recuperação de senha HTTP.
- Download autorizado do PDF.
- Download sem sessão bloqueado com HTTP 401.
- Upload sem sessão bloqueado.
- Upload duplicado bloqueado com HTTP 409.
- Validação do PDF.
- 144 páginas e 198 chunks.
- Busca textual com cinco fontes para pressão dos pneus.
- Criação, moderação e votação de dica.
- Limpeza da dica de teste.
- Health check de banco.
- Manifest, service worker e ícone entregues.
- Auditoria NPM: zero vulnerabilidades.
- Nenhum remote Git.
- Nenhuma credencial de produção no repositório.

## Matriz atual

| Área | Peso | Concluído |
|---|---:|---:|
| Base independente, autoria e build | 7% | 7% |
| Interface e responsividade | 10% | 9% |
| Manual, ingestão e citações | 12% | 11% |
| Busca e resposta fundamentada | 14% | 10% |
| Comunidade | 10% | 8% |
| Autenticação | 8% | 8% |
| Banco, armazenamento e upload | 12% | 10% |
| Moderação e votos | 7% | 6% |
| Vídeos | 5% | 1% |
| PWA e Android | 5% | 3% |
| Segurança e privacidade | 5% | 3% |
| Testes e implantação | 5% | 2% |
| **Total** | **100%** | **78%** |

## O que falta

### Antes de produção pública

1. Implantar PostgreSQL/pgvector real e executar a migration.
2. Testar uma implantação real em Node.js 22.12+.
3. Configurar bucket S3 ou volume persistente e testar restauração.
4. Configurar SMTP real e reputação de envio.
5. Usar segredo de autenticação aleatório de produção.
6. Criar pipeline CI/CD.
7. Adicionar logs estruturados, métricas e alertas.
8. Testar backup e restauração do banco e dos PDFs.
9. Antivírus ou sandbox para uploads.
10. Testes E2E em Chrome, Firefox e celulares reais.
11. Auditoria de acessibilidade.
12. Termos de uso, privacidade, LGPD e remoção autoral.

### Robustez técnica

13. Fila e worker separado para PDFs grandes.
14. OCR de documentos escaneados.
15. Destaque das coordenadas do trecho no PDF.
16. Histórico de consultas na interface.
17. Denúncia, contestação e versionamento.
18. Confirmação pós-reparo em 7 e 30 dias.
19. Rate limit compartilhado por Redis em implantação com várias instâncias.
20. Testes de carga e orçamento de armazenamento.

### Expansão

21. Curadoria de vídeos e minuto exato do procedimento.
22. Embeddings e resposta generativa quando houver orçamento.
23. Evidências com fotos e anexos.
24. Catálogo de peças.
25. Android com Capacitor.
26. Novas famílias de veículos e motos.

## Uso local

```bash
cd manuauto/app
npm install
npm run db:migrate
npm run db:seed
npm run dev -- --host 0.0.0.0
```

Credenciais locais de desenvolvimento:

```text
thomaz@manuauto.local
ManuautoLocal2026!
```

Essas credenciais não devem ser usadas em produção.
