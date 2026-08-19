# Manuauto — Arquitetura independente

## Stack

- **Aplicação:** TanStack Start, React e TypeScript.
- **Banco de produção:** PostgreSQL 17 com pgvector.
- **Banco local sem instalação:** PGlite persistido em `.data/pglite`.
- **ORM:** Drizzle ORM.
- **Autenticação:** Better Auth, cookies HttpOnly e sessões no PostgreSQL.
- **Arquivos:** adaptador próprio; filesystem local ou qualquer serviço S3 compatível, incluindo MinIO e Cloudflare R2.
- **PDF:** unpdf, segmentação por página e seção.
- **E-mail:** SMTP configurável; Mailpit no desenvolvimento.
- **IA:** opcional, por API compatível com o formato OpenAI.
- **Busca gratuita:** full-text search do PostgreSQL em português.
- **Busca semântica opcional:** pgvector com vetores de 1.536 dimensões.

## Princípio de portabilidade

O domínio do Manuauto não importa SDK de plataforma de banco ou hospedagem. Banco, autenticação, armazenamento e e-mail são acessados por código controlado pelo projeto. A implantação pode mudar sem alterar as regras de negócio.

## Autorização

Toda operação sensível acontece no servidor:

1. Better Auth valida a sessão.
2. O serviço recebe `userId` e função.
3. A consulta verifica propriedade, visibilidade ou função administrativa.
4. O banco executa a operação.
5. Arquivos nunca são expostos por URL pública permanente.

Documentos privados só podem ser consultados pelo proprietário. Documentos comunitários só participam das respostas depois de aprovados. Usuários não aprovam as próprias contribuições.

## Fluxo de documento

1. Upload autenticado por `multipart/form-data`.
2. Verificação de MIME, assinatura `%PDF-`, tamanho e duplicidade por SHA-256.
3. Gravação local ou S3.
4. Registro do documento como `processing`.
5. Extração página por página.
6. Chunking de até 1.200 caracteres com sobreposição.
7. Embeddings opcionais.
8. Inserção em lotes.
9. Documento privado vira `approved`; público vira `pending_review`.
10. Em falha, arquivo e status são tratados de forma rastreável.

## Busca

Sem provedor de IA, o sistema usa `to_tsvector`, `websearch_to_tsquery` e ranking em português. Com embeddings, combina similaridade vetorial e relevância lexical. A autorização é aplicada na própria consulta de recuperação.

## Desenvolvimento sem custo

O padrão local usa PGlite e armazenamento em filesystem. Não exige Docker, conta externa nem serviço pago. O arquivo `compose.yaml` oferece PostgreSQL/pgvector, MinIO e Mailpit quando Docker estiver disponível.

## Produção

A produção exige Node.js 22.12+, PostgreSQL com extensão vector, segredo forte do Better Auth, HTTPS, armazenamento persistente, SMTP, backup, monitoramento e política de retenção.
