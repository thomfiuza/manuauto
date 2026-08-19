# Implantação independente do Manuauto

## Desenvolvimento mínimo

Nenhum serviço externo é obrigatório:

```bash
cd app
npm install
npm run db:migrate
npm run db:seed
npm run dev -- --host 0.0.0.0
```

O banco PGlite e os PDFs ficam em `.data/`, fora do Git.

## Desenvolvimento com PostgreSQL

Com Docker disponível:

```bash
docker compose up -d
cp .env.example .env.local
```

Ajuste `DATABASE_URL` para o container e execute `npm run db:migrate`. Mailpit fica em `http://localhost:8025` e o console do MinIO em `http://localhost:9001`.

## Produção

1. Contrate ou instale PostgreSQL 17 com pgvector.
2. Configure `DATABASE_URL` com SSL.
3. Execute `npm run db:migrate` antes de iniciar a nova versão.
4. Gere `BETTER_AUTH_SECRET` com no mínimo 32 bytes aleatórios.
5. Configure `BETTER_AUTH_URL` com HTTPS.
6. Escolha armazenamento persistente local ou S3 compatível.
7. Configure SMTP.
8. Faça backup do banco e do armazenamento.
9. Execute `npm run typecheck`, `npm run test:static`, `npm run test:integration` e `npm run build` no CI.

## Migração de hospedagem

O banco é PostgreSQL comum, os objetos usam protocolo S3 e a autenticação reside nas tabelas do próprio banco. Para trocar de provedor:

1. exporte o PostgreSQL;
2. copie o bucket ou diretório de arquivos;
3. atualize as variáveis;
4. restaure o banco;
5. execute o health check e os testes.

Nenhum dado de domínio depende de painel proprietário.
