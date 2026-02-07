# 📚 Documentação Completa para Desenvolvedores - Decathlon Solicitação de Materiais

**Versão:** 1.0.0  
**Última Atualização:** Janeiro 2026  
**Status:** ✅ Produção  

---

## 📖 Índice

1. [Visão Geral do Projeto](#-visão-geral-do-projeto)
2. [Stack Tecnológico](#-stack-tecnológico)
3. [Arquitetura da Aplicação](#-arquitetura-da-aplicação)
4. [Setup Inicial](#-setup-inicial)
5. [Estrutura de Diretórios](#-estrutura-de-diretórios)
6. [Funcionalidades Implementadas](#-funcionalidades-implementadas)
7. [Guia de Desenvolvimento](#-guia-de-desenvolvimento)
8. [API tRPC - Procedures](#-api-trpc---procedures)
9. [Banco de Dados](#-banco-de-dados)
10. [Integração com Webhook](#-integração-com-webhook)
11. [Upload de Arquivos (S3)](#-upload-de-arquivos-s3)
12. [Testes Unitários](#-testes-unitários)
13. [Deployment](#-deployment)
14. [Troubleshooting](#-troubleshooting)
15. [Roadmap & Features Futuras](#-roadmap--features-futuras)

---

## 🎯 Visão Geral do Projeto

### O que é?

Sistema web mobile-first para **solicitação de materiais de manutenção** na Decathlon. Permite que gerentes de loja solicitem materiais de forma rápida e estruturada, com integração automática ao Google Sheets via webhook.

### Objetivos Principais

- ✅ Formulário intuitivo e mobile-first
- ✅ Captura de fotos (câmera + galeria)
- ✅ Compressão automática de imagens
- ✅ Integração com Google Apps Script
- ✅ Validação em tempo real
- ✅ Geração de Request ID único
- ✅ Upload de fotos para S3
- ✅ Tela de sucesso com rastreamento

### Usuários Alvo

- Gerentes de loja Decathlon
- Time de manutenção
- Time de compras (acompanhamento)

### Métricas de Sucesso

- Tempo de preenchimento: < 3 minutos
- Taxa de sucesso de envio: > 99%
- Tempo de resposta do webhook: < 5 segundos
- Satisfação do usuário: > 4.5/5

---

## 🛠️ Stack Tecnológico

### Frontend

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| React | 19.2.1 | UI Framework |
| TypeScript | 5.9.3 | Type Safety |
| Tailwind CSS | 4.1.14 | Styling |
| Vite | 7.1.7 | Build Tool |
| shadcn/ui | Latest | Component Library |
| Framer Motion | 12.23.22 | Animations |
| React Hook Form | 7.64.0 | Form Management |
| Zod | 4.1.12 | Schema Validation |
| Wouter | 3.3.5 | Routing |
| Recharts | 2.15.2 | Charts (futuro) |

### Backend

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| Express | 4.21.2 | Web Server |
| Node.js | 22.13.0 | Runtime |
| tRPC | 11.6.0 | RPC Framework |
| Drizzle ORM | 0.44.5 | Database ORM |
| MySQL2 | 3.15.0 | Database Driver |
| Zod | 4.1.12 | Validation |

### Infraestrutura

| Tecnologia | Propósito |
|-----------|----------|
| Manus Platform | Hosting |
| MySQL/TiDB | Database |
| AWS S3 | File Storage |
| Google Apps Script | Webhook Integration |
| GitHub | Version Control |

### DevTools

| Tecnologia | Propósito |
|-----------|----------|
| Vitest | Unit Testing |
| TypeScript | Type Checking |
| Prettier | Code Formatting |
| ESLint | Linting (via TS) |
| pnpm | Package Manager |

---

## 🏗️ Arquitetura da Aplicação

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SolicitacaoForm.tsx                                 │   │
│  │  - Formulário principal com validação em tempo real  │   │
│  │  - Captura de câmera + upload de galeria             │   │
│  │  - Compressão automática de imagens                  │   │
│  │  - Animação de carregamento                          │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  CameraCapture.tsx                                   │   │
│  │  - Componente de captura de câmera                   │   │
│  │  - Preview em tempo real                            │   │
│  │  - Confirmação/descarte de foto                     │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  LoadingAnimation.tsx                                │   │
│  │  - Spinner animado com Framer Motion                │   │
│  │  - Estados: loading, success, error                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ tRPC
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express + tRPC)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  server/routers.ts                                   │   │
│  │  - Procedure: submitSolicitacao()                    │   │
│  │  - Validação de dados                               │   │
│  │  - Integração com webhook                           │   │
│  │  - Geração de Request ID                            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  server/upload.ts                                    │   │
│  │  - Endpoint POST /api/upload                         │   │
│  │  - Upload de fotos para S3                           │   │
│  │  - Retorna URLs públicas                            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  server/db.ts                                        │   │
│  │  - Query helpers para banco de dados                 │   │
│  │  - Funções de CRUD                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         ↓ HTTP POST                    ↓ MySQL Query
┌──────────────────────┐        ┌──────────────────────┐
│  Google Apps Script  │        │  MySQL Database      │
│  - Webhook receiver  │        │  - solicitacoes      │
│  - Valida token      │        │  - materiais         │
│  - Escreve no Sheets │        │  - usuarios          │
└──────────────────────┘        └──────────────────────┘
         ↓                              ↓
┌──────────────────────┐        ┌──────────────────────┐
│  Google Sheets       │        │  S3 Storage          │
│  - Histórico de      │        │  - Fotos comprimidas │
│    solicitações      │        │  - URLs públicas     │
└──────────────────────┘        └──────────────────────┘
```

### Fluxo de Dados

```
1. Usuário preenche formulário
   ↓
2. Valida em tempo real (Zod)
   ↓
3. Captura/seleciona fotos
   ↓
4. Comprime imagens (Canvas API)
   ↓
5. Upload para S3 (POST /api/upload)
   ↓
6. Recebe URLs públicas
   ↓
7. Submete formulário (tRPC submitSolicitacao)
   ↓
8. Backend valida dados novamente
   ↓
9. Gera Request ID único
   ↓
10. POST para webhook Google Apps Script
    ↓
11. Apps Script valida token
    ↓
12. Escreve dados no Google Sheets
    ↓
13. Retorna sucesso
    ↓
14. Frontend exibe tela de sucesso com Request ID
```

---

## 🚀 Setup Inicial

### Pré-requisitos

- **Node.js 22+** - https://nodejs.org
- **pnpm 10+** - `npm install -g pnpm`
- **Git** - https://git-scm.com
- **Conta Manus** - Para hosting e banco de dados
- **Conta AWS** - Para S3 (opcional, Manus fornece)
- **Conta Google** - Para Apps Script webhook

### 1. Clonar Repositório

```bash
git clone https://github.com/SEU_USUARIO/decathlon-solicitacao-materiais.git
cd decathlon-solicitacao-materiais
```

### 2. Instalar Dependências

```bash
pnpm install

# Verifique a instalação
pnpm --version  # deve ser 10+
node --version  # deve ser 22+
```

### 3. Configurar Variáveis de Ambiente

Crie arquivo `.env.local` na raiz do projeto:

```bash
# Database
DATABASE_URL=mysql://user:password@localhost:3306/decathlon

# JWT & Auth
JWT_SECRET=sua_chave_secreta_aqui_min_32_chars
VITE_APP_ID=seu_app_id_manus

# OAuth
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im

# Webhook
WEBHOOK_URL=https://script.google.com/macros/s/AKfycbz5-qhpg3UDrWSP0pDydcnK9olN8dF7fCzI0oFXcRIs-AhnAiy_xQcpB0mhaddxaEBK/exec
WEBHOOK_TOKEN=DECATHLON-2026

# S3 Storage (Manus fornece)
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=sua_chave_api_manus
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua_chave_frontend_manus

# Owner Info
OWNER_OPEN_ID=seu_open_id
OWNER_NAME=Seu Nome

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=seu_website_id
```

### 4. Inicializar Banco de Dados

```bash
# Gerar migrations
pnpm db:push

# Verificar se funcionou
pnpm check
```

### 5. Iniciar Servidor de Desenvolvimento

```bash
# Terminal 1: Backend + Frontend
pnpm dev

# Terminal 2: Testes em watch mode (opcional)
pnpm test:watch

# Acesse em: http://localhost:3000
```

### 6. Verificar Setup

```bash
# Verifique tipos TypeScript
pnpm check

# Execute testes
pnpm test

# Build para produção
pnpm build
```

---

## 📁 Estrutura de Diretórios

```
decathlon-solicitacao-materiais/
├── client/                          # Frontend React
│   ├── public/                      # Arquivos estáticos
│   │   ├── lojas.json              # Lista de lojas (52 lojas)
│   │   └── robots.txt
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx            # Página inicial (redireciona para formulário)
│   │   │   ├── SolicitacaoForm.tsx # MAIN: Formulário principal (1000+ linhas)
│   │   │   └── NotFound.tsx        # Página 404
│   │   ├── components/
│   │   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── CameraCapture.tsx   # Componente de captura de câmera
│   │   │   ├── LoadingAnimation.tsx # Componente de animação de carregamento
│   │   │   ├── DashboardLayout.tsx # Layout para dashboard (futuro)
│   │   │   └── ErrorBoundary.tsx   # Error boundary
│   │   ├── hooks/
│   │   │   └── useAuth.ts          # Hook de autenticação
│   │   ├── lib/
│   │   │   ├── trpc.ts             # Cliente tRPC
│   │   │   └── imageCompression.ts # Utilitário de compressão de imagens
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx    # Context de tema
│   │   ├── App.tsx                 # Router principal
│   │   ├── main.tsx                # Entry point
│   │   └── index.css               # Estilos globais + Tailwind
│   ├── index.html
│   └── tsconfig.json
│
├── server/                          # Backend Express + tRPC
│   ├── _core/                      # Framework-level (não editar)
│   │   ├── index.ts                # Inicialização do servidor
│   │   ├── context.ts              # Contexto tRPC
│   │   ├── trpc.ts                 # Setup tRPC
│   │   ├── env.ts                  # Variáveis de ambiente
│   │   ├── cookies.ts              # Gerenciamento de cookies
│   │   ├── llm.ts                  # Integração com LLM
│   │   ├── imageGeneration.ts      # Geração de imagens
│   │   ├── voiceTranscription.ts   # Transcrição de áudio
│   │   ├── notification.ts         # Notificações
│   │   ├── map.ts                  # Integração com Google Maps
│   │   └── systemRouter.ts         # Router de sistema
│   ├── db.ts                       # Query helpers (EDITAR AQUI)
│   ├── routers.ts                  # tRPC procedures (EDITAR AQUI)
│   ├── upload.ts                   # Endpoint de upload (EDITAR AQUI)
│   ├── webhook-diagnostic.ts       # Script de diagnóstico do webhook
│   └── auth.logout.test.ts         # Teste de exemplo
│
├── drizzle/                         # Banco de dados
│   ├── schema.ts                   # Definição de tabelas (EDITAR AQUI)
│   └── migrations/                 # Migrations automáticas
│
├── shared/                          # Código compartilhado
│   ├── const.ts                    # Constantes
│   ├── types.ts                    # Tipos compartilhados
│   ├── utils.ts                    # Utilitários (Request ID, etc)
│   └── constants.ts                # Constantes de negócio
│
├── storage/                         # S3 helpers
│   └── index.ts                    # Funções de upload/download
│
├── .github/                         # GitHub Actions (CI/CD)
│   └── workflows/
│       └── test.yml                # Workflow de testes
│
├── .manus-logs/                     # Logs da aplicação
│   ├── devserver.log
│   ├── browserConsole.log
│   ├── networkRequests.log
│   └── sessionReplay.log
│
├── package.json                     # Dependências e scripts
├── tsconfig.json                    # Configuração TypeScript
├── vite.config.ts                   # Configuração Vite
├── tailwind.config.ts               # Configuração Tailwind
├── postcss.config.mjs               # Configuração PostCSS
├── vitest.config.ts                 # Configuração Vitest
├── drizzle.config.ts                # Configuração Drizzle
├── prettier.config.mjs              # Configuração Prettier
│
├── README.md                        # README principal
├── README_DEVELOPER.md              # ESTE ARQUIVO
├── CONTRIBUTING.md                  # Guia de contribuição
├── GITHUB_SETUP.md                  # Guia de setup GitHub
├── WEBHOOK_DEBUG.md                 # Documentação de debug webhook
├── todo.md                          # Rastreamento de features
│
└── .gitignore                       # Git ignore rules
```

### Arquivos Principais para Editar

| Arquivo | Propósito | Quando Editar |
|---------|----------|---------------|
| `drizzle/schema.ts` | Definição de tabelas | Adicionar novas tabelas/campos |
| `server/db.ts` | Query helpers | Adicionar novas queries |
| `server/routers.ts` | tRPC procedures | Adicionar novas APIs |
| `client/src/pages/SolicitacaoForm.tsx` | Formulário principal | Alterar UI/lógica do formulário |
| `shared/types.ts` | Tipos compartilhados | Adicionar novos tipos |
| `shared/utils.ts` | Utilitários | Adicionar novas funções |

---

## ✨ Funcionalidades Implementadas

### ✅ Fase 1: Estrutura e Backend

- [x] Schema de banco de dados (solicitacoes, materiais, usuarios)
- [x] Query helpers para CRUD
- [x] Procedure tRPC para enviar solicitação
- [x] Integração com webhook Google Apps Script
- [x] Upload de fotos para S3 com URLs públicas
- [x] Geração de Request ID único (YYYYMMDD-HHMMSS-6CHARS)
- [x] Validação de dados com Zod

### ✅ Fase 2: Frontend - Formulário

- [x] Dropdown pesquisável de 52 lojas
- [x] Seção "Dados Principais" (loja, solicitante, telefone, chamado opcional)
- [x] Seção "Equipe e Serviço" com abas (Própria/Terceirizada)
- [x] Repetidor de materiais com adicionar/remover
- [x] Campos de material (descrição, especificação, quantidade, unidade, urgência)
- [x] Validação em tempo real com feedback visual
- [x] Honeypot anti-spam

### ✅ Fase 3: Integração e Segurança

- [x] Envio POST para webhook com token em query param
- [x] Tratamento de respostas HTML/JSON
- [x] Logging de erros do webhook
- [x] Modo mock para testes sem webhook real
- [x] Suporte para URLs customizadas via env var

### ✅ Fase 4: UX e Testes

- [x] Tela de sucesso com Request_ID
- [x] Botão "Nova Solicitação" para resetar formulário
- [x] Visual corporativo Decathlon (azul #0082C3)
- [x] Mobile-first responsivo
- [x] 11 testes unitários passando

### ✅ Fase 5: Recursos Avançados

- [x] Captura de câmera com preview em tempo real
- [x] Upload de galeria
- [x] Compressão automática de imagens (até 80% redução)
- [x] Animação de carregamento elegante
- [x] Feedback visual de compressão
- [x] Suporte para 2 fotos por material

---

## 💻 Guia de Desenvolvimento

### Adicionar Nova Feature

#### 1. Criar Tabela no Banco de Dados

```typescript
// drizzle/schema.ts
export const minhaTabela = mysqlTable('minha_tabela', {
  id: int('id').autoincrement().primaryKey(),
  nome: varchar('nome', { length: 255 }).notNull(),
  descricao: text('descricao'),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().onUpdateNow().notNull(),
});

export type MinhaTabela = typeof minhaTabela.$inferSelect;
export type InsertMinhaTabela = typeof minhaTabela.$inferInsert;
```

#### 2. Executar Migração

```bash
pnpm db:push
```

#### 3. Adicionar Query Helper

```typescript
// server/db.ts
export async function getMinhaTabela(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(minhaTabela)
    .where(eq(minhaTabela.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}
```

#### 4. Adicionar tRPC Procedure

```typescript
// server/routers.ts
export const appRouter = router({
  // ... existing routes
  minha: router({
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getMinhaTabela(input.id)),
    
    create: protectedProcedure
      .input(z.object({ nome: z.string(), descricao: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        // Implementar lógica
      }),
  }),
});
```

#### 5. Usar no Frontend

```typescript
// client/src/pages/MinhaPage.tsx
import { trpc } from '@/lib/trpc';

export default function MinhaPage() {
  const { data, isLoading } = trpc.minha.get.useQuery({ id: 1 });
  const createMutation = trpc.minha.create.useMutation();
  
  const handleCreate = async (nome: string) => {
    await createMutation.mutateAsync({ nome });
  };
  
  if (isLoading) return <div>Carregando...</div>;
  
  return (
    <div>
      {data?.nome}
      <button onClick={() => handleCreate('Novo')}>Criar</button>
    </div>
  );
}
```

#### 6. Escrever Testes

```typescript
// server/minha.test.ts
import { describe, it, expect } from 'vitest';
import { getMinhaTabela } from './db';

describe('getMinhaTabela', () => {
  it('deve retornar dados quando ID existe', async () => {
    const resultado = await getMinhaTabela(1);
    expect(resultado).toBeDefined();
    expect(resultado?.id).toBe(1);
  });
  
  it('deve retornar undefined quando ID não existe', async () => {
    const resultado = await getMinhaTabela(99999);
    expect(resultado).toBeUndefined();
  });
});
```

#### 7. Executar Testes

```bash
pnpm test
```

### Padrões de Código

#### Validação com Zod

```typescript
import { z } from 'zod';

// ✅ Bom: Schema reutilizável
const SolicitacaoSchema = z.object({
  loja_id: z.number().positive(),
  solicitante_nome: z.string().min(3),
  telefone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/),
  materiais: z.array(z.object({
    descricao: z.string().min(1),
    quantidade: z.number().positive(),
    urgencia: z.enum(['Alta', 'Média', 'Baixa']),
  })).min(1),
});

type Solicitacao = z.infer<typeof SolicitacaoSchema>;

// Usar em tRPC
export const submitSolicitacao = protectedProcedure
  .input(SolicitacaoSchema)
  .mutation(async ({ input }) => {
    // input é tipado automaticamente
  });
```

#### Tratamento de Erros

```typescript
import { TRPCError } from '@trpc/server';

// ✅ Bom: Erros tipados
export const meuProcedure = protectedProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input, ctx }) => {
    const dado = await getDado(input.id);
    
    if (!dado) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Dado não encontrado',
      });
    }
    
    if (dado.userId !== ctx.user.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Você não tem permissão',
      });
    }
    
    return dado;
  });
```

#### Componentes React

```typescript
// ✅ Bom: Componente tipado e reutilizável
interface CardProps {
  titulo: string;
  descricao?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

export default function Card({
  titulo,
  descricao,
  onClick,
  isLoading = false,
}: CardProps) {
  return (
    <div className="p-4 border rounded-lg hover:shadow-lg transition">
      <h3 className="font-bold">{titulo}</h3>
      {descricao && <p className="text-gray-600">{descricao}</p>}
      {onClick && (
        <button
          onClick={onClick}
          disabled={isLoading}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Carregando...' : 'Ação'}
        </button>
      )}
    </div>
  );
}
```

---

## 🔌 API tRPC - Procedures

### Procedures Disponíveis

#### `auth.me` (Public)
Retorna dados do usuário autenticado.

```typescript
const { data: usuario } = trpc.auth.me.useQuery();
```

**Retorno:**
```typescript
{
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  role: 'admin' | 'user';
  createdAt: Date;
}
```

#### `auth.logout` (Public)
Faz logout do usuário.

```typescript
const logout = trpc.auth.logout.useMutation();
await logout.mutateAsync();
```

#### `solicitacao.submit` (Protected)
Submete uma nova solicitação de materiais.

```typescript
const submit = trpc.solicitacao.submit.useMutation();

await submit.mutateAsync({
  loja_id: 1,
  solicitante_nome: 'João Silva',
  telefone: '(11) 99999-9999',
  numero_chamado: 'CHM-2026-001', // opcional
  tipo_equipe: 'Própria',
  empresa_terceira: null,
  tipo_servico: 'Manutenção',
  sistema_afetado: 'Iluminação',
  descricao_geral_servico: 'Trocar lâmpadas queimadas',
  materiais: [
    {
      descricao: 'Lâmpada LED 40W',
      especificacao: 'Branca fria',
      quantidade: 10,
      unidade: 'un',
      urgencia: 'Alta',
      foto1_url: 'https://s3.amazonaws.com/...',
      foto2_url: null,
    }
  ],
});
```

**Retorno:**
```typescript
{
  ok: true;
  request_id: string;
  timestamp_envio: string;
  webhook_response: {
    ok: boolean;
    request_id: string;
    rows_written: number;
  };
}
```

#### `solicitacao.getHistorico` (Protected)
Retorna histórico de solicitações do usuário.

```typescript
const { data: historico } = trpc.solicitacao.getHistorico.useQuery({
  loja_id: 1,
  limit: 10,
  offset: 0,
});
```

---

## 🗄️ Banco de Dados

### Schema

#### Tabela: `users`

```typescript
{
  id: int (PK)
  openId: varchar(64) (UNIQUE)
  name: text
  email: varchar(320)
  loginMethod: varchar(64)
  role: enum('user', 'admin')
  createdAt: timestamp
  updatedAt: timestamp
  lastSignedIn: timestamp
}
```

#### Tabela: `solicitacoes`

```typescript
{
  id: int (PK)
  request_id: varchar(50) (UNIQUE)
  loja_id: int
  solicitante_nome: varchar(255)
  telefone: varchar(20)
  numero_chamado: varchar(50) (nullable)
  tipo_equipe: varchar(50)
  empresa_terceira: varchar(255) (nullable)
  tipo_servico: varchar(100)
  sistema_afetado: varchar(100)
  descricao_geral_servico: text
  timestamp_envio: timestamp
  webhook_status: enum('pending', 'success', 'error')
  webhook_response: json (nullable)
  created_by: int (FK -> users.id)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### Tabela: `materiais`

```typescript
{
  id: int (PK)
  solicitacao_id: int (FK -> solicitacoes.id)
  descricao: varchar(255)
  especificacao: text (nullable)
  quantidade: decimal(10,2)
  unidade: varchar(20)
  urgencia: enum('Alta', 'Média', 'Baixa')
  foto1_url: varchar(500) (nullable)
  foto2_url: varchar(500) (nullable)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Queries Úteis

```typescript
// Obter solicitação com materiais
const solicitacao = await db
  .select()
  .from(solicitacoes)
  .leftJoin(materiais, eq(solicitacoes.id, materiais.solicitacao_id))
  .where(eq(solicitacoes.request_id, requestId));

// Contar solicitações por loja
const contagem = await db
  .select({
    loja_id: solicitacoes.loja_id,
    total: count(),
  })
  .from(solicitacoes)
  .groupBy(solicitacoes.loja_id);

// Obter últimas solicitações
const recentes = await db
  .select()
  .from(solicitacoes)
  .orderBy(desc(solicitacoes.createdAt))
  .limit(10);
```

---

## 🔗 Integração com Webhook

### Google Apps Script Setup

1. **Criar novo Apps Script:**
   - Acesse https://script.google.com
   - Clique em "Novo projeto"
   - Nomeie como "Decathlon Webhook"

2. **Código do Apps Script:**

```javascript
function doPost(e) {
  // Validar token
  const token = e.parameter.token;
  const WEBHOOK_TOKEN = PropertiesService.getScriptProperties().getProperty('WEBHOOK_TOKEN');
  
  if (token !== WEBHOOK_TOKEN) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: 'Token inválido'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    const payload = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Escrever header
    const headers = ['Request ID', 'Timestamp', 'Loja', 'Solicitante', 'Telefone', ...];
    sheet.appendRow(headers);
    
    // Escrever dados
    payload.items.forEach(item => {
      sheet.appendRow([
        payload.request_id,
        payload.timestamp_envio,
        item.loja_id,
        item.solicitante_nome,
        item.telefone,
        ...
      ]);
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      request_id: payload.request_id,
      rows_written: payload.items.length
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. **Publicar como Web App:**
   - Clique em "Deploy" → "New deployment"
   - Tipo: "Web app"
   - Execute como: Sua conta
   - Acesso: "Anyone"
   - Copie a URL

4. **Configurar Propriedades do Script:**
   - Clique em "Project settings"
   - Adicione propriedade: `WEBHOOK_TOKEN = DECATHLON-2026`

### Payload do Webhook

```json
{
  "request_id": "20260126-143022-ABC123",
  "timestamp_envio": "2026-01-26T14:30:22.000Z",
  "header": {
    "loja_id": 1,
    "solicitante_nome": "João Silva",
    "telefone": "(11) 99999-9999",
    "numero_chamado": "CHM-2026-001",
    "tipo_equipe": "Própria",
    "empresa_terceira": null,
    "tipo_servico": "Manutenção",
    "sistema_afetado": "Iluminação",
    "descricao_geral_servico": "Trocar lâmpadas queimadas"
  },
  "items": [
    {
      "descricao": "Lâmpada LED 40W",
      "especificacao": "Branca fria",
      "quantidade": 10,
      "unidade": "un",
      "urgencia": "Alta",
      "foto1_url": "https://s3.amazonaws.com/...",
      "foto2_url": null
    }
  ]
}
```

### Testando o Webhook

```bash
# Execute o script de diagnóstico
npx ts-node server/webhook-diagnostic.ts

# Ou use curl
curl -X POST "https://script.google.com/macros/s/AKfycbz5.../exec?token=DECATHLON-2026" \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": "20260126-143022-TEST",
    "timestamp_envio": "2026-01-26T14:30:22Z",
    "header": {...},
    "items": [...]
  }'
```

---

## 📸 Upload de Arquivos (S3)

### Fluxo de Upload

```typescript
// 1. Frontend captura/seleciona foto
const file = await captureFromCamera(); // ou input.files[0]

// 2. Comprime imagem
const comprimida = await compressImage(file);

// 3. Envia para backend
const formData = new FormData();
formData.append('file', comprimida);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

// 4. Backend recebe e faz upload para S3
// POST /api/upload
// Retorna: { url: "https://s3.amazonaws.com/..." }

// 5. Frontend recebe URL pública
const { url } = await response.json();
```

### Função de Upload (Backend)

```typescript
// server/upload.ts
import { storagePut } from '../storage';

export async function uploadFoto(file: Buffer, filename: string) {
  const fileKey = `solicitacoes/${Date.now()}-${filename}`;
  
  const { url } = await storagePut(
    fileKey,
    file,
    'image/jpeg'
  );
  
  return { url };
}
```

### Função de Compressão (Frontend)

```typescript
// client/src/lib/imageCompression.ts
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<CompressionResult> {
  // Implementação com Canvas API
  // Retorna: { blob, tamanhoOriginal, tamanhoComprimido, percentualReducao }
}
```

---

## 🧪 Testes Unitários

### Estrutura de Testes

```typescript
// server/minhaFuncao.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { minhaFuncao } from './minhaFuncao';

describe('minhaFuncao', () => {
  let resultado: any;
  
  beforeEach(() => {
    resultado = null;
  });
  
  afterEach(() => {
    // Cleanup
  });
  
  it('deve fazer algo quando X', () => {
    resultado = minhaFuncao('input');
    expect(resultado).toBe('esperado');
  });
  
  it('deve lançar erro quando Y', () => {
    expect(() => minhaFuncao('inválido')).toThrow();
  });
});
```

### Executar Testes

```bash
# Todos os testes
pnpm test

# Teste específico
pnpm test minhaFuncao.test.ts

# Watch mode
pnpm test:watch

# Com cobertura
pnpm test:coverage
```

### Testes Atuais

```
✓ server/utils.test.ts (11 testes)
  ✓ generateRequestId - formato correto
  ✓ generateRequestId - tamanho correto
  ✓ validatePhoneNumber - número válido
  ✓ validatePhoneNumber - número inválido
  ✓ validatePhoneNumber - número vazio
  ✓ validateImageFile - arquivo válido
  ✓ validateImageFile - arquivo inválido (tipo)
  ✓ validateImageFile - arquivo inválido (tamanho)
  ✓ validateImageFile - arquivo muito grande
  ✓ validateImageFile - arquivo vazio
  ✓ validateImageFile - múltiplos arquivos válidos
```

---

## 🚀 Deployment

### Pré-requisitos para Deploy

- [ ] Todos os testes passam (`pnpm test`)
- [ ] Sem erros TypeScript (`pnpm check`)
- [ ] Build bem-sucedido (`pnpm build`)
- [ ] Sem warnings no console
- [ ] Testado em mobile
- [ ] Testado em diferentes navegadores
- [ ] Performance aceitável
- [ ] Documentação atualizada
- [ ] Variáveis de ambiente configuradas
- [ ] Backup do banco de dados feito

### Deploy no Manus

1. **Criar Checkpoint:**
```bash
git add .
git commit -m "chore: prepare for deployment"
git push origin main
```

2. **Usar Management UI:**
   - Acesse o dashboard do Manus
   - Clique em "Publish"
   - Selecione o checkpoint
   - Confirme o deploy

3. **Verificar Deploy:**
```bash
# Acesse a URL publicada
https://seu-projeto.manus.space

# Verifique os logs
# Dashboard → Logs
```

### Variáveis de Ambiente em Produção

Configure no Manus Dashboard:
- `DATABASE_URL` - URL do banco de dados
- `JWT_SECRET` - Chave secreta (mínimo 32 caracteres)
- `WEBHOOK_URL` - URL do webhook Google Apps Script
- `WEBHOOK_TOKEN` - Token do webhook (DECATHLON-2026)
- Todos os outros secrets conforme `.env.local`

### Rollback

Se algo der errado:

```bash
# Volte para checkpoint anterior
git revert HEAD
git push origin main

# Ou use Management UI → Rollback
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module '@/components/ui/button'"

**Solução:**
```bash
# Reinstale dependências
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Ou use o alias correto
# tsconfig.json deve ter:
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./client/src/*"]
    }
  }
}
```

### Erro: "Database connection failed"

**Solução:**
```bash
# Verifique DATABASE_URL
echo $DATABASE_URL

# Teste conexão
pnpm db:push

# Se falhar, verifique:
# 1. URL está correta?
# 2. Banco de dados está rodando?
# 3. Credenciais estão corretas?
```

### Erro: "Webhook returns 401 Unauthorized"

**Solução:**
```bash
# 1. Verifique o token
echo $WEBHOOK_TOKEN  # Deve ser: DECATHLON-2026

# 2. Verifique a URL
echo $WEBHOOK_URL

# 3. Execute diagnóstico
npx ts-node server/webhook-diagnostic.ts

# 4. Se ainda falhar, verifique:
# - Apps Script está publicado?
# - Propriedade WEBHOOK_TOKEN está configurada?
# - Token está correto no Apps Script?
```

### Erro: "Image compression fails"

**Solução:**
```typescript
// Verifique se o arquivo é válido
if (!file.type.startsWith('image/')) {
  throw new Error('Arquivo não é uma imagem');
}

// Verifique tamanho máximo
if (file.size > 5 * 1024 * 1024) {
  throw new Error('Arquivo muito grande (máx 5MB)');
}

// Teste compressão
const resultado = await compressImage(file);
console.log(`Redução: ${resultado.percentualReducao}%`);
```

### Erro: "Form validation fails"

**Solução:**
```typescript
// Verifique o schema Zod
try {
  const validado = SolicitacaoSchema.parse(dados);
} catch (error) {
  console.error('Erro de validação:', error.errors);
  // Exiba erros específicos ao usuário
}
```

### Erro: "S3 upload fails"

**Solução:**
```bash
# Verifique credenciais S3
echo $BUILT_IN_FORGE_API_KEY
echo $BUILT_IN_FORGE_API_URL

# Teste upload
curl -X POST "$BUILT_IN_FORGE_API_URL/upload" \
  -H "Authorization: Bearer $BUILT_IN_FORGE_API_KEY" \
  -F "file=@test.jpg"
```

---

## 🗺️ Roadmap & Features Futuras

### Q1 2026

- [ ] **Dashboard de Acompanhamento**
  - Visualizar histórico de solicitações
  - Filtrar por loja, período, status
  - Exportar para Excel

- [ ] **Notificações por Email**
  - Alertar time de Compras
  - Confirmar recebimento de solicitação
  - Status de compra

- [ ] **Integração com Planilha de Compras**
  - Sincronizar status de compra
  - Atualizar data de entrega
  - Notificar quando material chegar

### Q2 2026

- [ ] **Mobile App (React Native)**
  - Versão nativa iOS/Android
  - Offline mode
  - Push notifications

- [ ] **Assinatura Digital**
  - Validação de identidade
  - Rastreabilidade completa
  - Conformidade legal

- [ ] **Integração com Sistema de Estoque**
  - Verificar disponibilidade
  - Sugerir alternativas
  - Atualizar estoque automaticamente

### Q3 2026

- [ ] **BI & Analytics**
  - Dashboard de métricas
  - Relatórios por loja/período
  - Previsão de demanda

- [ ] **Integração com Fornecedores**
  - Enviar pedidos automaticamente
  - Rastrear entrega
  - Atualizar preços

### Q4 2026

- [ ] **AI & Machine Learning**
  - Sugerir materiais baseado em histórico
  - Detectar anomalias
  - Otimizar rotas de entrega

---

## 📞 Suporte e Contato

### Problemas?

1. **Verifique o Troubleshooting** - Seção acima
2. **Leia a documentação** - README.md, CONTRIBUTING.md
3. **Abra uma Issue** - GitHub Issues
4. **Contate o Tech Lead** - Email: tech@decathlon.com

### Recursos Úteis

- [tRPC Documentation](https://trpc.io/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Vitest](https://vitest.dev)

---

## 📝 Changelog

### v1.0.0 (Janeiro 2026)

- ✅ Formulário completo de solicitação
- ✅ Captura de câmera + upload de galeria
- ✅ Compressão automática de imagens
- ✅ Integração com webhook Google Apps Script
- ✅ Upload de fotos para S3
- ✅ Validação em tempo real
- ✅ Animação de carregamento
- ✅ 11 testes unitários
- ✅ Documentação completa

---

**Versão:** 1.0.0  
**Última Atualização:** 27 de Janeiro de 2026  
**Mantido por:** Decathlon Tech Team  
**Licença:** MIT

---

## 🎉 Obrigado por Contribuir!

Este projeto é mantido pela comunidade. Sua contribuição é valiosa!

**Próximos passos:**
1. Leia [CONTRIBUTING.md](./CONTRIBUTING.md)
2. Crie uma branch para sua feature
3. Abra um Pull Request
4. Aguarde revisão

---
