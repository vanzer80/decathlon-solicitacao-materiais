# Solicitação de Materiais - Decathlon

Web app público, mobile-first, para técnicos de campo solicitarem materiais com integração ao Google Apps Script.

## 🚀 Início Rápido

### Rodar localmente

```bash
# Instalar dependências
pnpm install

# Executar migrations do banco de dados
pnpm db:push

# Iniciar servidor de desenvolvimento
pnpm dev
```

O app estará disponível em `http://localhost:3000`

## 📋 Variáveis de Ambiente

As seguintes variáveis de ambiente são necessárias:

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `WEBHOOK_URL` | `https://script.google.com/macros/s/AKfycby9oLYJI9mJqSDOEi6kQQELU7naTfjpesQIYyfRvS8/exec` | URL do webhook do Google Apps Script |
| `WEBHOOK_TOKEN` | `DECATHLON-2026` | Token de autenticação do webhook |
| `USE_MOCK_WEBHOOK` | `false` | Se `true`, simula respostas do webhook para testes locais |
| `DATABASE_URL` | Obrigatório | String de conexão do banco de dados MySQL |

### Configurar variáveis localmente

Crie um arquivo `.env.local` na raiz do projeto:

```env
WEBHOOK_URL=https://script.google.com/macros/s/AKfycby9oLYJI9mJqSDOEi6kQQELU7naTfjpesQIYyfRvS8/exec
WEBHOOK_TOKEN=DECATHLON-2026
USE_MOCK_WEBHOOK=false
DATABASE_URL=mysql://user:password@localhost:3306/decathlon
```

## 🏗️ Arquitetura

### Frontend (React + TypeScript)

- **Formulário mobile-first** com validação por campo
- **Dropdown pesquisável** de lojas (carregado de `/lojas.json`)
- **Repetidor de materiais** com suporte a adicionar/remover itens
- **Upload de fotos** (até 2 por material, máx 5MB)
- **Tela de sucesso** com Request_ID

### Backend (Node.js + Express + tRPC)

- **Endpoint `/api/trpc/solicitacoes.submit`**: recebe e valida solicitações
- **Serviço de webhook**: integração com Google Apps Script
- **Serviço de upload**: armazena fotos em S3 (Manus storage)
- **Banco de dados**: registra solicitações e materiais para auditoria

### Integração com Google Apps Script

O webhook do Apps Script recebe um payload JSON estruturado e grava cada material como uma linha no Google Sheets:

```json
{
  "request_id": "20260130-142233-A1B2C3",
  "timestamp_envio": "2026-01-30T14:22:33.000Z",
  "header": {
    "loja_id": 0,
    "loja_label": "0000 - ESCRITÓRIO (SÃO PAULO/SP)",
    "solicitante_nome": "João Silva",
    "solicitante_telefone": "(11) 99999-9999",
    "numero_chamado": "CHM-2026-001",
    "tipo_equipe": "Própria",
    "empresa_terceira": "",
    "tipo_servico": "Preventiva",
    "sistema_afetado": "HVAC",
    "descricao_geral_servico": "Manutenção preventiva do ar condicionado"
  },
  "items": [
    {
      "material_descricao": "Filtro de ar",
      "material_especificacao": "20x25cm",
      "quantidade": 2,
      "unidade": "un",
      "urgencia": "Média",
      "foto1_url": "https://storage.example.com/...",
      "foto2_url": ""
    }
  ]
}
```

## 🧪 Testes

### Testes Unitários

```bash
# Executar todos os testes
pnpm test

# Executar testes em modo watch
pnpm test -- --watch
```

Testes cobrem:
- Geração de Request_ID (formato YYYYMMDD-HHMMSS-6CHARS)
- Validação de respostas do webhook
- Detecção de respostas HTML vs JSON

### Teste do Webhook

```bash
# Teste real (envia para o webhook configurado)
node webhook-test.mjs

# Teste em modo mock (simula resposta)
node webhook-test.mjs --mock

# Com variáveis de ambiente customizadas
WEBHOOK_URL="https://seu-webhook.com" WEBHOOK_TOKEN="seu-token" node webhook-test.mjs
```

O script imprime:
- Status HTTP da resposta
- Headers recebidos
- Primeiros 500 caracteres do body
- Se a resposta é JSON válido com `ok: true`

### Teste de Upload de Fotos

