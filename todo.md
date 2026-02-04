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


## Sprint 7 - Correção de Envio de Imagens
- [x] Verificar se as URLs das fotos estão sendo geradas corretamente
- [x] Verificar se as URLs estão sendo incluídas no payload do webhook
- [x] Testar envio de imagens com webhook real
- [x] Validar que as URLs chegam na planilha do Google Sheets
- [x] Adicionar botões de voltar e nova solicitação no histórico
- [x] Fazer dropdown de lojas abrir automaticamente ao clicar


## Sprint 8 - Correção de Câmera
- [x] Corrigir botão de câmera para acionar câmera do dispositivo
- [x] Usar capture="environment" para câmera traseira
- [x] Melhorar função triggerFileInput com setAttribute dinâmico
- [x] Adicionar reset de input para permitir mesmo arquivo novamente
- [ ] Testar em dispositivo mobile


## Sprint 9 - Redesign Visual (FASE 1)
- [x] Atualizar header com logo/branding MOPAR
- [x] Implementar layout responsivo com max-width
- [x] Redesenhar cards de seção com badges numeradas
- [x] Melhorar inputs com altura maior e foco visual
- [x] Redesenhar seção de materiais com cards
- [x] Melhorar preview de fotos
- [x] Botão enviar com sticky bottom no mobile
- [x] Validar que nenhuma lógica foi alterada
- [x] Rodar testes automatizados (25 testes passando)
- [ ] Smoke test: enviar sem foto
- [ ] Smoke test: enviar com foto da câmera

## Sprint 10 - Redesign Visual (FASE 2)
- [x] Polir componentes Card com hover/shadow/border
- [x] Melhorar Button com estados (hover/active/disabled/loading)
- [x] Polir Input com validação visual (erro/sucesso)
- [x] Adicionar microinterações (transitions/animations)
- [x] Melhorar Select com visual aprimorado
- [x] Adicionar feedback visual em fotos (upload/preview)
- [x] Validar que payload não mudou
- [x] Rodar testes automatizados (25 testes passando)
- [ ] Smoke test final


## Sprint 11 - Correções de UI/UX
- [x] Padronizar selects da seção "Equipe e Serviço" (altura h-12, largura w-full)
- [x] Abrir dropdown de lojas ao clicar/focar, mesmo com busca vazia
- [x] Testes automatizados (25 testes passando)
- [ ] Smoke test: enviar sem foto
- [ ] Smoke test: enviar com foto da câmera


## Sprint 12 - Correção de Bug - Botão Enviar
- [x] Investigar por que botão "Enviar Solicitação" não estava funcionando
- [x] Identificar que botão estava FORA do form
- [x] Mover botão para dentro do form (mantendo sticky bottom)
- [x] Validar que mutation está sendo chamada corretamente
- [x] Testes automatizados (25 testes passando)
- [ ] Smoke test: enviar sem foto
- [ ] Smoke test: enviar com foto da câmera


## Sprint 13 - Documentação Completa
- [x] Criar README.md (técnico completo)
- [x] Criar docs/MANUAL_USUARIO.md
- [x] Criar docs/RUNBOOK_TROUBLESHOOTING.md
- [x] Criar .env.example (via webdev_request_secrets)
- [x] Criar docs/ARQUITETURA.md
- [x] Criar docs/CONTRATO_WEBHOOK.md
- [x] Criar docs/ROADMAP.md
- [x] Verificar todos os arquivos
- [x] Confirmar caminhos


## Sprint 14 - Correção Crítica de Câmera
- [x] Investigar por que câmera não estava funcionando
- [x] Verificar atributo capture nos inputs (estava correto)
- [x] Verificar função triggerFileInput (remover setAttribute)
- [x] Corrigir implementação de câmera (remover lógica de setAttribute)
- [x] Adicionar logs de debug para troubleshooting
- [x] Criar testes de câmera (7 testes passando)
- [x] Criar guia de teste manual (TESTE_CAMERA_MANUAL.md)
- [x] Validar que galeria ainda funciona (testes passando)
- [x] Validar que upload de fotos funciona (4 testes passando)
- [x] Servidor rodando sem erros
- [ ] Teste manual em dispositivo mobile real (OBRIGATÓRIO)


