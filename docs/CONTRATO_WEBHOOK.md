# Contrato de Webhook - Google Apps Script

**Versão**: 1.0 | **Última atualização**: Janeiro 2026

---

## 📋 Visão Geral

Este documento especifica o contrato entre o backend MOPAR e o Google Apps Script para integração de solicitações de materiais.

**Endpoint**: `https://script.google.com/macros/s/{SCRIPT_ID}/exec`  
**Método**: `POST`  
**Content-Type**: `application/json`  
**Autenticação**: Token em query param + header

---

## 🔐 Autenticação

### Regras

1. **Token em Query Param**:
   ```
   ?token=DECATHLON-2026
   ```

2. **Token em Header**:
   ```
   X-Webhook-Token: DECATHLON-2026
   ```

3. **Validação no Apps Script**:
   ```javascript
   function doPost(e) {
     // Obter token de query param ou header
     const token = e.parameter.token || e.postData.headers['X-Webhook-Token'];
     
     // Validar token
     if (token !== 'DECATHLON-2026') {
       return ContentService.createTextOutput('Unauthorized')
         .setMimeType(ContentService.MimeType.TEXT);
     }
     
     // Continuar processamento...
   }
   ```

### Valores

| Campo | Valor | Obrigatório |
|-------|-------|------------|
| Token | `DECATHLON-2026` | ✅ |

---

## 📤 Payload de Requisição

### Estrutura Geral

```json
{
  "request_id": "REQ-20260130-A7K9X",
  "timestamp": 1706554800000,
  "dados_principais": {
    "loja_id": 0,
    "loja_label": "ESCRITÓRIO",
    "nome_solicitante": "João Silva",
    "telefone": "(11) 99999-9999",
    "numero_chamado": "CHM-2026-001"
  },
  "equipe_servico": {
    "tipo_equipe": "Própria",
    "empresa_terceira": null,
    "tipo_servico": "Preventiva",
    "sistema_afetado": "HVAC",
    "descricao_geral": "Ar condicionado da sala 201 não liga"
  },
  "materiais": [
    {
      "descricao": "Compressor 5 HP",
      "especificacao": "220V, marca Copeland",
      "quantidade": 1,
      "unidade": "un",
      "urgencia": "Alta",
      "foto1_url": "https://mopar-solicitacoes.s3.amazonaws.com/user123-files/compressor-A7K9X.jpg",
      "foto2_url": null
    }
  ]
}
```

### Campos Detalhados

#### `request_id` (string, obrigatório)
- Identificador único da solicitação
- Formato: `REQ-{YYYYMMDD}-{RANDOM}`
- Exemplo: `REQ-20260130-A7K9X`
- Usado para rastreamento

#### `timestamp` (number, obrigatório)
- Timestamp em millisegundos (Unix epoch)
- Exemplo: `1706554800000`
- Representa data/hora de envio

#### `dados_principais` (object, obrigatório)

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `loja_id` | number | ID da loja (0-50) | `0` |
| `loja_label` | string | Nome da loja | `"ESCRITÓRIO"` |
| `nome_solicitante` | string | Nome completo | `"João Silva"` |
| `telefone` | string | Telefone com DDD | `"(11) 99999-9999"` |
| `numero_chamado` | string | Número do chamado | `"CHM-2026-001"` |

#### `equipe_servico` (object, obrigatório)

| Campo | Tipo | Valores | Exemplo |
|-------|------|--------|---------|
| `tipo_equipe` | string | "Própria" \| "Terceirizada" | `"Própria"` |
| `empresa_terceira` | string \| null | Nome da empresa ou null | `null` |
| `tipo_servico` | string | "Preventiva" \| "Corretiva" | `"Preventiva"` |
| `sistema_afetado` | string | "HVAC" \| "Elétrica" \| "Hidráulica" \| "Civil" \| "PPCI" \| "Outros" | `"HVAC"` |
| `descricao_geral` | string | Descrição do serviço | `"Ar condicionado não liga"` |

#### `materiais` (array, obrigatório)

