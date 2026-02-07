# Guia de Debug - Webhook Google Apps Script

## Problema Identificado

O webhook está retornando erro **"Page Not Found"** (HTML 404 do Google), o que significa que a URL do Apps Script não está mais disponível ou está incorreta.

## Logs Observados

```
[Webhook] Response: <!DOCTYPE html><html lang="en">...
[Webhook] Failed to parse response: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

## Possíveis Causas

1. **URL do webhook está incorreta** - A URL fornecida pode ter sido alterada
2. **Apps Script foi removido** - O script pode ter sido deletado do Google Drive
3. **Apps Script foi desativado** - O script pode estar desativado ou não publicado
4. **Permissões alteradas** - O script pode ter tido suas permissões alteradas

## Soluções

### Opção 1: Usar Modo Mock (Desenvolvimento)

Para testar a aplicação sem o webhook real, ative o modo mock:

```bash
# No arquivo .env ou ao iniciar o servidor
USE_MOCK_WEBHOOK=true
```

Quando ativado, o sistema simulará respostas bem-sucedidas do webhook.

### Opção 2: Atualizar a URL do Webhook

Se você tem uma nova URL do Apps Script, atualize em `server/routers.ts`:

```typescript
// Linha 72 em server/routers.ts
const webhookUrlString = process.env.WEBHOOK_URL || 'https://script.google.com/macros/s/NOVA_URL_AQUI/exec';
```

Ou defina a variável de ambiente:

```bash
WEBHOOK_URL=https://script.google.com/macros/s/NOVA_URL_AQUI/exec
```

### Opção 3: Testar o Webhook

Execute o script de teste para validar a URL:

```bash
npx ts-node server/webhook-test.ts
```

Este script:
- Testa a conectividade com o webhook
- Mostra a resposta recebida
- Identifica se é HTML ou JSON
- Fornece diagnóstico detalhado

## Verificação no Google Apps Script

1. Acesse [Google Apps Script](https://script.google.com)
2. Abra o projeto de Decathlon
3. Verifique se o script está publicado como Web App
4. Confirme as permissões de execução
5. Copie a URL de publicação correta

## Estrutura do Payload Esperado

O webhook deve aceitar POST com este payload:

```json
{
  "request_id": "20260126-014900-ABC123",
  "timestamp_envio": "2026-01-26T01:49:00.000Z",
  "header": {
    "loja_id": "0041",
    "loja_label": "0041 - ARMAZÉM BARUERI",
    "solicitante_nome": "João Silva",
    "solicitante_telefone": "(11) 99999-9999",
    "numero_chamado": "CHM-2026-001",
    "tipo_equipe": "Própria",
    "empresa_terceira": "",
    "tipo_servico": "Preventiva",
    "sistema_afetado": "HVAC",
    "descricao_geral_servico": "Manutenção preventiva do sistema"
  },
  "items": [
    {
      "material_descricao": "Filtro de ar",
      "material_especificacao": "Modelo XYZ",
      "quantidade": 2,
      "unidade": "un",
      "urgencia": "Média",
      "foto1_url": "https://s3.example.com/foto1.jpg",
      "foto2_url": ""
    }
  ]
}
```

## Resposta Esperada

O webhook deve retornar JSON com este formato:

```json
{
  "ok": true,
  "message": "Solicitação recebida com sucesso"
}
```

Ou em caso de erro:

```json
{
  "ok": false,
  "error": "Descrição do erro"
}
```

## Logs Disponíveis

Quando uma solicitação é enviada, verifique os logs do servidor:

```
[Webhook] Enviando para: https://script.google.com/macros/s/...
[Webhook] Status: 200
[Webhook] Response Text: {...}
[Webhook] ✅ Success response received
```

## Próximos Passos

1. Verifique a URL do webhook no Google Apps Script
2. Execute o teste: `npx ts-node server/webhook-test.ts`
3. Se necessário, ative modo mock: `USE_MOCK_WEBHOOK=true`
4. Atualize a URL em `server/routers.ts` ou via variável de ambiente
5. Teste novamente o envio de solicitação
