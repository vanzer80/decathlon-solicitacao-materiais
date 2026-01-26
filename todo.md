# Decathlon - Solicitação de Materiais - TODO

## Fase 1: Estrutura e Backend
- [x] Configurar schema de banco de dados (solicitacoes, materiais)
- [x] Criar helpers de banco de dados para solicitações
- [x] Implementar procedure tRPC para enviar solicitação
- [x] Configurar integração com webhook Google Apps Script
- [x] Implementar upload de fotos para S3 com URLs públicas

## Fase 2: Frontend - Formulário
- [x] Carregar lista de lojas do Excel em JSON
- [x] Implementar dropdown pesquisável de lojas
- [x] Criar seção "Dados Principais" (loja, solicitante, telefone, chamado)
- [x] Criar seção "Equipe e Serviço" (tipo equipe, empresa terceira condicional, tipo serviço, sistema afetado, descrição)
- [x] Implementar repetidor de materiais com adicionar/remover cards
- [x] Adicionar campos de material (descrição, especificação, quantidade, unidade, urgência, fotos)
- [x] Implementar validação em tempo real com feedback visual

## Fase 3: Integração e Segurança
- [x] Implementar honeypot anti-spam
- [x] Gerar Request_ID único (YYYYMMDD-HHMMSS-6CHARS)
- [x] Montar payload JSON conforme especificação
- [x] Enviar POST para webhook com token em query param e header
- [x] Implementar tratamento de erros e logging

## Fase 4: UX e Testes
- [x] Implementar tela de sucesso com Request_ID
- [x] Adicionar botão "Nova Solicitação" para resetar formulário
- [x] Aplicar visual corporativo Decathlon (azul #0082C3)
- [x] Otimizar para mobile-first
- [x] Criar testes unitários para utilitários (11 testes passando)
- [x] Testar envio de 1 material sem fotos (manual)
- [x] Testar envio de 2 materiais com 1 foto (manual)
- [x] Validar URLs públicas das fotos no Sheets (manual)
- [x] Testar honeypot anti-spam (manual)
- [x] Corrigir erro de resposta inválida do webhook

## Fase 5: Entrega
- [x] Revisar e documentar código
- [x] Corrigir tratamento de resposta do webhook (HTML/JSON)
- [x] Adicionar modo mock para testes
- [x] Criar script de teste do webhook
- [x] Criar documentação de debug (WEBHOOK_DEBUG.md)
- [ ] Criar checkpoint final
- [ ] Publicar aplicação

## Bugs Corrigidos
- [x] Resposta inválida do servidor (webhook retornando HTML 404)
- [x] Melhorar logging de erros do webhook
- [x] Adicionar suporte para URLs customizadas do webhook via env var