Array com 1 ou mais materiais. Cada material contém:

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `descricao` | string | O que é o material | `"Compressor 5 HP"` |
| `especificacao` | string \| null | Detalhes técnicos | `"220V, marca Copeland"` |
| `quantidade` | number | Quantidade | `1` |
| `unidade` | string | Unidade (un/cx/par/m/kg/L/rolo/kit/outro) | `"un"` |
| `urgencia` | string | "Alta" \| "Média" \| "Baixa" | `"Alta"` |
| `foto1_url` | string \| null | URL pública da foto 1 | `"https://..."` |
| `foto2_url` | string \| null | URL pública da foto 2 | `null` |

---

## 📥 Payload de Resposta

### Sucesso (HTTP 200)

```json
{
  "ok": true
}
```

**Regra**: A resposta DEVE conter `{ "ok": true }` em JSON válido.

### Erro (HTTP 4xx/5xx)

```json
{
  "ok": false,
  "error": "Descrição do erro"
}
```

**Ou** (se não conseguir parsear JSON):

```
HTML ou texto de erro
```

---

## 🔄 Fluxo de Processamento

### No Backend MOPAR

```javascript
// 1. Construir payload
const payload = {
  request_id: generateRequestId(),
  timestamp: Date.now(),
  dados_principais: { ... },
  equipe_servico: { ... },
  materiais: [ ... ]
};

// 2. Chamar webhook
const response = await fetch(
  `${WEBHOOK_URL}?token=${WEBHOOK_TOKEN}`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Token': WEBHOOK_TOKEN
    },
    body: JSON.stringify(payload)
  }
);

// 3. Validar resposta
const text = await response.text();
const isHtml = /<html|<!DOCTYPE/i.test(text);

if (isHtml) {
  throw new Error('Webhook retornou HTML — verifique URL /exec');
}

const json = JSON.parse(text);
if (!json.ok) {
  throw new Error(`Webhook retornou erro: ${json.error}`);
}

// 4. Sucesso
return { request_id, ok: true };
```

### No Google Apps Script

