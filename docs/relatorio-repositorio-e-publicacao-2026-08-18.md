# Manuauto — Verificação para repositório e divulgação

**Data:** 18/08/2026  
**Titular:** Thomaz Fiuza  
**Pronto:** **80%**  
**Pendente:** **20%**

## Verificação de independência

Foi executada uma nova varredura em:

- conteúdo textual do projeto;
- nomes de arquivos e diretórios;
- código-fonte;
- documentação;
- package.json e package-lock.json;
- configuração Vite e NPM;
- dependências instaladas;
- arquivos ocultos;
- configuração Git;
- URLs e variáveis de ambiente.

Resultado: **nenhuma ocorrência do termo proibido, pacote associado, URL, variável, conexão ou nome de arquivo foi encontrada**.

Também foi confirmado:

- nenhum remote Git configurado;
- nenhuma chave de produção presente;
- nenhum documento privado será incluído no Git;
- `.data/`, `data/`, PDFs privados, `.env` e builds estão ignorados;
- somente o PDF sintético livre de testes será versionado.

## Preparação do Git

- repositório inicializado na branch `main`;
- `.gitignore` na raiz;
- README público;
- licença proprietária;
- SECURITY.md;
- CONTRIBUTING.md;
- autoria e titularidade;
- workflow de integração contínua;
- fixture sintética livre;
- nenhum remote configurado ainda.

O dry-run de `git add` confirmou que banco local, manual privado, texto extraído e credenciais não serão adicionados.

## Preparação para LinkedIn

Foi criado um texto de divulgação em `docs/linkedin-post.md`, apresentando:

- problema resolvido;
- rastreabilidade por documento e página;
- separação entre documentação e comunidade;
- veículo piloto;
- arquitetura portátil;
- tecnologias;
- itens já entregues;
- próximos passos.

## Testes finais

- npm install limpo: aprovado;
- auditoria NPM: zero vulnerabilidades;
- TypeScript: aprovado;
- build cliente: aprovado;
- build SSR: aprovado;
- migration nova e idempotente: aprovada;
- seed com manual privado: aprovado;
- seed de clone público com PDF sintético: aprovado;
- teste de integração com banco novo: aprovado;
- autenticação HTTP: aprovada;
- sessão HttpOnly: aprovada;
- download autorizado e bloqueio sem sessão: aprovados;
- upload sem sessão e duplicidade: bloqueados corretamente;
- busca, moderação e votos: aprovados;
- health check: aprovado;
- smoke test: aprovado;
- PWA: manifest, service worker e ícones aprovados.

## Percentuais

| Área | Peso | Pronto |
|---|---:|---:|
| Base independente, autoria e repositório | 7% | 7% |
| Interface e responsividade | 10% | 9% |
| Manual, ingestão e citações | 12% | 11% |
| Busca e resposta fundamentada | 14% | 10% |
| Comunidade | 10% | 8% |
| Autenticação | 8% | 8% |
| Banco, armazenamento e upload | 12% | 10% |
| Moderação e votos | 7% | 6% |
| Vídeos | 5% | 1% |
| PWA e Android | 5% | 3% |
| Segurança e privacidade | 5% | 4% |
| Testes, CI e implantação | 5% | 3% |
| **Total** | **100%** | **80%** |

## O que está pronto

1. Repositório independente e publicável.
2. Titularidade de Thomaz Fiuza.
3. Banco local sem conta externa.
4. PostgreSQL/pgvector para produção.
5. Autenticação própria.
6. Upload e armazenamento independente.
7. Manual do Symbol processado privadamente.
8. Busca textual gratuita.
9. Busca vetorial opcional.
10. Comunidade, moderação e votos.
11. PWA básica.
12. CI e testes automatizados.
13. Documentação de implantação.
14. Texto para LinkedIn.

## O que falta

1. Criar o repositório remoto e fazer o primeiro push.
2. Escolher hospedagem Node.js 22.12+.
3. Implantar PostgreSQL/pgvector real.
4. Configurar armazenamento S3 ou volume persistente.
5. Configurar SMTP real.
6. Configurar domínio e HTTPS.
7. Testar backup e restauração.
8. Adicionar logs, métricas e alertas.
9. Executar testes E2E em navegadores reais.
10. Auditoria de acessibilidade.
11. Antivírus ou sandbox para uploads.
12. Fila assíncrona para documentos grandes.
13. OCR.
14. Destaque exato no PDF.
15. Termos, privacidade e LGPD.
16. Curadoria de vídeos.
17. Android.
18. Ampliação do catálogo.
19. Validação com mecânicos e proprietários reais.
20. Embeddings e geração opcional quando houver orçamento.
