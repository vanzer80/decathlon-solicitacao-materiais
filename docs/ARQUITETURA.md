# Arquitetura - MOPAR Solicitação de Materiais

**Versão**: 1.0 | **Última atualização**: Janeiro 2026

---

## 🏗️ Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENTE (NAVEGADOR)                          │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ React 19 + Tailwind CSS 4 + TypeScript                         │ │
│  │ ┌──────────────────────────────────────────────────────────┐   │ │
│  │ │ SolicitacaoForm.tsx (850+ linhas)                        │   │ │
│  │ │ - Formulário com 3 seções                               │   │ │
│  │ │ - Upload de fotos (câmera + galeria)                    │   │ │
│  │ │ - Validação em tempo real                               │   │ │
│  │ │ - Envio via tRPC                                        │   │ │
│  │ └──────────────────────────────────────────────────────────┘   │ │
│  │ ┌──────────────────────────────────────────────────────────┐   │ │
│  │ │ Historico.tsx                                            │   │ │
│  │ │ - Listagem com filtros                                  │   │ │
│  │ │ - Paginação                                             │   │ │
│  │ │ │ Modal de detalhes                                      │   │ │
│  │ └──────────────────────────────────────────────────────────┘   │ │
│  │ ┌──────────────────────────────────────────────────────────┐   │ │
│  │ │ SuccessPage.tsx                                          │   │ │
│  │ │ - Exibe Request_ID                                      │   │ │
│  │ │ - Botões: Histórico, Nova Solicitação                   │   │ │
│  │ └──────────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ tRPC
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVIDOR (Express + tRPC)                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ server/routers.ts - Router Principal                          │ │
│  │ ├── solicitacoes.submit (POST)                               │ │
│  │ ├── upload.uploadPhoto (POST)                                │ │
│  │ ├── historico.list (GET)                                     │ │
│  │ └── webhook.diagnose (POST)                                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ server/services/                                              │ │
│  │ ├── webhookService.ts                                        │ │
│  │ │   └── callWebhook() → Google Apps Script                  │ │
│  │ ├── uploadService.ts                                         │ │
│  │ │   └── uploadToS3() → AWS S3                               │ │
│  │ └── webhookDiagnostic.ts                                     │ │
│  │     └── diagnoseWebhook() → Testa conexão                   │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ server/db.ts - Query Helpers                                  │ │
│  │ ├── createSolicitacao()                                       │ │
│  │ ├── createSolicitacaoItem()                                   │ │
│  │ └── listSolicitacoes()                                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE (MySQL/TiDB)                            │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ solicitacoes (Tabela Principal)                               │ │
│  │ ├── id (PK)                                                  │ │
│  │ ├── request_id (UNIQUE)                                      │ │
│  │ ├── loja_id                                                  │ │
│  │ ├── nome_solicitante                                         │ │
│  │ ├── telefone                                                 │ │
│  │ ├── numero_chamado                                           │ │
│  │ ├── tipo_equipe                                              │ │
│  │ ├── empresa_terceira                                         │ │
│  │ ├── tipo_servico                                             │ │
│  │ ├── sistema_afetado                                          │ │
│  │ ├── descricao_geral                                          │ │
│  │ ├── created_at                                               │ │
│  │ └── updated_at                                               │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ solicitacao_items (Itens de Cada Solicitação)                 │ │
│  │ ├── id (PK)                                                  │ │
│  │ ├── solicitacao_id (FK)                                      │ │
│  │ ├── descricao                                                │ │
│  │ ├── especificacao                                            │ │
│  │ ├── quantidade                                               │ │
│  │ ├── unidade                                                  │ │
│  │ ├── urgencia                                                 │ │
│  │ ├── foto1_url                                                │ │
│  │ ├── foto2_url                                                │ │
│  │ ├── created_at                                               │ │
│  │ └── updated_at                                               │ │
│  └────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ users (Usuários - Auth)                                       │ │
│  │ ├── id (PK)                                                  │ │
│  │ ├── openId (UNIQUE)                                          │ │
│  │ ├── name                                                     │ │
│  │ ├── email                                                    │ │
│  │ ├── role (admin | user)                                      │ │
│  │ └── ...                                                      │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    STORAGE (AWS S3)                                 │
│  Bucket: mopar-solicitacoes                                        │
│  Estrutura: {userId}-files/{fileName}-{randomSuffix}.jpg           │
│  Permissões: Público (leitura)                                     │
│  URLs: https://mopar-solicitacoes.s3.amazonaws.com/...             │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│              GOOGLE APPS SCRIPT + GOOGLE SHEETS                     │
│  Webhook: POST com JSON                                            │
│  Resposta: { "ok": true }                                          │
│  Planilha: Solicitações de Materiais                               │
│  Colunas: Loja, Solicitante, Materiais, Fotos, Status, Data       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Fluxo de Dados - Submissão de Solicitação

