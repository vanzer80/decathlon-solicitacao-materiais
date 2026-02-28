# 🔍 Relatório de Auditoria Profunda - Problema: Dados Não Chegam na Planilha

**Data:** 27 de Janeiro de 2026  
**Versão:** 1.0  
**Status:** 🔴 CRÍTICO - Dados não sendo persistidos no Google Sheets

---

## 📋 Sumário Executivo

O formulário de solicitação de materiais está **funcionando parcialmente**:
- ✅ Formulário carrega corretamente
- ✅ Validação funciona
- ✅ Animação de sucesso exibe
- ✅ Request_ID é gerado
- ❌ **Dados NÃO chegam no Google Sheets**
- ❌ **Webhook pode estar retornando sucesso falso**

---

## 🔴 Problemas Identificados

### 1. **CRÍTICO: Estrutura do Payload Incompatível**

**Localização:** `server/routers.ts` linhas 44-69

**Problema:**
```typescript
// ENVIADO PARA WEBHOOK:
const payload = {
  request_id: requestId,
  timestamp_envio: timestampEnvio,
  header: { ... },
  items: [...]  // ← Array de items
};

// MAS O FRONTEND ENVIA:
const result = await submitMutation.mutateAsync({
  requestId,
  timestampEnvio,
  lojaId, lojaLabel, ... // ← Campos soltos
  materiais: [...]  // ← Chamado "materiais" não "items"
});
```

**Impacto:** O backend está recebendo dados em um formato, mas enviando para o webhook em outro formato. Os campos não correspondem.

---

### 2. **CRÍTICO: Mapeamento de Campos Incorreto**

**Localização:** `server/routers.ts` linhas 289-310

**Problema:**
```typescript
// FRONTEND ENVIA:
{
  requestId,
  timestampEnvio,
  lojaId,
  lojaLabel,
  solicitanteNome,
  solicitanteTelefone,
  numeroChamado,
  tipoEquipe,
  empresaTerceira,
  tipoServico,
  sistemaAfetado,
  descricaoGeralServico,
  materiais: [
    { descricao, especificacao, quantidade, unidade, urgencia, foto1Url, foto2Url }
  ]
}

// BACKEND TENTA ACESSAR:
const { requestId, timestampEnvio, header, items, foto1Urls, foto2Urls } = input;
// ↑ "header" NÃO EXISTE no input!
// ↑ "items" NÃO EXISTE no input!
// ↑ "foto1Urls" NÃO EXISTE no input!
```

**Impacto:** O backend está tentando desestruturar campos que não existem, resultando em `undefined`.

---

### 3. **CRÍTICO: Webhook Retorna Sucesso Falso**

**Localização:** `server/routers.ts` linhas 119-146

**Problema:**
```typescript
// Se a resposta for vazia ou HTML, retorna sucesso:
if (responseText.trim() === '') {
  console.log('[Webhook] ⚠️  Received empty response, assuming success');
  return { success: true, requestId };  // ← SUCESSO FALSO!
}

// Se não conseguir fazer parse de JSON, retorna sucesso:
if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
  console.error('[Webhook] ❌ Webhook retornou HTML em vez de JSON');
  return { success: false, error: 'Webhook retornou HTML. Verifique a URL e se o Apps Script está publicado.' };
}

// Se não houver campo 'ok', considera como sucesso:
else {
  console.log('[Webhook] ✅ Response received:', responseData);
  return { success: true, requestId };  // ← SUCESSO FALSO!
}
```

**Impacto:** O webhook pode estar falhando silenciosamente, mas o frontend recebe "sucesso". Usuário vê tela de sucesso, mas dados não foram salvos.

---

### 4. **ALTO: Falta de Validação de Dados**

**Localização:** `server/routers.ts` linhas 23-26

**Problema:**
```typescript
.input((val: unknown) => {
  if (typeof val !== 'object' || val === null) throw new Error('Invalid input');
  return val as any;  // ← "as any" desativa type checking!
})
```

**Impacto:** Sem validação de schema, qualquer formato de dados é aceito. Erros só aparecem em runtime.

---

### 5. **ALTO: Estrutura de Fotos Incorreta**

**Localização:** `server/routers.ts` linhas 66-67

**Problema:**
```typescript
// ESPERADO PELO WEBHOOK:
foto1_url: foto1Urls?.[index] || '',
foto2_url: foto2Urls?.[index] || '',

// MAS FRONTEND ENVIA:
foto1Url: foto1Urls[idx] || '',  // ← camelCase, não snake_case
foto2Url: foto2Urls[idx] || '',
```

