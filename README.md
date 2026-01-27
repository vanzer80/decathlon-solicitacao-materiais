# Decathlon - Sistema de Solicitação de Materiais de Manutenção

**Versão:** 1.0.0  
**Status:** Production Ready  
**Última Atualização:** Janeiro 2026  
**Mantido por:** Decathlon Brasil - Departamento de Manutenção

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Projeto](#arquitetura-do-projeto)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Requisitos de Sistema](#requisitos-de-sistema)
5. [Instalação e Setup](#instalação-e-setup)
6. [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
7. [Estrutura de Diretórios](#estrutura-de-diretórios)
8. [Funcionalidades Implementadas](#funcionalidades-implementadas)
9. [Guia de Desenvolvimento](#guia-de-desenvolvimento)
10. [API tRPC](#api-trpc)
11. [Banco de Dados](#banco-de-dados)
12. [Integração com Google Apps Script](#integração-com-google-apps-script)
13. [Upload de Arquivos (S3)](#upload-de-arquivos-s3)
14. [Testes](#testes)
15. [Deployment](#deployment)
16. [Troubleshooting](#troubleshooting)
17. [Roadmap e Melhorias Futuras](#roadmap-e-melhorias-futuras)
18. [Contato e Suporte](#contato-e-suporte)

---

## 🎯 Visão Geral

O **Sistema de Solicitação de Materiais de Manutenção** é uma aplicação web mobile-first desenvolvida para facilitar o processo de solicitação de materiais de manutenção nas lojas Decathlon. O sistema integra-se com Google Sheets via webhook, permitindo que solicitações sejam registradas automaticamente em uma planilha centralizada.

### Objetivos Principais

- **Simplificar o processo de solicitação** de materiais de manutenção em campo
- **Integração automática** com Google Sheets para rastreamento centralizado
- **Captura de fotos** diretamente do dispositivo (câmera ou galeria)
- **Compressão automática** de imagens para otimizar banda
- **Validação em tempo real** com feedback visual imediato
- **Suporte mobile-first** com design responsivo
- **Segurança** com honeypot anti-spam e validação de dados

### Público-Alvo

- Técnicos de manutenção nas lojas Decathlon
- Gerentes de loja (para acompanhamento)
- Time de Compras (para processamento de solicitações)

---

## 🏗️ Arquitetura do Projeto

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React 19)                     │
│  - Mobile-first responsive design                           │
│  - Tailwind CSS 4 + shadcn/ui components                   │
│  - Framer Motion para animações                             │
│  - Captura de câmera e upload de fotos                      │
│  - Validação em tempo real                                  │
└────────────────────┬────────────────────────────────────────┘
                     │ tRPC + React Query
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Express 4)                       │
│  - tRPC 11 para type-safe APIs                             │
│  - Autenticação OAuth (Manus)                               │
│  - Upload de arquivos para S3                               │
│  - Integração com webhook Google Apps Script                │
│  - Logging e tratamento de erros                            │
└────────────────────┬────────────────────────────────────────┘
                     │ REST + tRPC
                     ▼
┌──────────────────────────────────────────────────────────────┐
│                  SERVIÇOS EXTERNOS                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Google Apps Script Webhook                              │ │
│  │ - Recebe dados de solicitações                          │ │
│  │ - Escreve em Google Sheets                              │ │
│  │ - URL: https://script.google.com/macros/s/...           │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Amazon S3                                               │ │
│  │ - Armazenamento de fotos                                │ │
│  │ - URLs públicas para acesso                             │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Manus OAuth                                             │ │
│  │ - Autenticação de usuários                              │ │
│  │ - Gerenciamento de sessões                              │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│              BANCO DE DADOS (MySQL/TiDB)                    │
│  - Tabela: users (autenticação)                             │
│  - Tabela: solicitacoes (histórico)                         │
│  - Tabela: materiais (itens solicitados)                    │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** - Framework UI
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animações
- **tRPC React Query** - Data fetching
- **Lucide React** - Ícones
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### Backend
- **Node.js** - Runtime
- **Express 4** - Web framework
- **tRPC 11** - Type-safe RPC
- **Drizzle ORM** - Database ORM
- **MySQL2** - Database driver
- **Jose** - JWT handling
- **Superjson** - Serialization

### DevOps & Build
- **Vite 7** - Build tool
- **Vitest** - Unit testing
- **TypeScript 5.9** - Type checking
- **ESBuild** - Bundling
- **pnpm** - Package manager

### Infraestrutura
- **Manus Platform** - Hosting
- **Amazon S3** - File storage
- **Google Apps Script** - Webhook integration
- **MySQL/TiDB** - Database

---

## 📦 Requisitos de Sistema

### Desenvolvimento Local
- **Node.js:** v22.13.0 ou superior
- **pnpm:** v10.4.1 ou superior
- **Git:** v2.0 ou superior
- **Navegador:** Chrome/Firefox/Safari (últimas 2 versões)

### Produção
- **Node.js:** v22.13.0 LTS ou superior
- **Manus Platform:** Conta ativa com features db, server, user
- **Amazon S3:** Bucket configurado com acesso público
- **Google Apps Script:** Projeto publicado como "Aplicativo Web"
- **MySQL/TiDB:** Banco de dados com acesso remoto

---

## 🚀 Instalação e Setup

### 1. Clonar o Repositório

```bash
git clone https://github.com/vanzer80/decathlon-solicitacao-materiais.git
cd decathlon-solicitacao-materiais
```

### 2. Instalar Dependências

```bash
pnpm install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Database
DATABASE_URL=mysql://user:password@host:3306/decathlon_solicitacoes

# Authentication (Manus OAuth)
JWT_SECRET=seu_jwt_secret_aqui
VITE_APP_ID=seu_app_id_manus
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Owner Information
OWNER_OPEN_ID=seu_open_id
OWNER_NAME=Seu Nome

# Google Apps Script Webhook
WEBHOOK_URL=https://script.google.com/macros/s/AKfycbz5-qhpg3UDrWSP0pDydcnK9olN8dF7fCzI0oFXcRIs-AhnAiy_xQcpB0mhaddxaEBK/exec
WEBHOOK_TOKEN=DECATHLON-2026

# Manus Built-in APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=seu_forge_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=seu_frontend_forge_api_key

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=seu_website_id

# App Configuration
VITE_APP_TITLE=Decathlon - Solicitação de Materiais
VITE_APP_LOGO=/logo.svg
```

### 4. Inicializar Banco de Dados

```bash
# Gerar e aplicar migrations
pnpm db:push

# Verificar se as tabelas foram criadas
pnpm db:studio  # (opcional, abre interface visual)
```

### 5. Iniciar Servidor de Desenvolvimento

```bash
# Terminal 1: Backend + Frontend
pnpm dev

# O servidor estará disponível em http://localhost:3000
```

### 6. Acessar a Aplicação

- **URL:** http://localhost:3000
- **Login:** Use suas credenciais Manus OAuth
- **Teste:** Preencha o formulário e envie uma solicitação

---

## ⚙️ Configuração de Variáveis de Ambiente

### Variáveis Críticas (Obrigatórias)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | String de conexão MySQL | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | Chave para assinar tokens JWT | `abc123xyz789...` |
| `WEBHOOK_URL` | URL do webhook Google Apps Script | `https://script.google.com/macros/s/.../exec` |
| `WEBHOOK_TOKEN` | Token de autenticação do webhook | `DECATHLON-2026` |

### Variáveis de Autenticação (Obrigatórias)

| Variável | Descrição |
|----------|-----------|
| `VITE_APP_ID` | ID da aplicação Manus |
| `OAUTH_SERVER_URL` | URL do servidor OAuth Manus |
| `VITE_OAUTH_PORTAL_URL` | URL do portal de login Manus |
| `OWNER_OPEN_ID` | OpenID do proprietário da aplicação |
| `OWNER_NAME` | Nome do proprietário |

### Variáveis de APIs Externas (Obrigatórias)

| Variável | Descrição |
|----------|-----------|
| `BUILT_IN_FORGE_API_URL` | URL da API Manus Forge |
| `BUILT_IN_FORGE_API_KEY` | Chave de API para Forge (servidor) |
| `VITE_FRONTEND_FORGE_API_KEY` | Chave de API para Forge (frontend) |
| `VITE_FRONTEND_FORGE_API_URL` | URL da API Forge (frontend) |

### Variáveis Opcionais

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `USE_MOCK_WEBHOOK` | Usar webhook mock para testes | `false` |
| `VITE_ANALYTICS_ENDPOINT` | Endpoint de analytics | - |
| `VITE_ANALYTICS_WEBSITE_ID` | ID do website para analytics | - |
| `VITE_APP_TITLE` | Título da aplicação | `Decathlon - Solicitação de Materiais` |
| `VITE_APP_LOGO` | URL do logo | `/logo.svg` |

---

## 📁 Estrutura de Diretórios

```
decathlon-solicitacao-materiais/
├── client/                          # Frontend React
│   ├── public/                      # Arquivos estáticos
│   │   ├── lojas.json              # Lista de lojas (52 lojas)
│   │   └── logo.svg                # Logo da Decathlon
│   ├── src/
│   │   ├── components/             # Componentes React reutilizáveis
│   │   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── CameraCapture.tsx   # Captura de câmera
│   │   │   ├── LoadingAnimation.tsx # Animação de carregamento
│   │   │   └── DashboardLayout.tsx # Layout do dashboard
│   │   ├── pages/                  # Páginas (rotas)
│   │   │   ├── Home.tsx            # Página inicial
│   │   │   ├── SolicitacaoForm.tsx # Formulário principal
│   │   │   └── NotFound.tsx        # Página 404
│   │   ├── contexts/               # React contexts
│   │   │   └── ThemeContext.tsx    # Tema (dark/light)
│   │   ├── hooks/                  # Custom hooks
│   │   │   └── useAuth.ts          # Hook de autenticação
│   │   ├── lib/                    # Utilitários
│   │   │   ├── trpc.ts             # Cliente tRPC
│   │   │   └── imageCompression.ts # Compressão de imagens
│   │   ├── App.tsx                 # Componente raiz
│   │   ├── main.tsx                # Entry point
│   │   └── index.css               # Estilos globais
│   └── index.html                  # Template HTML
├── server/                          # Backend Node.js
│   ├── _core/                      # Framework core (não editar)
│   │   ├── index.ts                # Inicialização do servidor
│   │   ├── context.ts              # Contexto tRPC
│   │   ├── trpc.ts                 # Configuração tRPC
│   │   ├── cookies.ts              # Gerenciamento de cookies
│   │   ├── env.ts                  # Validação de env vars
│   │   ├── llm.ts                  # Integração com LLM
│   │   ├── imageGeneration.ts      # Geração de imagens
│   │   ├── voiceTranscription.ts   # Transcrição de áudio
│   │   ├── notification.ts         # Notificações
│   │   └── map.ts                  # Integração com Google Maps
│   ├── routers.ts                  # Procedures tRPC
│   ├── db.ts                       # Helpers de banco de dados
│   ├── upload.ts                   # Endpoint de upload
│   ├── webhook-diagnostic.ts       # Script de diagnóstico
│   └── *.test.ts                   # Testes unitários
├── drizzle/                         # Migrações de banco de dados
│   ├── schema.ts                   # Definição de tabelas
│   └── migrations/                 # Histórico de migrações
├── shared/                          # Código compartilhado
│   ├── constants.ts                # Constantes globais
│   ├── types.ts                    # Tipos TypeScript
│   ├── utils.ts                    # Funções utilitárias
│   └── const.ts                    # Constantes de cookies
├── storage/                         # Helpers de S3
│   └── index.ts                    # Funções de upload/download
├── .manus-logs/                     # Logs da aplicação
│   ├── devserver.log               # Logs do servidor
│   ├── browserConsole.log          # Console do navegador
│   ├── networkRequests.log         # Requisições HTTP
│   └── sessionReplay.log           # Replay de sessão
├── package.json                     # Dependências e scripts
├── tsconfig.json                    # Configuração TypeScript
├── vite.config.ts                   # Configuração Vite
├── drizzle.config.ts                # Configuração Drizzle
├── vitest.config.ts                 # Configuração Vitest
├── tailwind.config.ts               # Configuração Tailwind
├── postcss.config.ts                # Configuração PostCSS
├── .env.local                       # Variáveis de ambiente (gitignored)
├── .gitignore                       # Arquivos ignorados pelo Git
├── README.md                        # Este arquivo
├── todo.md                          # Rastreamento de features
└── WEBHOOK_DEBUG.md                 # Documentação de debug do webhook
```

---

## ✨ Funcionalidades Implementadas

### ✅ Fase 1: Estrutura e Backend

- [x] Schema de banco de dados (solicitacoes, materiais)
- [x] Helpers de banco de dados
- [x] Procedure tRPC para envio de solicitação
- [x] Integração com webhook Google Apps Script
- [x] Upload de fotos para S3 com URLs públicas

### ✅ Fase 2: Frontend - Formulário

- [x] Dropdown pesquisável de 52 lojas
- [x] Seção "Dados Principais" (loja, solicitante, telefone, chamado)
- [x] Seção "Equipe e Serviço" com abas (Própria/Terceirizada)
- [x] Repetidor de materiais com adicionar/remover cards
- [x] Campos de material (descrição, especificação, quantidade, unidade, urgência, fotos)
- [x] Validação em tempo real com feedback visual

### ✅ Fase 3: Integração e Segurança

- [x] Honeypot anti-spam
- [x] Geração de Request_ID único (YYYYMMDD-HHMMSS-6CHARS)
- [x] Payload JSON conforme especificação
- [x] Envio POST para webhook com token em query param
- [x] Tratamento de erros e logging

### ✅ Fase 4: UX e Testes

- [x] Tela de sucesso com Request_ID
- [x] Botão "Nova Solicitação" para resetar formulário
- [x] Visual corporativo Decathlon (azul #0082C3)
- [x] Otimização mobile-first
- [x] 11 testes unitários passando
- [x] Correção de erro 401 do webhook
- [x] Dropdown de lojas com todas as opções visíveis

### ✅ Fase 5: Melhorias Adicionais

- [x] Captura de câmera (foto ao vivo)
- [x] Compressão automática de imagens
- [x] Animação de carregamento elegante
- [x] Redesign conforme mockup fornecido
- [x] Número do chamado opcional

---

## 👨‍💻 Guia de Desenvolvimento

### Adicionando Novas Funcionalidades

#### 1. Adicionar Nova Tabela no Banco de Dados

```typescript
// drizzle/schema.ts
import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const novaTabela = mysqlTable("nova_tabela", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em").defaultNow().onUpdateNow().notNull(),
});

export type NovaTabela = typeof novaTabela.$inferSelect;
export type InsertNovaTabela = typeof novaTabela.$inferInsert;
```

Depois execute:
```bash
pnpm db:push
```

#### 2. Adicionar Helper de Banco de Dados

```typescript
// server/db.ts
export async function obterNovaTabela(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(novaTabela)
    .where(eq(novaTabela.id, id))
    .limit(1);
  
  return result[0];
}
```

#### 3. Adicionar Procedure tRPC

```typescript
// server/routers.ts
export const appRouter = router({
  // ... routers existentes
  
  novaFeature: router({
    obter: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const item = await db.obterNovaTabela(input.id);
        if (!item) throw new TRPCError({ code: 'NOT_FOUND' });
        return item;
      }),
    
    criar: protectedProcedure
      .input(z.object({ nome: z.string(), descricao: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        // Implementar lógica de criação
        return { sucesso: true };
      }),
  }),
});
```

#### 4. Usar no Frontend

```typescript
// client/src/pages/NovaFeature.tsx
import { trpc } from '@/lib/trpc';

export default function NovaFeature() {
  const { data, isLoading } = trpc.novaFeature.obter.useQuery({ id: 1 });
  const criarMutation = trpc.novaFeature.criar.useMutation();
  
  return (
    <div>
      {isLoading ? 'Carregando...' : data?.nome}
      <button onClick={() => criarMutation.mutate({ nome: 'Novo Item' })}>
        Criar
      </button>
    </div>
  );
}
```

---

## 📡 API tRPC

### Procedures Disponíveis

#### `auth.me` (Query)
Retorna informações do usuário autenticado.

```typescript
const { data: user } = trpc.auth.me.useQuery();
// user: { id, openId, name, email, role, ... }
```

#### `auth.logout` (Mutation)
Faz logout do usuário.

```typescript
const logout = trpc.auth.logout.useMutation();
logout.mutate();
```

#### `solicitacao.submit` (Mutation)
Envia uma solicitação de materiais.

```typescript
const submit = trpc.solicitacao.submit.useMutation();
submit.mutate({
  requestId: "20260127-143000-ABC123",
  timestampEnvio: new Date().toISOString(),
  lojaId: "001",
  lojaLabel: "Loja Centro",
  solicitanteNome: "João Silva",
  solicitanteTelefone: "(11) 99999-9999",
  numeroChamado: "CHM-2026-001",
  tipoEquipe: "Própria",
  empresaTerceira: "",
  tipoServico: "Preventiva",
  sistemaAfetado: "Ar Condicionado",
  descricaoGeralServico: "Limpeza de filtros",
  materiais: [
    {
      descricao: "Filtro de ar",
      especificacao: "Modelo X100",
      quantidade: 2,
      unidade: "un",
      urgencia: "Média",
      foto1Url: "https://s3.amazonaws.com/...",
      foto2Url: "",
    }
  ]
});
```

---

## 🗄️ Banco de Dados

### Schema

#### Tabela: `users`
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

#### Tabela: `solicitacoes`
```sql
CREATE TABLE solicitacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  requestId VARCHAR(64) UNIQUE NOT NULL,
  timestampEnvio TIMESTAMP NOT NULL,
  lojaId VARCHAR(10) NOT NULL,
  lojaLabel VARCHAR(255) NOT NULL,
  solicitanteNome VARCHAR(255) NOT NULL,
  solicitanteTelefone VARCHAR(20) NOT NULL,
  numeroChamado VARCHAR(50),
  tipoEquipe VARCHAR(50) NOT NULL,
  empresaTerceira VARCHAR(255),
  tipoServico VARCHAR(100) NOT NULL,
  sistemaAfetado VARCHAR(100) NOT NULL,
  descricaoGeralServico TEXT NOT NULL,
  statusWebhook VARCHAR(50) DEFAULT 'pendente',
  respostaWebhook JSON,
  criadoEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  atualizadoEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);
```

#### Tabela: `materiais`
```sql
CREATE TABLE materiais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  solicitacaoId INT NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  especificacao VARCHAR(255),
  quantidade INT NOT NULL,
  unidade VARCHAR(20) NOT NULL,
  urgencia VARCHAR(20) NOT NULL,
  foto1Url TEXT,
  foto2Url TEXT,
  criadoEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (solicitacaoId) REFERENCES solicitacoes(id) ON DELETE CASCADE
);
```

### Queries Úteis

```sql
-- Listar todas as solicitações
SELECT * FROM solicitacoes ORDER BY criadoEm DESC;

-- Listar solicitações por loja
SELECT * FROM solicitacoes WHERE lojaId = '001' ORDER BY criadoEm DESC;

-- Listar materiais de uma solicitação
SELECT * FROM materiais WHERE solicitacaoId = 1;

-- Contar solicitações por dia
SELECT DATE(criadoEm) as data, COUNT(*) as total 
FROM solicitacoes 
GROUP BY DATE(criadoEm) 
ORDER BY data DESC;

-- Listar solicitações com status de webhook
SELECT requestId, statusWebhook, respostaWebhook 
FROM solicitacoes 
WHERE statusWebhook != 'sucesso' 
ORDER BY criadoEm DESC;
```

---

## 🔗 Integração com Google Apps Script

### Configuração do Webhook

1. **Acesse Google Apps Script:** https://script.google.com
2. **Crie um novo projeto** ou abra o projeto existente
3. **Publique como "Aplicativo Web":**
   - Clique em "Implantar" → "Nova implantação"
   - Tipo: "Aplicativo Web"
   - Executar como: Sua conta
   - Quem tem acesso: "Qualquer pessoa"
   - Copie a URL de implantação

### Código de Exemplo do Apps Script

```javascript
// Função que recebe os dados da solicitação
function doPost(e) {
  try {
    // Validar token
    const token = e.parameter.token;
    const expectedToken = PropertiesService.getScriptProperties().getProperty('WEBHOOK_TOKEN');
    
    if (token !== expectedToken) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Parsear dados
    const data = JSON.parse(e.postData.contents);
    
    // Obter planilha
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Solicitações') || spreadsheet.addSheet('Solicitações');
    
    // Adicionar cabeçalho se vazio
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Request ID', 'Data/Hora', 'Loja', 'Solicitante', 'Telefone', 
        'Chamado', 'Tipo Equipe', 'Empresa Terceira', 'Tipo Serviço', 
        'Sistema Afetado', 'Descrição', 'Material', 'Especificação', 
        'Quantidade', 'Unidade', 'Urgência', 'Foto 1', 'Foto 2'
      ]);
    }
    
    // Adicionar linha para cada material
    data.materiais.forEach(material => {
      sheet.appendRow([
        data.requestId,
        data.timestampEnvio,
        data.lojaLabel,
        data.solicitanteNome,
        data.solicitanteTelefone,
        data.numeroChamado,
        data.tipoEquipe,
        data.empresaTerceira,
        data.tipoServico,
        data.sistemaAfetado,
        data.descricaoGeralServico,
        material.descricao,
        material.especificacao,
        material.quantidade,
        material.unidade,
        material.urgencia,
        material.foto1Url,
        material.foto2Url
      ]);
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      request_id: data.requestId,
      rows_written: data.materiais.length
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Erro: ' + error);
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Payload Enviado

```json
{
  "requestId": "20260127-143000-ABC123",
  "timestampEnvio": "2026-01-27T14:30:00.000Z",
  "lojaId": "001",
  "lojaLabel": "Loja Centro",
  "solicitanteNome": "João Silva",
  "solicitanteTelefone": "(11) 99999-9999",
  "numeroChamado": "CHM-2026-001",
  "tipoEquipe": "Própria",
  "empresaTerceira": "",
  "tipoServico": "Preventiva",
  "sistemaAfetado": "Ar Condicionado",
  "descricaoGeralServico": "Limpeza de filtros e manutenção preventiva",
  "materiais": [
    {
      "descricao": "Filtro de ar",
      "especificacao": "Modelo X100",
      "quantidade": 2,
      "unidade": "un",
      "urgencia": "Média",
      "foto1Url": "https://s3.amazonaws.com/bucket/foto1.jpg",
      "foto2Url": "https://s3.amazonaws.com/bucket/foto2.jpg"
    },
    {
      "descricao": "Óleo lubrificante",
      "especificacao": "SAE 30",
      "quantidade": 1,
      "unidade": "L",
      "urgencia": "Baixa",
      "foto1Url": "",
      "foto2Url": ""
    }
  ]
}
```

### Troubleshooting do Webhook

Se o webhook retornar erro 401 ou 404:

1. **Verifique a URL:** Copie exatamente a URL de implantação do Apps Script
2. **Verifique o token:** Confirme que `WEBHOOK_TOKEN` está correto nas propriedades do script
3. **Teste manualmente:** Acesse a URL no navegador para confirmar que está publicada
4. **Execute script de diagnóstico:**
   ```bash
   npx ts-node server/webhook-diagnostic.ts
   ```

---

## 📤 Upload de Arquivos (S3)

### Configuração

O upload de arquivos é gerenciado automaticamente pelo Manus Platform. As credenciais de S3 são injetadas via variáveis de ambiente.

### Fluxo de Upload

1. **Frontend:** Usuário seleciona/captura foto
2. **Compressão:** Imagem é comprimida automaticamente
3. **Upload:** Enviada para `/api/upload` (endpoint Express)
4. **S3:** Arquivo é salvo no bucket S3
5. **URL Pública:** URL do arquivo é retornada
6. **Webhook:** URL é enviada para Google Apps Script

### Função de Compressão

```typescript
// client/src/lib/imageCompression.ts
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<{ blob: Blob; originalSize: number; compressedSize: number }> {
  // Implementação com Canvas API
  // Redimensiona e comprime a imagem
  // Retorna blob comprimido
}
```

### Limites

- **Tamanho máximo:** 5MB (validado no frontend e backend)
- **Formatos aceitos:** JPEG, PNG, WebP
- **Compressão:** Automática para ~80% da qualidade original
- **Retenção:** Indefinida no S3 (configurável)

---

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
pnpm test

# Modo watch (reexecuta ao salvar arquivo)
pnpm test:watch

# Cobertura de testes
pnpm test:coverage
```

### Estrutura de Testes

```typescript
// server/utils.test.ts
import { describe, it, expect } from 'vitest';
import { generateRequestId, validateImageFile } from '@shared/utils';

describe('generateRequestId', () => {
  it('deve gerar ID no formato YYYYMMDD-HHMMSS-6CHARS', () => {
    const id = generateRequestId();
    expect(id).toMatch(/^\d{8}-\d{6}-[A-Z0-9]{6}$/);
  });
});

describe('validateImageFile', () => {
  it('deve aceitar arquivo JPEG válido', () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    expect(validateImageFile(file)).toBe(true);
  });
  
  it('deve rejeitar arquivo maior que 5MB', () => {
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    expect(validateImageFile(largeFile)).toBe(false);
  });
});
```

### Testes Atuais

- ✅ 10 testes de utilitários (generateRequestId, validação de imagens, telefone)
- ✅ 1 teste de autenticação (logout)
- **Total:** 11 testes passando

### Adicionar Novos Testes

Crie um arquivo `.test.ts` ao lado do código que deseja testar:

```typescript
// server/novaFeature.test.ts
import { describe, it, expect } from 'vitest';
import { minhaFuncao } from './novaFeature';

describe('minhaFuncao', () => {
  it('deve fazer algo', () => {
    const resultado = minhaFuncao();
    expect(resultado).toBe(esperado);
  });
});
```

---

## 🚀 Deployment

### Deployment no Manus Platform

1. **Criar Checkpoint:**
   ```bash
   # Feito automaticamente via Management UI
   ```

2. **Publicar:**
   - Acesse Management UI
   - Clique em "Publish" (botão azul no topo)
   - Selecione o checkpoint desejado
   - Confirme a publicação

3. **Configurar Domínio:**
   - Vá para "Settings" → "Domains"
   - Configure domínio customizado ou use domínio Manus (xxx.manus.space)

4. **Verificar Deployment:**
   - Acesse a URL publicada
   - Teste o formulário
   - Verifique se dados chegam no Google Sheets

### Deployment em Outro Servidor

Se desejar fazer deploy em outro servidor (Railway, Render, Vercel):

```bash
# Build para produção
pnpm build

# Iniciar servidor
pnpm start

# Variáveis de ambiente necessárias
export NODE_ENV=production
export DATABASE_URL=...
export JWT_SECRET=...
# ... (todas as variáveis listadas acima)
```

**Nota:** O Manus Platform oferece hosting gerenciado com suporte integrado. Recomenda-se usar a plataforma nativa para melhor compatibilidade.

---

## 🔧 Troubleshooting

### Problema: Erro 401 no Webhook

**Causa:** Token de autenticação incorreto ou URL inválida

**Solução:**
1. Verifique se `WEBHOOK_TOKEN` está correto (deve ser `DECATHLON-2026`)
2. Verifique se a URL do webhook está correta
3. Confirme que o Apps Script está publicado como "Aplicativo Web"
4. Execute o script de diagnóstico: `npx ts-node server/webhook-diagnostic.ts`

### Problema: Fotos não aparecem no Google Sheets

**Causa:** URLs de S3 não estão sendo geradas corretamente

**Solução:**
1. Verifique se as credenciais de S3 estão configuradas
2. Confirme que o bucket S3 está com acesso público
3. Verifique nos logs se o upload foi bem-sucedido
4. Teste upload manualmente: `curl -X POST http://localhost:3000/api/upload -F "file=@test.jpg"`

### Problema: Banco de dados não conecta

**Causa:** String de conexão incorreta ou servidor de banco de dados indisponível

**Solução:**
1. Verifique `DATABASE_URL`: `mysql://user:password@host:3306/database`
2. Teste conexão: `mysql -u user -p -h host database`
3. Verifique se o firewall permite conexão
4. Confirme que o banco de dados existe

### Problema: Animação de carregamento não aparece

**Causa:** Framer Motion não está instalado ou componente não está renderizando

**Solução:**
1. Verifique se `framer-motion` está instalado: `pnpm list framer-motion`
2. Reinstale se necessário: `pnpm install framer-motion`
3. Verifique se `LoadingAnimation` está sendo importado corretamente
4. Abra console do navegador (F12) e procure por erros

### Problema: Câmera não funciona no mobile

**Causa:** Permissão de câmera não foi concedida ou navegador não suporta

**Solução:**
1. Verifique se o site está em HTTPS (obrigatório para câmera)
2. Permita acesso à câmera quando solicitado
3. Teste em navegador compatível (Chrome, Firefox, Safari)
4. Verifique se o dispositivo tem câmera disponível

---

## 🗺️ Roadmap e Melhorias Futuras

### Curto Prazo (1-2 meses)

- [ ] **Histórico de Solicitações:** Dashboard protegido mostrando todas as solicitações enviadas
- [ ] **Notificações por Email:** Alertas automáticos para o time de Compras
- [ ] **Rotação Automática de Imagens:** Detectar e corrigir orientação EXIF
- [ ] **Galeria de Preview:** Visualizar todas as fotos antes de enviar
- [ ] **Modo Offline:** Sincronizar automaticamente quando conexão for restaurada

### Médio Prazo (3-6 meses)

- [ ] **Dashboard de Acompanhamento:** Status de compra para cada solicitação
- [ ] **Integração com Sistema de Compras:** Sincronizar com ERP interno
- [ ] **Relatórios e Analytics:** Gráficos de solicitações por loja, período, tipo
- [ ] **Aprovação de Solicitações:** Workflow de aprovação antes de enviar
- [ ] **Assinatura Digital:** Confirmação de identidade com biometria/PIN
- [ ] **Suporte a Múltiplos Idiomas:** Português, Inglês, Espanhol

### Longo Prazo (6-12 meses)

- [ ] **App Mobile Nativa:** Aplicativo iOS/Android com sincronização offline
- [ ] **Integração com IoT:** Sensores para monitoramento automático
- [ ] **IA para Previsão:** Prever necessidades de materiais baseado em histórico
- [ ] **Marketplace de Fornecedores:** Integração com fornecedores para cotações
- [ ] **API Pública:** Permitir integrações de terceiros
- [ ] **Blockchain para Rastreabilidade:** Rastreamento imutável de solicitações

### Melhorias Técnicas

- [ ] **Testes E2E:** Adicionar testes com Playwright/Cypress
- [ ] **Performance:** Otimizar bundle size e lazy loading
- [ ] **Segurança:** Implementar rate limiting, CSRF protection
- [ ] **Observabilidade:** Adicionar tracing distribuído e APM
- [ ] **CI/CD:** Automatizar testes e deployment
- [ ] **Documentação:** Adicionar API docs com Swagger/OpenAPI

---

## 📞 Contato e Suporte

### Equipe de Desenvolvimento

- **Product Manager:** [Seu Nome]
- **Tech Lead:** [Tech Lead Name]
- **Backend Developer:** [Backend Dev Name]
- **Frontend Developer:** [Frontend Dev Name]

### Canais de Comunicação

- **Issues:** GitHub Issues (para bugs e features)
- **Discussões:** GitHub Discussions (para dúvidas)
- **Slack:** #decathlon-solicitacoes (para comunicação rápida)
- **Email:** dev-team@decathlon.com.br

### Recursos Úteis

- **Documentação Manus:** https://docs.manus.im
- **tRPC Docs:** https://trpc.io/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Drizzle ORM:** https://orm.drizzle.team

### Reportar Bugs

1. Abra uma issue no GitHub
2. Descreva o problema com clareza
3. Inclua passos para reproduzir
4. Anexe screenshots/logs se relevante
5. Especifique versão do navegador e SO

### Solicitar Features

1. Abra uma discussion no GitHub
2. Descreva a feature desejada
3. Explique o caso de uso
4. Discuta com a equipe antes de implementar

---

## 📄 Licença

Este projeto é propriedade da Decathlon Brasil. Todos os direitos reservados.

---

## 📝 Histórico de Versões

### v1.0.0 (Janeiro 2026)
- ✅ Versão inicial com todas as funcionalidades core
- ✅ Integração com Google Apps Script
- ✅ Captura de câmera e compressão de imagens
- ✅ Animação de carregamento
- ✅ 11 testes unitários
- ✅ Documentação completa

---

**Última atualização:** 27 de Janeiro de 2026  
**Mantido por:** Equipe de Desenvolvimento Decathlon  
**Status:** ✅ Production Ready
