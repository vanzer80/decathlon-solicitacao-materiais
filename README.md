# Solicitação de Materiais - MOPAR

**Versão**: 1.0.0 | **Status**: Production Ready | **Última atualização**: Janeiro 2026

## 📋 Visão Geral

Sistema web mobile-first para técnicos de campo da MOPAR solicitarem materiais de forma rápida, segura e sem login. Integrado com Google Sheets via Apps Script para registro centralizado de solicitações, com suporte a upload de fotos via câmera ou galeria.

**Problema**: Técnicos precisavam de forma manual e lenta para solicitar materiais, sem rastreamento centralizado.

**Solução**: Web app público, responsivo, com validação em tempo real, upload de fotos, e integração automática com Google Sheets.

---

## ✨ Features Implementadas

### Formulário de Solicitação
- **Seção 1 - Dados Principais**: Loja/Cliente (dropdown com 51 lojas), nome solicitante, telefone/WhatsApp, número do chamado
- **Seção 2 - Equipe e Serviço**: Tipo de equipe (Própria/Terceirizada), empresa terceira, tipo de serviço (Preventiva/Corretiva), sistema afetado (HVAC/Elétrica/Hidráulica/Civil/PPCI/Outros), descrição geral
- **Seção 3 - Materiais**: Repetidor dinâmico com campos para cada material:
  - Descrição do material
  - Especificação (opcional)
  - Quantidade + Unidade (un/cx/par/m/kg/L/rolo/kit/outro)
  - Urgência (Alta/Média/Baixa)
  - Até 2 fotos por material (máx 5MB cada)

