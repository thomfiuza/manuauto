# Manuauto — Roadmap

## Concluído

- [x] Titularidade e repositório independente.
- [x] TanStack Start, React e TypeScript.
- [x] PGlite local e PostgreSQL/pgvector em produção.
- [x] Drizzle ORM e migration inicial.
- [x] Better Auth com cadastro, login, sessão, logout e recuperação.
- [x] Funções de usuário, moderador e administrador.
- [x] Armazenamento local e adaptador S3.
- [x] Upload autenticado de PDF.
- [x] Validação de MIME, assinatura, tamanho e SHA-256.
- [x] Extração, chunking e persistência.
- [x] Manual do Symbol com 144 páginas e 198 chunks.
- [x] Busca textual PostgreSQL em português.
- [x] Estrutura pgvector e busca híbrida opcional.
- [x] Respostas com fontes e páginas.
- [x] Dicas pendentes por padrão.
- [x] Moderação de documentos e dicas.
- [x] Votos únicos e recontagem.
- [x] Download privado autorizado.
- [x] Build cliente e SSR.
- [x] Testes estáticos, integração, autenticação e HTTP.

## Próxima fase — robustez do MVP

- [x] Processamento assíncrono com fila (in-process; worker dedicado é a evolução).
- [ ] OCR de PDFs escaneados.
- [ ] Destaque exato do trecho no PDF.
- [x] Exclusão de documentos e limpeza do objeto armazenado.
- [x] Histórico de consultas na interface.
- [ ] Testes E2E com navegador real.
- [x] Rate limiting específico para upload e consulta.
- [x] Logs estruturados e trilha de auditoria.
- [ ] Backup e restauração testados. (script local criado; rotina de produção pendente)
- [x] Termos, privacidade, LGPD e processo autoral.
- [x] Confirmação de solução após a consulta (7/30 dias é evolução de acompanhamento).

## Expansão

- [ ] Curadoria de vídeos e associação ao minuto do procedimento. (UI criada; associação ao minuto pendente)
- [ ] Evidências com fotos e anexos.
- [ ] Reputação de autores e revisores.
- [ ] Catálogo de peças.
- [x] PWA básica instalável com manifest, ícones e service worker seguro.
- [ ] Offline avançado para conteúdo previamente autorizado.
- [ ] Android com Capacitor.
- [ ] Novas famílias de carros e motos.
- [ ] Embeddings e geração de resposta quando houver orçamento.

## Métricas

- Compatibilidade correta por veículo e motor.
- Cobertura de citação por afirmação.
- Respostas de ausência corretas.
- Tempo para encontrar a página útil.
- Taxa de solução confirmada.
- Incidentes de conteúdo incorreto ou inseguro.
