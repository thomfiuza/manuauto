# Sugestão de publicação para o LinkedIn

Estou desenvolvendo o **Manuauto**, uma plataforma brasileira para consultar conhecimento técnico de carros e motos com rastreabilidade.

A proposta é simples: o usuário descreve uma dúvida ou sintoma, e o sistema encontra os trechos relevantes nos documentos do veículo, mostrando a fonte e a página original. Quando o manual não traz uma informação, experiências da comunidade podem complementar a consulta — sempre identificadas como contribuição de usuário, sujeitas a revisão e separadas da orientação técnica.

Nesta etapa, o projeto já conta com:

- biblioteca privada de PDFs;
- extração e segmentação por página;
- busca textual em português;
- autenticação e controle de acesso próprios;
- moderação e votos;
- armazenamento local ou S3;
- PostgreSQL/pgvector preparado para busca híbrida;
- PWA e testes automatizados.

O Renault Symbol, com motores K4M e K7M, está sendo usado como veículo piloto. Um caso que resume bem a proposta é a consulta sobre óleo: quando o manual apenas orienta procurar outro documento, o Manuauto não inventa uma especificação. Ele mantém essa orientação e permite que recomendações da comunidade apareçam em um bloco separado, com aplicação e evidência.

O projeto funciona localmente sem depender de conta ou serviço externo obrigatório e foi estruturado para ser portátil entre provedores.

Ainda estou trabalhando em OCR, processamento assíncrono, destaque do trecho no PDF, observabilidade, vídeos e ampliação do catálogo de veículos.

Feedback de mecânicos, profissionais de reparação, proprietários e desenvolvedores é muito bem-vindo.

#automotivo #mecanica #inteligenciaartificial #software #tecnologia #typescript #postgresql #brasil
