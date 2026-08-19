# Contribuição

O Manuauto é um projeto proprietário de Thomaz Fiuza. Contribuições só devem ser enviadas após alinhamento prévio sobre escopo e direitos.

Antes de propor uma alteração:

1. não inclua manuais protegidos, credenciais ou dados pessoais;
2. crie uma branch separada;
3. execute os testes do projeto;
4. descreva riscos técnicos e de segurança;
5. preserve a separação entre documentação oficial e comunidade.

Comandos de validação:

```bash
cd app
npm ci
npm run db:migrate
npm run db:seed
npm run typecheck
npm run test:static
npm run test:integration
npm run build
```
