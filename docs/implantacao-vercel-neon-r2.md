# Implantação Vercel + Neon + R2/B2 (custo zero)

Guia oficial de implantação do Manuauto na pilha gratuita: hospedagem Vercel (Hobby), banco Neon (PostgreSQL com pgvector) e armazenamento S3-compatível (Cloudflare R2 ou Backblaze B2).

## Visão geral

| Componente | Serviço | Custo |
|---|---|---|
| Aplicação (SSR + funções de servidor) | Vercel Hobby | US$ 0 |
| Banco PostgreSQL + pgvector | Neon Free | US$ 0 |
| Armazenamento de PDFs | R2 (10 GB) ou B2 (10 GB) | US$ 0 |

Pré-requisito: repositório GitHub atualizado — o `vite.config.ts` já contém o plugin Nitro com preset Vercel ativado automaticamente durante o build da plataforma.

## 1) Banco de dados — Neon

1. Criar conta em [neon.com](https://neon.com) (pode usar login com GitHub).
2. Criar projeto chamado `manuauto` (região mais próxima do Brasil).
3. Copiar a Connection String (inicia com `postgresql://`).
4. As migrações criam as tabelas e a extensão `vector` automaticamente (o Neon oferece pgvector em todos os planos).

## 2) Armazenamento S3-compatível

**Opção A — Cloudflare R2** (exige cartão internacional para ativação):

1. Conta em [dash.cloudflare.com](https://dash.cloudflare.com) → R2 Object Storage → ativar.
2. Criar bucket `manuauto`.
3. Gerar token de API com permissão Object Read & Write.
4. Endpoint: `https://<ID_DA_CONTA>.r2.cloudflarestorage.com`.

**Opção B — Backblaze B2** (sem cartão):

1. Conta em [backblaze.com](https://www.backblaze.com) → B2 Cloud Storage.
2. Criar bucket `manuauto` (privado).
3. Criar Application Key com acesso ao bucket.
4. Endpoint: `https://s3.<região>.backblazeb2.com` (mostrado na página do bucket).

## 3) Aplicação — Vercel

1. Conta em [vercel.com](https://vercel.com) com login via GitHub.
2. Add New → Project → importar o repositório do Manuauto.
3. Configurações do projeto:
   - **Root Directory:** `app`
   - **Framework Preset:** detecção automática (TanStack Start)
   - **Build Command (sobrescrever):** `npm run db:migrate && npm run build`
   - **Output Directory:** deixar como detectado
4. Variáveis de ambiente:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | connection string do Neon |
| `BETTER_AUTH_SECRET` | segredo gerado com `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | URL final (ex.: `https://manuauto.vercel.app`) — adicionar após o primeiro deploy e reimplantar |
| `STORAGE_DRIVER` | `s3` |
| `S3_ENDPOINT` | endpoint do R2/B2 |
| `S3_REGION` | `auto` (R2) ou a região do bucket (B2) |
| `S3_BUCKET` | `manuauto` |
| `S3_ACCESS_KEY_ID` | chave de acesso |
| `S3_SECRET_ACCESS_KEY` | chave secreta |
| `S3_FORCE_PATH_STYLE` | `true` |

5. Deploy. A migration roda no build (idempotente) e o catálogo de veículos é criado pela migration inicial.

## 4) Primeiro uso

1. Criar conta pela interface (`/auth`).
2. Promover a administrador no SQL Editor do Neon:

```sql
update users set role='admin' where email='seu@email';
```

3. Entrar novamente e enviar um PDF pela Biblioteca (valida o armazenamento).
4. Conferir `/api/health` → `status: ok, database: ok`.

## Limitações do plano gratuito (fase de demonstração)

- Sem SMTP configurado: recuperação de senha indisponível até configurar um provedor (Resend/Postmark/Brevo).
- PDFs muito grandes podem atingir o limite de duração da função — a solução definitiva é o worker dedicado previsto no roadmap.
- Neon free suspende o banco por inatividade (primeira consulta pode demorar ~1 s).
- Domínio próprio: adicionar depois via Vercel + registro de domínio.

## Evolução da infraestrutura

1. Domínio próprio + HTTPS automático (Vercel).
2. Provedor SMTP para e-mails transacionais.
3. Worker dedicado para processamento pesado (OCR, PDFs grandes).
4. Monitoramento externo (uptime) apontando para `/api/health`.
5. Se necessário, migração para Railway/Fly/VPS sem mudanças de código (o build Node padrão continua disponível via `npm run build` + `npm start`).