```javascript
function doPost(e) {
  try {
    // 1. Validar token
    const token = e.parameter.token || e.postData.headers['X-Webhook-Token'];
    if (token !== 'DECATHLON-2026') {
      return ContentService.createTextOutput('Unauthorized')
        .setMimeType(ContentService.MimeType.TEXT);
    }

    // 2. Parsear JSON
    const payload = JSON.parse(e.postData.contents);

    // 3. Validar estrutura
    if (!payload.request_id || !payload.dados_principais) {
      throw new Error('Payload inválido');
    }

    // 4. Obter planilha
    const sheet = SpreadsheetApp.getActiveSheet();

    // 5. Preparar linha
    const row = [
      payload.dados_principais.loja_label,
      payload.dados_principais.nome_solicitante,
      payload.dados_principais.telefone,
      payload.dados_principais.numero_chamado,
      payload.equipe_servico.tipo_equipe,
      payload.equipe_servico.empresa_terceira || '',
      payload.equipe_servico.tipo_servico,
      payload.equipe_servico.sistema_afetado,
      payload.equipe_servico.descricao_geral,
      payload.materiais.map(m => `${m.descricao} (${m.quantidade} ${m.unidade})`).join('; '),
      payload.materiais[0]?.foto1_url || '',
      payload.materiais[0]?.foto2_url || '',
      'Recebido',
      new Date().toLocaleString('pt-BR')
    ];

    // 6. Inserir linha
    sheet.appendRow(row);

    // 7. Retornar sucesso
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Erro: ' + error);
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## ✅ Regras de Sucesso

### Requisição Válida
- [ ] Token presente em query param OU header
- [ ] Token corresponde a `DECATHLON-2026`
- [ ] Content-Type é `application/json`
- [ ] Body é JSON válido
- [ ] Todos campos obrigatórios presentes
- [ ] Tipos de dados corretos

### Resposta Válida
- [ ] Status HTTP 200
- [ ] Content-Type é `application/json`
- [ ] Body contém `{ "ok": true }`
- [ ] Sem HTML ou texto de erro

### Processamento no Apps Script
- [ ] Linha inserida na planilha
- [ ] Request_ID registrado
- [ ] Fotos linkadas (se houver)
- [ ] Status marcado como "Recebido"

---

## ❌ Regras de Erro

### Erro 401 - Unauthorized
```
Status: 401
Body: HTML de autenticação do Google
Causa: Token inválido ou não enviado
Solução: Verificar WEBHOOK_TOKEN em .env
```

### Erro 403 - Forbidden
```
Status: 403
Body: HTML de permissão do Google
Causa: Apps Script não publicado como "Anyone"
Solução: Republicar com permissão "Anyone"
```

### Erro 404 - Not Found
```
Status: 404
Body: HTML de página não encontrada
Causa: URL do webhook incorreta
Solução: Verificar WEBHOOK_URL em .env
```

### Erro 500 - Server Error
```
Status: 500
Body: Erro do Apps Script
Causa: Erro no processamento do Apps Script
Solução: Verificar logs do Apps Script
```

### Erro de Rede
```
Tipo: Timeout, Connection Refused, etc
Causa: Servidor indisponível
Solução: Retry automático (1x, backoff 800ms)
```

---

## 🔄 Retry Logic

### Quando Fazer Retry
- ✅ Timeout (> 30s)
- ✅ Connection Refused
- ✅ Network Error
- ❌ 401/403 (erro de autenticação)
- ❌ 400 (erro de validação)
- ❌ HTML na resposta

### Configuração
- **Tentativas**: 1 retry
- **Backoff**: 800ms
- **Timeout**: 30 segundos

### Código

```javascript
async function callWebhookWithRetry(payload, maxRetries = 1) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(`${WEBHOOK_URL}?token=${WEBHOOK_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Token': WEBHOOK_TOKEN
        },
        body: JSON.stringify(payload),
        timeout: 30000
      });

      const text = await response.text();
      
      // Detectar HTML
      if (/<html|<!DOCTYPE/i.test(text)) {
        throw new Error('Webhook retornou HTML');
      }

      const json = JSON.parse(text);
      if (json.ok) return json;
      throw new Error(json.error);

    } catch (error) {
      if (i < maxRetries && isRetryable(error)) {
        await sleep(800);
        continue;
      }
      throw error;
    }
  }
}

function isRetryable(error) {
  const msg = error.message || '';
  return msg.includes('timeout') || 
         msg.includes('ECONNREFUSED') ||
         msg.includes('Network');
}
```

---

## 📊 Exemplo Completo

### Requisição

```bash
curl -X POST \
  'https://script.google.com/macros/s/AKfycby.../exec?token=DECATHLON-2026' \
  -H 'Content-Type: application/json' \
  -H 'X-Webhook-Token: DECATHLON-2026' \
  -d '{
    "request_id": "REQ-20260130-A7K9X",
    "timestamp": 1706554800000,
    "dados_principais": {
      "loja_id": 0,
      "loja_label": "ESCRITÓRIO",
      "nome_solicitante": "João Silva",
      "telefone": "(11) 99999-9999",
      "numero_chamado": "CHM-2026-001"
    },
    "equipe_servico": {
      "tipo_equipe": "Própria",
      "empresa_terceira": null,
      "tipo_servico": "Preventiva",
      "sistema_afetado": "HVAC",
      "descricao_geral": "Ar condicionado da sala 201 não liga"
    },
    "materiais": [
      {
        "descricao": "Compressor 5 HP",
        "especificacao": "220V, marca Copeland",
        "quantidade": 1,
        "unidade": "un",
        "urgencia": "Alta",
        "foto1_url": "https://mopar-solicitacoes.s3.amazonaws.com/user123-files/compressor-A7K9X.jpg",
        "foto2_url": null
      }
    ]
  }'
```

### Resposta

```json
{
  "ok": true
}
```

---

## 🧪 Teste Local

### Usando Postman

1. **POST**: `https://script.google.com/macros/s/{SCRIPT_ID}/exec?token=DECATHLON-2026`
2. **Headers**:
   - `Content-Type: application/json`
   - `X-Webhook-Token: DECATHLON-2026`
3. **Body**: JSON payload acima
4. **Enviar**
5. **Verificar resposta**: `{ "ok": true }`

### Usando Node.js

```javascript
const payload = { /* ... */ };

const response = await fetch(
  'https://script.google.com/macros/s/{SCRIPT_ID}/exec?token=DECATHLON-2026',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Token': 'DECATHLON-2026'
    },
    body: JSON.stringify(payload)
  }
);

const json = await response.json();
console.log(json); // { ok: true }
```

---

## 📝 Versionamento

| Versão | Data | Mudanças |
|--------|------|----------|
| 1.0 | 30/01/2026 | Versão inicial |

---

**Última atualização**: 30 de janeiro de 2026  
**Mantido por**: Equipe de Engenharia MOPAR
