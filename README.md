# Manuauto

**Conhecimento automotivo rastreável para proprietários, mecânicos e oficinas.**

Projeto e titularidade: **Thomaz Fiuza**.

O Manuauto consulta manuais de carros e motos, preserva a página de origem e mantém contribuições da comunidade claramente separadas da documentação técnica. O sistema foi projetado para não inventar torque, viscosidade, código de peça ou procedimento quando a fonte não sustenta a resposta.

## Funcionalidades atuais

- autenticação própria e sessões HttpOnly;
- funções de usuário, moderador e administrador;
- biblioteca privada de PDFs com painel de processamento;
- upload, SHA-256, deduplicação e limite de tamanho;
- **processamento assíncrono em fila** (o upload responde imediato);
- extração de PDF e segmentação por página;
- busca textual em português sem custo de IA;
- **busca tolerante**: ignora acentos, plurais e erros de digitação;
- **resposta extrativa sem IA** (resumo direto das passagens citadas);
- **confirmação de solução** ("isso resolveu?") nas respostas;
- PostgreSQL/pgvector preparado para busca híbrida;
- citações de documento, seção e página;
- recomendações comunitárias pendentes de revisão;
- **denúncia de contribuições** (volta para a fila de revisão);
- moderação e votos;
- **catálogo de veículos gerenciável pela equipe**;
- **curadoria de vídeos de demonstração**;
- histórico de consultas com paginação;
- **perfil com direitos LGPD**: exportação e exclusão da conta;
- **termos de uso e política de privacidade** com fluxo de remoção autoral;
- **trilha de auditoria** (tabela + log estruturado) e tela para a equipe;
- armazenamento local ou S3 compatível;
- script de backup local (`npm run backup`);
- PWA básica;
- health check com estado da fila e testes automatizados.

## Stack

- TanStack Start, React e TypeScript;
- Drizzle ORM;
- PGlite no desenvolvimento;
- PostgreSQL 17 e pgvector em produção;
- Better Auth;
- filesystem local, MinIO, R2 ou S3;
- unpdf;
- SMTP configurável.

## Começar sem conta externa

Requer Node.js 22.12 ou superior.

```bash
cd app
npm install
npm run db:migrate
npm run db:seed
npm run dev -- --host 0.0.0.0
```

Credenciais exclusivamente locais:

```text
thomaz@manuauto.local
ManuautoLocal2026!
```

O seed usa um PDF sintético livre para testes em clones públicos. Um manual privado pode ser indicado por `SEED_MANUAL_PATH` sem entrar no Git.

## Testes

```bash
cd app
npm run typecheck
npm run test:static
npm run test:integration
npm run test:smoke
npm run build
```

A integração contínua executa migration, seed, tipos, testes, build e smoke HTTP.

## Estrutura

```text
app/src/db/              schema e cliente de banco
app/src/lib/             autenticação, busca, storage e regras
app/src/routes/          interface e APIs
app/drizzle/             migration PostgreSQL
app/scripts/             migration, seed e integração
app/compose.yaml         PostgreSQL, MinIO e Mailpit opcionais
docs/                    arquitetura, implantação e relatórios
tests/                   testes HTTP e fixture sintética
```

## Privacidade e direitos

Documentos privados não são públicos. O repositório ignora `.env`, banco local, arquivos enviados e PDFs. Não envie manuais protegidos ao Git.

## Licença

Código proprietário, disponibilizado para avaliação e demonstração de portfólio. Consulte [LICENSE](LICENSE). Dependências de terceiros preservam suas próprias licenças.
