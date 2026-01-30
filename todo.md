# Solicitação de Materiais - MOPAR (TODO)

## Backend
- [x] Configurar variáveis de ambiente (WEBHOOK_URL, WEBHOOK_TOKEN)
- [x] Implementar endpoint para upload de fotos (via tRPC)
- [x] Implementar endpoint para envio de solicitações (tRPC)
- [x] Validação de payload (loja_id, solicitante_nome, materiais, etc)
- [x] Geração de Request_ID (YYYYMMDD-HHMMSS-6CHARS)
- [x] Integração com webhook do Google Apps Script
- [x] Tratamento de respostas (JSON vs HTML)
- [x] Testes unitários para validações
- [x] Script de teste do webhook (webhook-test.mjs)

## Frontend
- [x] Carregar lista de lojas do Excel
- [x] Implementar dropdown pesquisável de lojas
- [x] Seção 1: Dados Principais (loja, nome, telefone, chamado)
- [x] Seção 2: Equipe e Serviço (tipo equipe, empresa terceira, tipo serviço, sistema afetado, descrição)
- [x] Seção 3: Repetidor de Materiais (descrição, especificação, quantidade, unidade, urgência, fotos)
- [x] Validação de formulário por campo
- [x] Honeypot anti-spam
- [x] Upload de fotos (até 2 por material, máx 5MB)
- [x] Tela de sucesso com Request_ID
- [x] Botão "Nova Solicitação" na tela de sucesso
- [x] Design mobile-first com MOPAR style (azul #0082C3)
- [x] Feedback visual de validação

## Testes
- [x] Testes unitários (Request_ID format, validação HTML/JSON)
- [ ] Teste: enviar 1 material sem telefone e sem fotos
- [ ] Teste: enviar 2 materiais (1 com foto, 1 sem)
- [ ] Teste: verificar URLs de fotos abertas sem login

## Documentação
- [x] README completo (como rodar local, env vars, troubleshooting)
- [x] Guia de teste do webhook
- [x] Guia de teste de upload

## Deploy
- [ ] Publicar app
- [ ] Verificar integração com webhook

## Correções e Melhorias (Sprint 2)
- [x] Remover uso de Buffer do frontend (Uint8Array nativo)
- [x] Implementar upload via tRPC para endpoint de upload
- [x] Adicionar suporte a câmera (capture="environment")
- [x] Adicionar suporte a galeria (input file normal)
- [x] Implementar preview de fotos com URL.createObjectURL
- [x] Adicionar validação de tipo e tamanho no frontend
- [x] Atualizar README com instruções de câmera/galeria
- [x] Implementar modo mock para testes sem webhook real
- [x] Adicionar instruções de teste com USE_MOCK_WEBHOOK
- [ ] Testar envio com modo mock ativado
- [ ] Testar envio com webhook real (após configurar URL)

## Correções Sprint 3
- [x] Corrigir validação de loja_id para aceitar 0 (ESCRITÓRIO)


## Sprint 4 - Integração Webhook Completa
- [x] Validar URL do webhook no startup (deve terminar com /exec)
- [x] Criar serviço de diagnóstico (webhookDiagnostic.ts)
- [x] Criar endpoint tRPC /api/webhook/diagnose
- [x] Melhorar logs com status, content-type, body snippet
- [x] Implementar retry controlado (1 retry com 800ms delay)
- [x] Adicionar modal de diagnóstico no frontend
- [x] Adicionar botão "Diagnosticar Webhook" em caso de erro
- [x] Melhorar mensagens de erro com detalhes específicos
- [x] Testar diagnóstico com webhook real - Status 200, JSON válido
- [x] Testar envio com webhook real funcionando
- [x] Testar retry em caso de falha de rede


## Sprint 5 - Dashboard de Histórico
- [ ] Criar rota tRPC para listar solicitações com filtros
- [ ] Implementar filtro por data (data inicial e final)
- [ ] Implementar filtro por loja
- [ ] Implementar filtro por status (enviada, pendente, etc)
- [ ] Implementar busca por Request_ID
- [ ] Criar componente de tabela com paginação
- [ ] Adicionar visualização de detalhes da solicitação
- [ ] Adicionar visualização de fotos anexadas
- [ ] Implementar ordenação por data, loja, status
- [ ] Adicionar botão de reenvio de solicitação
- [ ] Criar testes para filtros e listagem
- [ ] Adicionar rota no App.tsx para /historico


## Sprint 6 - Rebranding MOPAR → MOPAR
- [ ] Substituir "MOPAR" por "MOPAR" em todos os arquivos
- [x] Atualizar título da página
- [x] Atualizar descrições
- [x] Atualizar nomes de variáveis e constantes
- [x] Atualizar comentários e documentação
