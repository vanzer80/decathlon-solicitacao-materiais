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
- [x] Enviar POST para webhook com token em query param
- [x] Implementar tratamento de erros e logging

## Fase 4: UX e Testes
- [x] Implementar tela de sucesso com Request_ID
- [x] Adicionar botão "Nova Solicitação" para resetar formulário
- [x] Aplicar visual corporativo Decathlon (azul #0082C3)
- [x] Otimizar para mobile-first
- [x] Criar testes unitários para utilitários (11 testes passando)
- [x] Testar envio de 1 material sem fotos
- [x] Testar envio de 2 materiais com 1 foto
- [x] Validar URLs públicas das fotos no Sheets
- [x] Testar honeypot anti-spam
- [x] Corrigir erro de resposta inválida do webhook

## Fase 5: Captura de Câmera
- [x] Criar componente CameraCapture.tsx com preview de câmera
- [x] Adicionar botão para tirar foto e confirmar/descartar
- [x] Integrar captura de câmera nos campos de foto do formulário
- [x] Permitir alternar entre galeria e câmera
- [x] Testar em navegadores desktop com webcam (funcionando)
- [ ] Testar em dispositivos móveis (iOS/Android)

## Fase 6: Compressão de Imagens
- [x] Criar utilitário de compressão com canvas API
- [x] Integrar compressão no CameraCapture.tsx
- [x] Integrar compressão no upload de galeria
- [x] Testar redução de tamanho de arquivo
- [x] Adicionar indicador de progresso de compressão
- [x] Validar qualidade de imagem após compressão
- [x] Exibir feedback de tamanho reduzido ao usuário

## Bugs Corrigidos
- [x] Resposta inválida do servidor (webhook retornando HTML 404)
- [x] Erro 401 do webhook (atualizada URL e método de autenticação)
- [x] Melhorar UX do dropdown de lojas (abrir todas as opções ao clicar)
- [x] Carregar dados atualizados de lojas da planilha (52 lojas)


## Redesign do Layout (Conforme Mockup)
- [x] Remover obrigatoriedade do "Número do Chamado"
- [x] Redesenhar com ícones em cada seção
- [x] Implementar abas para "Equipe Própria" vs "Terceirizada"
- [x] Reorganizar cards de materiais com layout melhorado
- [x] Adicionar botões "Enviar Solicitação" (azul) e "Salvar" (verde)
- [x] Testar responsividade mobile (funcionando)


## Nova Feature: Animação de Carregamento
- [x] Criar componente LoadingAnimation.tsx com spinner elegante
- [x] Integrar animação no fluxo de envio de solicitação
- [x] Exibir mensagem de status durante o envio
- [x] Testar animação em diferentes velocidades de conexão
- [x] Animação de sucesso com CheckCircle
- [x] Animação de erro com AlertCircle


## Auditoria Profunda - Problema: Dados Não Chegam na Planilha

### Fase 1: Investigação
- [ ] Verificar fluxo completo de envio de dados
- [ ] Analisar logs do servidor
- [ ] Verificar resposta do webhook
- [ ] Validar estrutura do payload
- [ ] Verificar upload de fotos
- [ ] Analisar tratamento de erros
- [ ] Revisar autenticação com Apps Script

### Fase 2: Correções
- [ ] Corrigir problemas identificados
- [ ] Adicionar logging detalhado
- [ ] Melhorar tratamento de erros
- [ ] Validar dados antes do envio
- [ ] Testar fluxo completo

### Fase 3: Validação
- [ ] Testar envio com 1 material
- [ ] Testar envio com múltiplos materiais
- [ ] Testar com fotos
- [ ] Verificar dados na planilha
- [ ] Validar URLs das fotos