1. Abra o formulário em `http://localhost:3000`
2. Preencha os campos obrigatórios
3. Adicione um material
4. Selecione uma foto (máx 5MB, tipo image/*)
5. Envie a solicitação
6. Verifique se a foto aparece no Google Sheets com URL pública

## 📊 Fluxo de Dados

```
Frontend (Formulário)
    ↓
Validação (campos obrigatórios)
    ↓
Upload de fotos → S3 (Manus storage)
    ↓
Gerar Request_ID (YYYYMMDD-HHMMSS-6CHARS)
    ↓
Montar payload JSON
    ↓
POST → Webhook Google Apps Script
    ↓
Webhook valida e grava no Google Sheets (1 linha por material)
    ↓
Resposta: { "ok": true }
    ↓
Salvar no banco de dados local (auditoria)
    ↓
Exibir tela de sucesso com Request_ID
```

## 🔒 Segurança

- **Honeypot anti-spam**: campo invisível no formulário
- **Validação de arquivo**: apenas imagens, máx 5MB
- **Token em dois lugares**: query param + header (redundância)
- **URLs públicas**: fotos armazenadas em S3 público (sem login)
- **Sem dados sensíveis em logs**: apenas snippet da resposta

## 🐛 Troubleshooting

### "Webhook retornou HTML — verifique URL /exec"

**Causa**: URL do webhook está incorreta ou o Apps Script não foi publicado como Web App.

**Solução**:
1. Verifique se a URL termina com `/exec` (não `/dev`)
2. Publique o Apps Script como Web App (Deploy → New deployment → Web app)
3. Teste com `node webhook-test.mjs`

### "Erro de autenticação - verifique token do webhook" (HTTP 401)

**Causa**: Token inválido ou não enviado corretamente.

**Solução**:
1. Verifique se `WEBHOOK_TOKEN` está correto
2. Confirme que o token é enviado em dois lugares:
   - Query param: `?token=DECATHLON-2026`
   - Header: `X-Webhook-Token: DECATHLON-2026`

### Fotos não aparecem no Google Sheets

**Causa**: Upload falhou ou URL não é pública.

**Solução**:
1. Verifique tamanho (máx 5MB) e tipo (image/*)
2. Teste upload com formulário
3. Verifique se a URL é acessível sem login

### Banco de dados não conecta

**Causa**: `DATABASE_URL` inválida ou servidor MySQL offline.

**Solução**:
1. Verifique string de conexão em `.env.local`
2. Teste conexão: `mysql -u user -p -h host -D database`
3. Execute migrations: `pnpm db:push`

## 📝 Estrutura do Projeto

```
decathlon-solicitacao-materiais/
├── client/
│   ├── public/
│   │   └── lojas.json                    # Lista de lojas (dropdown)
│   └── src/
│       ├── pages/
│       │   ├── SolicitacaoForm.tsx       # Formulário principal
│       │   └── SuccessPage.tsx           # Tela de sucesso
│       └── App.tsx                       # Rotas
├── server/
│   ├── routers/
│   │   └── solicitacoes.ts               # tRPC procedures
│   ├── services/
│   │   ├── webhookService.ts             # Integração com webhook
│   │   └── uploadService.ts              # Upload de fotos
│   ├── db.ts                             # Query helpers
│   └── utils.test.ts                     # Testes unitários
├── drizzle/
│   └── schema.ts                         # Schema do banco de dados
├── shared/
│   ├── types.ts                          # Tipos compartilhados
│   └── utils.ts                          # Utilitários (generateRequestId, etc)
├── webhook-test.mjs                      # Script de teste do webhook
└── README_DECATHLON.md                   # Este arquivo
```

## 📱 Campos do Formulário

### Seção 1: Dados Principais
- **Loja** (obrigatório): dropdown pesquisável
- **Nome do Solicitante** (obrigatório)
- **Telefone / WhatsApp** (opcional)
- **Número do Chamado** (opcional)

### Seção 2: Equipe e Serviço
- **Tipo de Equipe** (obrigatório): Própria | Terceirizada
- **Empresa Terceira** (obrigatório se Terceirizada)
- **Tipo de Serviço** (obrigatório): Preventiva | Corretiva
- **Tipo de Serviço / Equipamento** (obrigatório): HVAC | Elétrica | Hidráulica | Civil | PPCI | Outros
- **Descrição Geral do Serviço** (obrigatório)

### Seção 3: Materiais (repetidor)
- **Descrição** (obrigatório)
- **Especificação Técnica** (opcional)
- **Quantidade** (obrigatório, > 0)
- **Unidade** (obrigatório): un | cx | par | m | kg | L | rolo | kit | outro
- **Urgência** (obrigatório): Alta | Média | Baixa
- **Foto 1** (opcional, máx 5MB)
- **Foto 2** (opcional, máx 5MB)

## 🎨 Design

- **Mobile-first**: otimizado para telas pequenas
- **Cores**: azul Decathlon (#0082C3) como cor primária
- **Cards**: layout em seções para melhor organização
- **Feedback**: validação por campo, toasts de sucesso/erro

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique o troubleshooting acima
2. Consulte os logs do servidor (`devserver.log`)
3. Teste o webhook com `node webhook-test.mjs`
4. Verifique a publicação do Apps Script

---

**Versão**: 1.0.0  
**Última atualização**: 30 de janeiro de 2026  
**Status**: Production-ready


## 📸 Upload de Fotos (Câmera e Galeria)

Para cada material, é possível anexar até 2 fotos. O app oferece duas opções de captura:

**Galeria**: Abre o gerenciador de arquivos/fotos do dispositivo. Ideal para fotos já existentes.

**Câmera**: Ativa a câmera do dispositivo para tirar uma foto em tempo real. Ideal para documentar o problema no local.

### Requisitos de Foto

- **Formatos aceitos**: JPEG, PNG, GIF, WebP
- **Tamanho máximo**: 5MB por foto
- **Total**: até 2 fotos por material

### Como usar

1. Preencha os dados do material (descrição, quantidade, etc)
2. Clique em "Galeria" para escolher uma foto existente OU "Câmera" para tirar uma foto
3. Selecione a foto desejada
4. A foto aparecerá como preview
5. Para remover, clique no X sobre a foto
6. Repita para a segunda foto (se necessário)
7. Envie a solicitação

### Dicas Mobile

- **Android**: Conceda permissão de câmera e armazenamento quando solicitado
- **iOS**: Conceda permissão de câmera quando solicitado
- **Orientação**: A câmera funciona em qualquer orientação (retrato ou paisagem)
- **Iluminação**: Certifique-se de boa iluminação para fotos claras

## 🔧 Notas Técnicas (Upload)

O app não usa Buffer no frontend (evita problemas de compatibilidade com navegador). Em vez disso:

1. Fotos são selecionadas como `File` objects
2. Validação de tipo e tamanho ocorre no frontend
3. Preview é gerado com `URL.createObjectURL()`
4. Ao enviar, o arquivo é convertido para `ArrayBuffer` e enviado ao backend
5. Backend faz upload para S3 e retorna URL pública
6. URLs são incluídas no payload do webhook

### Segurança

- Validação de tipo MIME (apenas image/*)
- Validação de tamanho (máx 5MB)
- URLs de fotos são públicas (sem autenticação)
- Nenhum dado sensível é armazenado nas fotos


## 🧪 Teste com Modo Mock (Sem Webhook Real)

Para testar a aplicação sem configurar o webhook do Google Apps Script, use o modo mock:

### Ativar Modo Mock

Defina a variável de ambiente `USE_MOCK_WEBHOOK=true`:

```bash
# No terminal, antes de rodar o app
export USE_MOCK_WEBHOOK=true
pnpm dev
```

Ou crie um arquivo `.env.local` na raiz do projeto:

```env
USE_MOCK_WEBHOOK=true
WEBHOOK_URL=https://script.google.com/macros/s/AKfycby9oLYJI9mJqSDOEi6kQQELU7naTfjpesQIYyfRvS8/exec
WEBHOOK_TOKEN=DECATHLON-2026
```

### Fluxo em Modo Mock

1. Preencha o formulário normalmente
2. Clique em "Enviar Solicitação"
3. O app simula uma resposta bem-sucedida do webhook
4. Exibe a tela de sucesso com Request_ID
5. **Nenhuma solicitação é enviada para o Google Apps Script**

### Quando Desativar Modo Mock

Quando tiver a URL correta do webhook do Google Apps Script:

1. Publique o Apps Script como Web App
2. Copie a URL (deve terminar com `/exec`)
3. Configure as variáveis de ambiente:
   - `WEBHOOK_URL`: URL do seu Apps Script
   - `WEBHOOK_TOKEN`: Token de autenticação
   - `USE_MOCK_WEBHOOK=false` (ou remova a variável)
4. Reinicie o servidor: `pnpm dev`

### Verificar Modo Ativo

Abra o console do navegador (F12) e procure por:

```
[Webhook] Mock mode - returning success
```

Se ver essa mensagem, o modo mock está ativo.
