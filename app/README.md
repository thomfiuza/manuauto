# Manuauto

Software proprietário de **Thomaz Fiuza**.

## Executar localmente sem serviços externos

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev -- --host 0.0.0.0
```

A configuração padrão usa:

- PGlite em `.data/pglite`;
- PDFs em `.data/uploads`;
- Better Auth;
- busca textual gratuita em português.

Credenciais locais criadas pelo seed:

```text
thomaz@manuauto.local
ManuautoLocal2026!
```

Use essas credenciais somente no desenvolvimento.

## PostgreSQL e serviços locais opcionais

```bash
docker compose up -d
```

Depois configure `DATABASE_URL` e, se desejar MinIO, `STORAGE_DRIVER=s3`. Veja `.env.example`.

## Comandos

```bash
npm run typecheck
npm run build
npm run db:migrate
npm run db:seed
npm run test:static
npm run test:integration
npm run test:smoke
```

## Diretórios importantes

- `src/db/schema.ts`: schema Drizzle.
- `drizzle/`: migration PostgreSQL.
- `src/lib/auth.server.ts`: autenticação própria.
- `src/lib/storage.server.ts`: filesystem/S3.
- `src/lib/rag.server.ts`: ingestão e busca.
- `src/routes/api/documents/`: upload e download protegidos.
- `compose.yaml`: PostgreSQL, MinIO e Mailpit.

## Requisitos de produção

- Node.js 22.12 ou superior;
- PostgreSQL com pgvector;
- `BETTER_AUTH_SECRET` forte;
- HTTPS;
- armazenamento persistente local ou S3;
- SMTP;
- backup e monitoramento.