```
1. PREENCHIMENTO (Frontend)
   ├─ Técnico preenche formulário
   ├─ Validação em tempo real (Zod)
   └─ Honeypot anti-spam

2. UPLOAD DE FOTOS (Frontend → S3)
   ├─ Para cada foto:
   │  ├─ Validar tipo (image/*)
   │  ├─ Validar tamanho (< 5MB)
   │  ├─ Chamar tRPC: upload.uploadPhoto()
   │  └─ Receber URL pública S3
   └─ Armazenar URLs em estado local

3. SUBMISSÃO (Frontend → Backend)
   ├─ Chamar tRPC: solicitacoes.submit()
   ├─ Payload incluir:
   │  ├─ Dados principais
   │  ├─ Equipe e serviço
   │  ├─ Array de materiais com URLs de fotos
   │  └─ Token honeypot
   └─ Enviar para backend

4. PROCESSAMENTO (Backend)
   ├─ Validar payload (Zod schema)
   ├─ Gerar Request_ID único
   ├─ Salvar em database:
   │  ├─ INSERT INTO solicitacoes
   │  └─ INSERT INTO solicitacao_items (para cada material)
   └─ Preparar para webhook

5. WEBHOOK (Backend → Google Apps Script)
   ├─ Construir JSON com todos dados
   ├─ Enviar POST com:
   │  ├─ Query param: ?token=DECATHLON-2026
   │  ├─ Header: X-Webhook-Token: DECATHLON-2026
   │  ├─ Body: JSON completo
   │  └─ Content-Type: application/json
   ├─ Retry automático se falha de rede (1x, backoff 800ms)
   └─ Validar resposta: { "ok": true }

6. GOOGLE SHEETS (Apps Script)
   ├─ Receber JSON
   ├─ Validar token
   ├─ Inserir linha na planilha
   ├─ Colunas: Loja, Solicitante, Materiais, Fotos, Status, Data
   └─ Retornar { "ok": true }

7. SUCESSO (Frontend)
   ├─ Exibir Request_ID
   ├─ Redirecionar para /sucesso
   ├─ Oferecer botões:
   │  ├─ Histórico
   │  └─ Nova Solicitação
   └─ Limpar formulário
```

---

## 🔄 Fluxo de Dados - Consulta de Histórico

```
1. ACESSO (Frontend)
   ├─ Técnico clica em "Histórico"
   ├─ Navega para /historico
   └─ Carrega página

2. LISTAGEM (Frontend → Backend)
   ├─ Chamar tRPC: historico.list()
   ├─ Parâmetros opcionais:
   │  ├─ dataInicio (filtro)
   │  ├─ dataFim (filtro)
   │  ├─ lojaId (filtro)
   │  ├─ requestId (busca)
   │  └─ page (paginação)
   └─ Enviar para backend

3. QUERY (Backend)
   ├─ Validar parâmetros
   ├─ Construir SQL com filtros
   ├─ SELECT * FROM solicitacoes WHERE ...
   ├─ Ordenar por created_at DESC
   ├─ Paginar (limit 10, offset)
   └─ Retornar array de solicitações

4. EXIBIÇÃO (Frontend)
   ├─ Renderizar tabela com:
   │  ├─ Request_ID
   │  ├─ Loja
   │  ├─ Solicitante
   │  ├─ Data
   │  └─ Botão "Ver Detalhes"
   ├─ Paginação na parte inferior
   └─ Filtros no topo

5. DETALHES (Frontend → Backend)
   ├─ Técnico clica em solicitação
   ├─ Chamar tRPC: historico.getDetail(requestId)
   ├─ Backend retorna:
   │  ├─ Dados da solicitação
   │  ├─ Array de materiais
   │  └─ URLs de fotos
   └─ Exibir em modal

6. MODAL (Frontend)
   ├─ Exibir todos dados
   ├─ Mostrar fotos em miniatura
   ├─ Clicar em foto → abrir em fullscreen
   ├─ Botão "Reenviar" (futuro)
   └─ Botão "Fechar"
```

---

## 🔐 Fluxo de Segurança