### Upload de Fotos
- Botão **Câmera**: Aciona câmera traseira do dispositivo (`capture="environment"`)
- Botão **Galeria**: Abre seletor de arquivos
- Preview em miniatura após seleção
- Validação de tipo (image/*) e tamanho (5MB máx)
- Upload para S3 com URLs públicas
- Suporte a Android/iOS

### Histórico de Solicitações
- Listagem com filtros por data, loja, Request_ID
- Paginação automática
- Modal com detalhes completos
- Botões "Voltar" e "Nova Solicitação"
- Exibição de fotos anexadas

### Segurança
- Honeypot anti-spam (campo oculto)
- Token de webhook em query param + header
- Validação de Request_ID único
- Detecção de HTML em respostas webhook
- Diagnóstico de webhook com logs detalhados

### UI/UX
- Design corporativo moderno com cores MOPAR (#0082C3)
- Mobile-first, responsivo até desktop
- Cards com badges numeradas
- Inputs touch-friendly (h-12)
- Microinterações (hover/focus/loading)
- Sticky bottom button no mobile
- Gradiente suave de fundo

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ SolicitacaoForm.tsx - Formulário principal           │  │
│  │ Historico.tsx - Listagem de solicitações             │  │
│  │ SuccessPage.tsx - Página de sucesso com Request_ID   │  │
│  │ Home.tsx - Landing page                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓ tRPC                             │
├─────────────────────────────────────────────────────────────┤
│                    BACKEND (Express + tRPC)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ server/routers/solicitacoes.ts - Submit solicitação  │  │
│  │ server/routers/upload.ts - Upload de fotos           │  │
│  │ server/routers/historico.ts - Listar solicitações    │  │
│  │ server/routers/webhook.ts - Diagnóstico webhook      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ server/services/webhookService.ts - Integração Apps  │  │
│  │ server/services/uploadService.ts - Upload S3         │  │
│  │ server/db.ts - Queries do banco                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
├─────────────────────────────────────────────────────────────┤
│                    DATABASE (MySQL/TiDB)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ solicitacoes - Tabela principal                      │  │
│  │ solicitacao_items - Itens de cada solicitação        │  │
│  │ users - Usuários (auth)                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
├─────────────────────────────────────────────────────────────┤
│                    STORAGE (AWS S3)                         │
│  Fotos públicas com URLs assinadas                         │
│                          ↓                                  │
├─────────────────────────────────────────────────────────────┤
│              GOOGLE APPS SCRIPT + SHEETS                    │
│  Webhook recebe JSON e insere linhas na planilha           │
│  Colunas: Loja, Solicitante, Materiais, Fotos, Status     │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

1. **Preenchimento**: Técnico preenche formulário no frontend
2. **Upload de Fotos**: Cada foto é enviada para S3 via `trpc.upload.uploadPhoto`
3. **Submissão**: Dados + URLs de fotos são enviados via `trpc.solicitacoes.submit`
4. **Webhook**: Backend chama Google Apps Script com payload JSON
5. **Registro**: Apps Script insere linha na planilha do Google Sheets
6. **Sucesso**: Frontend exibe Request_ID único e redireciona para página de sucesso
7. **Histórico**: Técnico pode consultar solicitações anteriores em `/historico`

---

## 🚀 Setup Local

### Pré-requisitos
- Node.js 22.13.0+
- pnpm 10.4.1+
- MySQL 8.0+ ou TiDB
- Conta Google (para Apps Script)
- Conta AWS (para S3)

### Instalação

```bash
# 1. Clonar repositório
git clone <repo-url>
cd decathlon-solicitacao-materiais

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com valores reais

# 4. Criar/migrar banco de dados
pnpm db:push

# 5. Iniciar servidor de desenvolvimento
pnpm dev
```

Acesse em `http://localhost:3000`

### Estrutura de Pastas

```
decathlon-solicitacao-materiais/
├── client/                          # Frontend React
│   ├── public/
│   │   └── lojas.json              # Lista de 51 lojas
│   ├── src/
│   │   ├── pages/
│   │   │   ├── SolicitacaoForm.tsx  # Formulário principal (~850 linhas)
│   │   │   ├── Historico.tsx        # Histórico de solicitações
│   │   │   ├── SuccessPage.tsx      # Página de sucesso
│   │   │   ├── Home.tsx             # Landing page
│   │   │   └── NotFound.tsx         # 404
│   │   ├── components/
│   │   │   ├── DashboardLayout.tsx  # Layout sidebar
│   │   │   ├── ErrorBoundary.tsx    # Error boundary
│   │   │   └── Map.tsx              # Google Maps (não usado)
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx     # Tema light/dark
│   │   ├── lib/
│   │   │   └── trpc.ts              # Cliente tRPC
│   │   ├── App.tsx                  # Rotas principais
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Estilos globais + Tailwind
│   └── index.html
├── server/                          # Backend Express + tRPC
│   ├── routers/
│   │   ├── solicitacoes.ts          # Endpoint /api/trpc/solicitacoes.submit
│   │   ├── upload.ts                # Endpoint /api/trpc/upload.uploadPhoto
│   │   ├── historico.ts             # Endpoint /api/trpc/historico.list
│   │   └── webhook.ts               # Endpoint /api/trpc/webhook.diagnose
│   ├── services/
│   │   ├── webhookService.ts        # Integração Google Apps Script
│   │   ├── uploadService.ts         # Upload S3
│   │   └── webhookDiagnostic.ts     # Diagnóstico de webhook
│   ├── db.ts                        # Query helpers
│   ├── routers.ts                   # Router principal (agrega todos)
│   ├── auth.logout.test.ts          # Teste de logout
│   ├── utils.test.ts                # Testes de validação
│   ├── upload.test.ts               # Testes de upload
│   ├── historico.test.ts            # Testes de histórico
│   ├── webhook.test.ts              # Testes de webhook
│   └── _core/                       # Framework plumbing
│       ├── index.ts                 # Express server
│       ├── context.ts               # tRPC context
│       ├── trpc.ts                  # tRPC router/procedure
│       ├── env.ts                   # Variáveis de ambiente
│       ├── llm.ts                   # LLM integration
│       ├── voiceTranscription.ts    # Voice API
│       ├── imageGeneration.ts       # Image API
│       ├── notification.ts          # Notificação para owner
│       ├── map.ts                   # Maps API
│       ├── cookies.ts               # Session cookies
│       └── systemRouter.ts          # System endpoints
├── drizzle/                         # Database schema
│   ├── schema.ts                    # Tabelas: users, solicitacoes, solicitacao_items
│   └── migrations/                  # Migrações automáticas
├── shared/                          # Código compartilhado
│   ├── types.ts                     # Tipos TypeScript
│   ├── utils.ts                     # Funções utilitárias
│   └── const.ts                     # Constantes
├── storage/                         # S3 helpers
│   └── (helpers S3)
├── docs/                            # Documentação
│   ├── MANUAL_USUARIO.md
│   ├── RUNBOOK_TROUBLESHOOTING.md
│   ├── ARQUITETURA.md
│   ├── CONTRATO_WEBHOOK.md
│   └── ROADMAP.md
├── .env.example                     # Variáveis de ambiente
├── README.md                        # Este arquivo
├── package.json
├── tsconfig.json
├── vite.config.ts
├── drizzle.config.ts
└── vitest.config.ts
```

---

## 🔧 Variáveis de Ambiente

| Variável | Descrição | Exemplo | Obrigatório |
|----------|-----------|---------|------------|
| `DATABASE_URL` | Conexão MySQL/TiDB | `mysql://user:pass@host/db` | ✅ |
| `JWT_SECRET` | Secret para session cookies | `your-secret-key-here` | ✅ |
| `WEBHOOK_URL` | URL do Google Apps Script | `https://script.google.com/macros/s/.../exec` | ✅ |
| `WEBHOOK_TOKEN` | Token de autenticação webhook | `DECATHLON-2026` | ✅ |
| `USE_MOCK_WEBHOOK` | Usar webhook mock para testes | `false` | ❌ |
| `VITE_APP_ID` | Manus OAuth app ID | `app-id-here` | ✅ |
| `OAUTH_SERVER_URL` | Manus OAuth server | `https://api.manus.im` | ✅ |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal | `https://login.manus.im` | ✅ |
| `OWNER_OPEN_ID` | Owner's Manus OpenID | `owner-id` | ✅ |
| `OWNER_NAME` | Owner's name | `Admin User` | ✅ |
| `BUILT_IN_FORGE_API_URL` | Manus Forge API URL | `https://forge.manus.im` | ✅ |
| `BUILT_IN_FORGE_API_KEY` | Manus Forge API key | `key-here` | ✅ |
| `VITE_FRONTEND_FORGE_API_URL` | Frontend Forge API URL | `https://forge.manus.im` | ✅ |
| `VITE_FRONTEND_FORGE_API_KEY` | Frontend Forge API key | `key-here` | ✅ |

---

## 🧪 Testes

### Testes Unitários

```bash
# Rodar todos os testes
pnpm test

# Rodar teste específico
pnpm test server/webhook.test.ts

# Watch mode
pnpm test --watch
```

**Cobertura**: 25 testes passando
- `auth.logout.test.ts` - Logout flow
- `utils.test.ts` - Validação de Request_ID, HTML detection
- `upload.test.ts` - Upload de fotos
- `historico.test.ts` - Listagem de solicitações
- `webhook.test.ts` - Integração webhook

### Smoke Tests Manuais (Obrigatório)

#### Teste 1: Enviar sem fotos
1. Abrir `http://localhost:3000`
2. Preencher: Loja (ESCRITÓRIO), Nome, Telefone, Número Chamado
3. Adicionar 1 material: Descrição, Quantidade, Urgência (sem fotos)
4. Clicar "Enviar Solicitação"
5. ✅ Deve exibir Request_ID e redirecionar para `/sucesso`
6. ✅ Linha deve aparecer no Google Sheets

#### Teste 2: Enviar com foto da câmera
1. Abrir em dispositivo mobile (ou emulador)
2. Preencher formulário
3. Adicionar material e clicar botão "Câmera"
4. Tirar foto
5. Clicar "Enviar Solicitação"
6. ✅ Deve enviar com foto URL no Sheets
7. ✅ Foto deve ser acessível via URL S3

#### Teste 3: Histórico
1. Após enviar solicitação, clicar "Histórico"
2. Deve listar solicitações anteriores
3. Clicar em uma solicitação
4. ✅ Deve exibir modal com detalhes e fotos

---

## 🚢 Deploy

### Checklist Pré-Deploy

- [ ] Todos os testes passando (`pnpm test`)
- [ ] Sem erros TypeScript (`pnpm check`)
- [ ] `.env.local` configurado com valores de produção
- [ ] `WEBHOOK_URL` publicado como Web App "Anyone" no Apps Script
- [ ] S3 bucket criado e acessível
- [ ] Database migrado (`pnpm db:push`)
- [ ] Smoke tests manuais OK

### Deploy na Manus

1. **Criar checkpoint** (já feito)
2. **Clicar "Publish"** no Management UI
3. **Configurar domínio** (Settings → Domains)
4. **Validar em produção**:
   - Enviar solicitação teste
   - Verificar Google Sheets
   - Testar histórico

### Deploy em Outro Servidor

```bash
# Build
pnpm build

# Start
NODE_ENV=production node dist/index.js
```

Servidor roda em `http://localhost:3000` (porta configurável via `PORT` env var)

---

## 🔐 Segurança

### Práticas Implementadas

1. **Honeypot**: Campo oculto `email_confirm` para detectar bots
2. **Token Webhook**: Enviado em query param + header `X-Webhook-Token`
3. **Request_ID Único**: Gerado com timestamp + random hash
4. **Validação de Arquivo**: Tipo (image/*) + tamanho (5MB máx)
5. **HTML Detection**: Webhook detecta se resposta é HTML (erro 401/403)
6. **Session Cookies**: Assinados com JWT_SECRET, HttpOnly, Secure

### ⚠️ Nunca Commitar

- `.env.local` (use `.env.example`)
- `WEBHOOK_TOKEN` em código
- `JWT_SECRET` em código
- Credenciais AWS/Google em código

---

## 🤝 Contribuição

### Branching Strategy

```
main (produção)
  ↑
  ├── develop (staging)
  │   ↑
  │   ├── feature/nova-funcionalidade
  │   ├── fix/bug-correcao
  │   └── docs/atualizacao-documentacao
```

### PR Checklist

- [ ] Branch criado de `develop`
- [ ] Testes novos adicionados (se feature)
- [ ] Testes passando (`pnpm test`)
- [ ] TypeScript sem erros (`pnpm check`)
- [ ] Código formatado (`pnpm format`)
- [ ] Commit message descritivo
- [ ] PR description com contexto
- [ ] Smoke tests manuais OK

### Padrões de Código

- **Componentes**: PascalCase, em `client/src/pages/` ou `client/src/components/`
- **Funções**: camelCase, com tipos TypeScript explícitos
- **Variáveis de Env**: SCREAMING_SNAKE_CASE
- **Imports**: Absolutos com `@/` alias
- **Estilos**: Tailwind CSS, sem CSS custom (usar design tokens)

---

## 🐛 Troubleshooting

### Problema: "Webhook retornou HTML"

**Causa**: Apps Script não está publicado como Web App público.

**Solução**:
1. Abrir Google Apps Script
2. Clicar "Deploy" → "New deployment"
3. Type: "Web app"
4. Execute as: Sua conta
5. Who has access: **"Anyone"** (não "Me")
6. Deploy e copiar URL
7. Atualizar `WEBHOOK_URL` em `.env.local`

### Problema: "401 Unauthorized"

**Causa**: Token webhook incorreto ou não enviado.

**Solução**:
1. Verificar `WEBHOOK_TOKEN` em `.env.local`
2. Verificar que token é enviado em query param: `?token=DECATHLON-2026`
3. Verificar header: `X-Webhook-Token: DECATHLON-2026`
4. Usar botão "Diagnosticar Webhook" no app para testar

### Problema: Upload de foto falha

**Causa**: Arquivo > 5MB ou tipo não suportado.

**Solução**:
1. Verificar tamanho (máx 5MB)
2. Verificar tipo (deve ser image/*)
3. Tentar novamente com foto menor
4. Se persistir, usar "Diagnosticar Webhook" para ver logs

### Problema: "Nenhuma loja encontrada"

**Causa**: Arquivo `client/public/lojas.json` não carregou.

**Solução**:
1. Verificar se arquivo existe
2. Verificar formato JSON válido
3. Recarregar página (Ctrl+Shift+R para limpar cache)

---

## 📞 Suporte

- **Issues**: Abrir issue no GitHub com contexto
- **Logs**: Verificar `.manus-logs/` no servidor
- **Webhook**: Usar botão "Diagnosticar Webhook" no app
- **Database**: Usar Management UI → Database panel

---

## 📄 Licença

MIT

---

**Última atualização**: 30 de janeiro de 2026  
**Mantido por**: Equipe MOPAR