**Impacto:** Nomes de campos não correspondem. Webhook não consegue encontrar as URLs.

---

### 6. **MÉDIO: Falta de Logging Detalhado**

**Problema:** Sem logs do que está sendo enviado, é impossível debugar.

**Impacto:** Não conseguimos ver o payload exato que está sendo enviado.

---

### 7. **MÉDIO: Sem Tratamento de Erro de Rede**

**Localização:** `server/routers.ts` linhas 147-152

**Problema:**
```typescript
catch (error: any) {
  console.error('[Webhook] ❌ Catch Error:', error.message);
  return { success: false, error: error.message };
}
```

**Impacto:** Erros de rede são capturados, mas o frontend não sabe o que fazer.

---

## 🎯 Raiz do Problema

O **mapeamento de dados entre frontend e backend está quebrado**:

```
Frontend envia:
{
  requestId,
  timestampEnvio,
  lojaId,
  lojaLabel,
  solicitanteNome,
  solicitanteTelefone,
  numeroChamado,
  tipoEquipe,
  empresaTerceira,
  tipoServico,
  sistemaAfetado,
  descricaoGeralServico,
  materiais: [...]
}
     ↓
Backend tenta acessar:
{
  requestId,
  timestampEnvio,
  header,  ← NÃO EXISTE!
  items,   ← NÃO EXISTE!
  foto1Urls,  ← NÃO EXISTE!
  foto2Urls   ← NÃO EXISTE!
}
     ↓
Backend envia para webhook:
{
  request_id,
  timestamp_envio,
  header: {
    loja_id,
    loja_label,
    solicitante_nome,
    ...
  },
  items: [...]  ← undefined porque não foi mapeado!
}
     ↓
Google Sheets recebe dados incompletos ou vazios
```

---

## 📊 Análise de Impacto

| Problema | Severidade | Impacto | Status |
|----------|-----------|--------|--------|
| Mapeamento de dados quebrado | 🔴 CRÍTICO | Dados não chegam | Não testado |
| Webhook retorna sucesso falso | 🔴 CRÍTICO | Usuário não sabe que falhou | Não testado |
| Estrutura de payload incorreta | 🔴 CRÍTICO | Webhook não consegue processar | Não testado |
| Falta de validação de schema | 🟠 ALTO | Erros em runtime | Não testado |
| Nomes de campos inconsistentes | 🟠 ALTO | Webhook não encontra dados | Não testado |
| Falta de logging detalhado | 🟡 MÉDIO | Impossível debugar | Não testado |
| Sem tratamento de erro de rede | 🟡 MÉDIO | Erros não são claros | Não testado |

---

## 🛠️ Plano de Correções

### Fase 1: Correções Críticas (ALTA PRIORIDADE)

1. **Corrigir mapeamento de dados no backend**
   - Desestruturar corretamente os dados do frontend
   - Mapear `materiais` para `items`
   - Mapear campos soltos para `header`

2. **Adicionar validação de schema com Zod**
   - Validar estrutura de entrada
   - Validar tipos de dados
   - Retornar erros claros

3. **Corrigir estrutura de payload**
   - Garantir que `header` e `items` sejam criados corretamente
   - Usar nomes de campos corretos (snake_case)
   - Incluir todas as fotos

4. **Melhorar tratamento de resposta do webhook**
   - Não retornar sucesso falso
   - Validar resposta JSON
   - Retornar erro claro se falhar

### Fase 2: Correções de Alta Prioridade

5. **Adicionar logging detalhado**
   - Log do payload antes de enviar
   - Log da resposta do webhook
   - Log de erros com stack trace

6. **Adicionar retry logic**
   - Tentar novamente se falhar
   - Exponential backoff
   - Máximo de 3 tentativas

### Fase 3: Melhorias

7. **Adicionar testes unitários**
   - Testar mapeamento de dados
   - Testar validação de schema
   - Testar tratamento de erros

8. **Adicionar monitoramento**
   - Rastrear taxa de sucesso
   - Alertar se muitas falhas
   - Logs estruturados

---

## 📝 Próximas Ações

1. ✅ Ler este relatório
2. ⏳ Implementar correções críticas
3. ⏳ Testar envio de solicitação
4. ⏳ Verificar dados na planilha
5. ⏳ Implementar melhorias
6. ⏳ Documentar mudanças

---

**Fim do Relatório**
