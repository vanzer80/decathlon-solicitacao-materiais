# Roadmap - MOPAR Solicitação de Materiais

**Versão**: 1.0 | **Última atualização**: Janeiro 2026

---

## 📋 Visão Geral

Este documento apresenta o roadmap de features planejadas, priorizadas por impacto e esforço.

**Status Atual**: MVP 1.0 (Produção)  
**Próxima Release**: Q1 2026

---

## ✅ Features Implementadas (MVP 1.0)

### Core
- [x] Formulário de solicitação com 3 seções
- [x] Repetidor dinâmico de materiais (1-10 itens)
- [x] Upload de fotos (câmera + galeria, máx 2 por material)
- [x] Integração com Google Apps Script + Google Sheets
- [x] Geração de Request_ID único
- [x] Validação completa (frontend + backend)
- [x] Honeypot anti-spam
- [x] Tratamento de erros com retry automático

### UI/UX
- [x] Design corporativo moderno (Tailwind CSS 4)
- [x] Mobile-first responsivo
- [x] Cards com badges e hierarquia visual
- [x] Inputs touch-friendly
- [x] Botões com estados (hover/active/disabled/loading)
- [x] Microinterações e transições suaves
- [x] Modal de diagnóstico de webhook
- [x] Página de sucesso com Request_ID

### Histórico
- [x] Listagem de solicitações anteriores
- [x] Filtros (data, loja, request_id)
- [x] Paginação (10 itens/página)
- [x] Modal de detalhes
- [x] Visualização de fotos

### Operacional
- [x] Testes unitários (25 testes)
- [x] Logs detalhados (frontend + backend)
- [x] Diagnóstico de webhook
- [x] Documentação técnica
- [x] Manual do usuário

---

## 🚀 Backlog Priorizado

### P0 - CRÍTICO (Implementar ASAP)

#### 1. Notificação por WhatsApp
**Impacto**: Alto | **Esforço**: Médio | **Prazo**: 1-2 semanas

Enviar SMS/WhatsApp ao técnico quando solicitação for aceita no Google Sheets.

**Requisitos**:
- Integração Twilio ou Manus Notification API
- Campo "telefone" já existe no formulário
- Enviar: "Solicitação REQ-XXX aceita. Aguardando processamento."
- Rastrear status de entrega

**Benefício**: Técnico recebe confirmação em tempo real

**Estimativa**: 40 horas

---

#### 2. Status de Processamento
**Impacto**: Alto | **Esforço**: Médio | **Prazo**: 1-2 semanas

Adicionar coluna "Status" na planilha e exibir no histórico com badge colorida.

**Requisitos**:
- Coluna "Status" no Google Sheets (Pendente/Processando/Concluído)
- Backend sincroniza status do Sheets
- Frontend exibe badge: 🟡 Pendente | 🔵 Processando | 🟢 Concluído
- Filtro por status no histórico

**Benefício**: Rastreamento completo da solicitação

**Estimativa**: 30 horas

---

#### 3. Reenvio de Solicitações
**Impacto**: Médio | **Esforço**: Médio | **Prazo**: 1-2 semanas

Botão "Reenviar" no histórico para duplicar solicitação anterior.

**Requisitos**:
- Botão "Reenviar" em cada solicitação
- Pré-preencher formulário com dados anteriores
- Permitir editar materiais antes de reenviar
- Gerar novo Request_ID

**Benefício**: Reduz tempo de entrada de dados

**Estimativa**: 25 horas

---

### P1 - IMPORTANTE (Próximas 4 semanas)

#### 4. Assinatura Digital
**Impacto**: Médio | **Esforço**: Alto | **Prazo**: 2-3 semanas

Captura de assinatura do técnico antes de enviar.

**Requisitos**:
- Canvas para desenhar assinatura
- Botão "Limpar" e "Confirmar"
- Salvar como imagem PNG
- Upload para S3 como foto adicional
- Exibir no histórico

**Benefício**: Maior rastreabilidade e autenticação

**Estimativa**: 50 horas

---

#### 5. Exportar Relatório (PDF/Excel)
**Impacto**: Médio | **Esforço**: Médio | **Prazo**: 2 semanas

Botão para exportar histórico filtrado como PDF ou Excel.

**Requisitos**:
- Usar biblioteca: pdfkit ou xlsx
- Incluir: Request_ID, Loja, Solicitante, Materiais, Fotos, Status, Data
- Filtros aplicados na exportação
- Download automático

**Benefício**: Facilita análise e compartilhamento

**Estimativa**: 30 horas

---

#### 6. Busca Avançada
**Impacto**: Médio | **Esforço**: Baixo | **Prazo**: 1 semana

Melhorar busca com autocomplete e sugestões.

**Requisitos**:
- Busca por Request_ID com autocomplete
- Busca por nome de solicitante
- Busca por material (descrição)
- Histórico de buscas recentes

**Benefício**: Encontrar solicitações mais rápido

**Estimativa**: 15 horas

---

### P2 - LEGAL/COMPLIANCE (Próximas 8 semanas)

#### 7. Conformidade LGPD
**Impacto**: Alto | **Esforço**: Alto | **Prazo**: 4 semanas

Implementar conformidade com LGPD.

**Requisitos**:
- Política de Privacidade
- Termo de Consentimento
- Direito ao esquecimento (deletar dados)
- Exportação de dados do usuário
- Auditoria de acesso

**Benefício**: Conformidade legal

**Estimativa**: 60 horas

---

#### 8. Autenticação com Login
**Impacto**: Médio | **Esforço**: Alto | **Prazo**: 3 semanas

Adicionar autenticação para rastrear técnico.

**Requisitos**:
- Login via Manus OAuth ou email/senha
- Associar solicitações ao usuário
- Histórico pessoal (apenas minhas solicitações)
- Dashboard com estatísticas