## FASE 1 - Quick Wins (Melhorias de Design e Performance)

### Melhoria 1: Lazy Loading de Imagens
- [x] Criar hook useIntersectionObserver.ts
- [x] Adicionar loading="lazy" em imagens de preview
- [ ] Implementar picture element com WebP fallback (P3)
- [x] Criar testes para lazy loading (vitest)
- [x] Testar em navegador desktop (DevTools mobile)
- [ ] Testar em dispositivo mobile real (OBRIGATÓRIO)
- [ ] Validar performance com Lighthouse
- [x] Documentar implementação em FASE1_MELHORIA1_LAZY_LOADING.md
- [ ] Checkpoint: Lazy Loading completo

### Melhoria 2: Rate Limiting
- [x] Instalar express-rate-limit
- [x] Criar middleware rateLimit.ts
- [x] Implementar limiter global (100 req/15min)
- [x] Implementar limiter para solicitações (10 req/min)
- [x] Implementar limiter para upload (5 req/5min)
- [ ] Criar serviço de alertas para violações (P2)
- [x] Criar testes para rate limiting (vitest)
- [ ] Testar com múltiplas requisições simultâneas (OBRIGATÓRIO)
- [ ] Validar que alertas funcionam
- [x] Documentar em FASE1_MELHORIA2_RATE_LIMITING.md
- [ ] Checkpoint: Rate Limiting completo

### Melhoria 3: Feedback Visual Aprimorado
- [x] Criar componente AppToast.tsx (success/error/info/warning)
- [x] Criar componente UploadProgress.tsx
- [x] Adicionar contador de fotos anexadas (X/2)
- [x] Criar SuccessAnimation.tsx (confetti/checkmark)
- [x] Adicionar indicadores de campo obrigatório
- [x] Atualizar SolicitacaoForm.tsx com novos componentes
- [x] Criar testes para feedback visual (vitest)
- [ ] Testar em navegador desktop (OBRIGATÓRIO)
- [ ] Testar em dispositivo mobile real (OBRIGATÓRIO)
- [x] Validar acessibilidade (ARIA labels)
- [ ] Documentar em CHANGELOG.md
- [ ] Checkpoint: Feedback Visual completo

### Melhoria 4: Dark Mode
- [ ] Criar hook useTheme.ts
- [ ] Criar componente ThemeToggle.tsx
- [ ] Adicionar cores dark mode ao index.css
- [ ] Integrar toggle no header
- [ ] Implementar detecção de preferência do sistema
- [ ] Implementar persistência em localStorage
- [ ] Criar testes para dark mode (vitest)
- [ ] Testar em navegador desktop (light/dark)
- [ ] Testar em dispositivo mobile real
- [ ] Validar contraste de cores (WCAG AA)
- [ ] Documentar em CHANGELOG.md
- [ ] Checkpoint: Dark Mode completo

### Documentação Final Fase 1
- [ ] Atualizar README.md com novas features
- [ ] Criar CHANGELOG.md com todas as mudanças
- [ ] Criar FASE1_IMPLEMENTACAO.md com detalhes técnicos
- [ ] Criar FASE1_TESTES.md com guia de testes
- [ ] Atualizar ROADMAP.md com progresso
- [ ] Validar que todos os testes passam (vitest)
- [ ] Validar TypeScript sem erros
- [ ] Validar servidor rodando sem erros
- [ ] Criar relatório de performance (antes/depois)
- [ ] Checkpoint Final: Fase 1 Completa


## BUGS CRÍTICOS

### Bug: Câmera abre galeria em vez de capturar foto
- [x] Analisar problema de capture attribute
- [x] Identificar causa raiz: iOS/Safari ignora capture com accept simples
- [x] Implementar solução: accept="image/*;capture=environment"
- [x] Adicionar detecção de suporte a câmera
- [x] Criar testes para câmera (20 testes passando)
- [ ] Validar em iOS real (OBRIGATÓRIO antes de produção)
- [x] Documentar correção em BUG_FIX_CAMERA.md
- [ ] Checkpoint: Bug de câmera corrigido (DEFINITIVO)