```
1. HONEYPOT (Anti-spam)
   ├─ Campo oculto "email_confirm" no formulário
   ├─ Se preenchido → rejeitar (é bot)
   └─ Se vazio → continuar (é humano)

2. VALIDAÇÃO (Frontend)
   ├─ Zod schema valida tipos
   ├─ Comprimento mínimo/máximo
   ├─ Formato (email, telefone, etc)
   └─ Mensagens de erro claras

3. VALIDAÇÃO (Backend)
   ├─ Revalidar com Zod (nunca confiar no cliente)
   ├─ Verificar Request_ID único
   ├─ Validar tamanho de arquivo
   └─ Rejeitar se inválido

4. TOKEN WEBHOOK
   ├─ Enviado em 2 lugares:
   │  ├─ Query param: ?token=DECATHLON-2026
   │  └─ Header: X-Webhook-Token: DECATHLON-2026
   ├─ Apps Script valida
   └─ Rejeita se não corresponder

5. DETECÇÃO DE HTML
   ├─ Se webhook retorna HTML (erro 401/403)
   ├─ Detectar com regex: /<html|<!DOCTYPE/i
   ├─ Lançar erro específico
   └─ Usuário vê "Diagnosticar Webhook"

6. SESSION COOKIES
   ├─ Assinados com JWT_SECRET
   ├─ HttpOnly (não acessível via JS)
   ├─ Secure (apenas HTTPS em produção)
   └─ SameSite=None (CORS)
```

---

## 📁 Estrutura de Arquivos Principais

| Arquivo | Linhas | Responsabilidade |
|---------|--------|---|
| `client/src/pages/SolicitacaoForm.tsx` | 850+ | Formulário principal, upload, envio |
| `client/src/pages/Historico.tsx` | 300+ | Listagem, filtros, paginação |
| `client/src/pages/SuccessPage.tsx` | 50+ | Página de sucesso com Request_ID |
| `server/routers/solicitacoes.ts` | 200+ | Endpoint submit com validação |
| `server/routers/upload.ts` | 100+ | Endpoint upload de fotos |
| `server/routers/historico.ts` | 150+ | Endpoint listagem com filtros |
| `server/services/webhookService.ts` | 150+ | Integração Google Apps Script |
| `server/services/uploadService.ts` | 100+ | Upload para S3 |
| `server/db.ts` | 200+ | Query helpers do banco |
| `drizzle/schema.ts` | 100+ | Definição de tabelas |
| `shared/types.ts` | 50+ | Tipos TypeScript compartilhados |
| `shared/utils.ts` | 100+ | Funções utilitárias |

---

## 🔌 Integrações Externas

### Google Apps Script
- **Tipo**: Webhook POST
- **URL**: `https://script.google.com/macros/s/{SCRIPT_ID}/exec`
- **Autenticação**: Token em query + header
- **Payload**: JSON com dados da solicitação
- **Resposta**: `{ "ok": true }`
- **Ação**: Insere linha no Google Sheets

### AWS S3
- **Tipo**: Upload de fotos
- **Bucket**: `mopar-solicitacoes`
- **Estrutura**: `{userId}-files/{fileName}-{randomSuffix}.jpg`
- **Permissões**: Público (leitura)
- **Retorno**: URL pública

### Manus OAuth
- **Tipo**: Autenticação (não usado neste app)
- **Endpoint**: `https://api.manus.im`
- **Callback**: `/api/oauth/callback`

### Manus Forge API
- **Tipo**: LLM, Storage, Notifications
- **Endpoint**: `https://forge.manus.im`
- **Autenticação**: Bearer token

---

## 📈 Escalabilidade

### Otimizações Atuais
- Paginação no histórico (10 itens por página)
- Índices no database (request_id, loja_id, created_at)
- Cache de lojas no frontend (localStorage)
- Compressão de fotos antes de upload
- Retry automático para falhas de rede

### Melhorias Futuras
- Cache Redis para histórico frequente
- Fila de processamento (Bull/RabbitMQ)
- CDN para fotos (CloudFront)
- Compressão de imagens automática
- Arquivamento de solicitações antigas

---

## 🧪 Testes

### Cobertura Atual
- **Unit Tests**: 25 testes passando
- **Validação**: Zod schemas
- **Upload**: Testes de arquivo
- **Webhook**: Testes de integração
- **Histórico**: Testes de query

### Smoke Tests Manuais
1. Enviar sem fotos
2. Enviar com foto da câmera
3. Consultar histórico
4. Filtrar por data/loja

---

## 🚀 Performance

| Métrica | Alvo | Atual |
|---------|------|-------|
| Tempo Carregamento | < 2s | ~1.5s |
| Tempo Upload Foto | < 5s | ~3s |
| Tempo Envio | < 3s | ~2s |
| Tempo Listagem | < 1s | ~0.8s |
| Tamanho Bundle | < 500KB | ~450KB |

---

**Última atualização**: 30 de janeiro de 2026  
**Mantido por**: Equipe de Engenharia MOPAR