**Benefício**: Rastreamento de quem enviou

**Estimativa**: 50 horas

---

### P3 - NICE-TO-HAVE (Backlog Futuro)

#### 9. Dashboard de Análise
**Impacto**: Médio | **Esforço**: Alto

Dashboard com gráficos:
- Solicitações por loja
- Solicitações por tipo de serviço
- Tempo médio de processamento
- Taxa de sucesso
- Materiais mais solicitados

**Estimativa**: 60 horas

---

#### 10. Integração com Jira/Azure DevOps
**Impacto**: Médio | **Esforço**: Alto

Criar ticket automático em Jira quando solicitação chegar.

**Requisitos**:
- Webhook para Jira
- Mapear campos
- Sincronizar status

**Estimativa**: 40 horas

---

#### 11. Notificação por Email
**Impacto**: Baixo | **Esforço**: Baixo

Enviar email com resumo da solicitação.

**Requisitos**:
- Template HTML
- Incluir: Request_ID, Loja, Materiais, Fotos
- Enviar ao técnico e gerente

**Estimativa**: 10 horas

---

#### 12. Offline Mode
**Impacto**: Médio | **Esforço**: Alto

Permitir preenchimento offline e sincronizar ao conectar.

**Requisitos**:
- Service Worker
- IndexedDB para cache
- Sincronização automática
- Indicador de status offline

**Estimativa**: 80 horas

---

#### 13. Integração com Câmera 360°
**Impacto**: Baixo | **Esforço**: Alto

Capturar foto 360° do local do problema.

**Requisitos**:
- Biblioteca de câmera 360°
- Salvar como imagem panorâmica
- Upload para S3
- Visualização no histórico

**Estimativa**: 100 horas

---

#### 14. Notificação em Tempo Real
**Impacto**: Médio | **Esforço**: Alto

WebSocket para notificações em tempo real.

**Requisitos**:
- Socket.io ou WebSocket nativo
- Notificar quando status muda
- Notificar quando comentário adicionado
- Badge de notificações

**Estimativa**: 50 horas

---

## 📊 Roadmap Timeline

```
Q1 2026 (Jan-Mar)
├─ P0.1 WhatsApp Notification (1-2 sem)
├─ P0.2 Status Processing (1-2 sem)
├─ P0.3 Reenvio (1-2 sem)
├─ P1.1 Assinatura Digital (2-3 sem)
└─ P1.2 Exportar Relatório (2 sem)

Q2 2026 (Abr-Jun)
├─ P1.3 Busca Avançada (1 sem)
├─ P2.1 Conformidade LGPD (4 sem)
├─ P2.2 Autenticação com Login (3 sem)
└─ P3.1 Dashboard de Análise (4 sem)

Q3 2026 (Jul-Set)
├─ P3.2 Integração Jira (2-3 sem)
├─ P3.3 Notificação Email (1 sem)
├─ P3.4 Offline Mode (4-5 sem)
└─ P3.5 Câmera 360° (5-6 sem)

Q4 2026 (Out-Dez)
├─ P3.6 Notificação Real-time (2-3 sem)
├─ Melhorias de Performance
├─ Testes de Carga
└─ Otimizações de UX
```

---

## 🎯 Critérios de Priorização

### Impacto
- **Alto**: Melhora significativa na experiência do usuário ou operação
- **Médio**: Melhora notável
- **Baixo**: Melhora marginal

### Esforço
- **Baixo**: < 20 horas
- **Médio**: 20-50 horas
- **Alto**: > 50 horas

### Urgência
- **P0 - Crítico**: Implementar ASAP (bloqueia outras features)
- **P1 - Importante**: Próximas 4 semanas
- **P2 - Legal**: Próximas 8 semanas
- **P3 - Nice-to-have**: Backlog futuro

---

## 🔄 Processo de Desenvolvimento

### Para Cada Feature

1. **Planning** (1-2 dias)
   - Detalhar requisitos
   - Estimar esforço
   - Identificar riscos

2. **Design** (2-3 dias)
   - Mockups/wireframes
   - Fluxo de dados
   - Arquitetura

3. **Desenvolvimento** (5-10 dias)
   - Implementar backend
   - Implementar frontend
   - Testes unitários

4. **QA** (2-3 dias)
   - Testes manuais
   - Smoke tests
   - Testes de regressão

5. **Deploy** (1 dia)
   - Merge para main
   - Deploy em staging
   - Deploy em produção
   - Monitoramento

6. **Feedback** (contínuo)
   - Coletar feedback dos usuários
   - Corrigir bugs
   - Otimizações

---

## 📈 Métricas de Sucesso

### Para Cada Feature

- [ ] Testes unitários passando (> 90% cobertura)
- [ ] Smoke tests manuais OK
- [ ] Sem regressões
- [ ] Performance aceitável (< 2s)
- [ ] Feedback positivo dos usuários
- [ ] Zero erros em produção (7 dias)

---

## 💡 Ideias Futuras (Brainstorm)

- [ ] Integração com Slack/Teams
- [ ] Chatbot para suporte
- [ ] Machine Learning para categorizar materiais
- [ ] Previsão de demanda
- [ ] Integração com fornecedores
- [ ] Portal para gerentes (análise)
- [ ] Mobile app nativa (React Native)
- [ ] Integração com IoT (sensores)
- [ ] Gamificação (pontos, rankings)
- [ ] Integração com sistemas ERP

---

## 🤝 Contribuição

Para sugerir novas features:

1. Abrir issue no GitHub
2. Descrever o problema e solução
3. Indicar impacto e esforço estimado
4. Aguardar feedback da equipe

---

**Última atualização**: 30 de janeiro de 2026  
**Mantido por**: Equipe de Produto MOPAR
