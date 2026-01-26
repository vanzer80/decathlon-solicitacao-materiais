/**
 * Script de teste para validar integração com webhook
 * Execute com: npx ts-node server/webhook-test.ts
 */

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycby9oLYJI9mJqSDOEi6kQQELU7naTfjpesQIYyfRvS8/exec';
const WEBHOOK_TOKEN = 'DECATHLON-2026';

async function testWebhook() {
  console.log('🔍 Testando webhook...');
  console.log('URL:', WEBHOOK_URL);
  console.log('Token:', WEBHOOK_TOKEN);
  console.log('');

  // Payload de teste simples
  const testPayload = {
    request_id: '20260126-014900-TEST01',
    timestamp_envio: new Date().toISOString(),
    header: {
      loja_id: '0041',
      loja_label: '0041 - ARMAZÉM BARUERI (SÃO PAULO/SP)',
      solicitante_nome: 'Teste Webhook',
      solicitante_telefone: '(11) 99999-9999',
      numero_chamado: 'CHM-2026-001',
      tipo_equipe: 'Própria',
      empresa_terceira: '',
      tipo_servico: 'Preventiva',
      sistema_afetado: 'HVAC',
      descricao_geral_servico: 'Teste de integração com webhook',
    },
    items: [
      {
        material_descricao: 'Filtro de ar',
        material_especificacao: 'Modelo XYZ',
        quantidade: 2,
        unidade: 'un',
        urgencia: 'Média',
        foto1_url: '',
        foto2_url: '',
      },
    ],
  };

  try {
    console.log('📤 Enviando payload...');
    console.log(JSON.stringify(testPayload, null, 2));
    console.log('');

    const webhookUrlWithToken = new URL(WEBHOOK_URL);
    webhookUrlWithToken.searchParams.append('token', WEBHOOK_TOKEN);

    const response = await fetch(webhookUrlWithToken.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Token': WEBHOOK_TOKEN,
      },
      body: JSON.stringify(testPayload),
    });

    console.log('📥 Resposta recebida:');
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('');

    const responseText = await response.text();
    console.log('Response Body (primeiros 500 chars):');
    console.log(responseText.substring(0, 500));
    console.log('');

    // Tentar fazer parse como JSON
    try {
      const responseData = JSON.parse(responseText);
      console.log('✅ JSON válido:');
      console.log(JSON.stringify(responseData, null, 2));

      if (responseData.ok === true) {
        console.log('✅ Webhook retornou sucesso!');
      } else {
        console.log('❌ Webhook retornou erro:', responseData.error);
      }
    } catch (e) {
      console.log('❌ Resposta não é JSON válido');
      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
        console.log('⚠️  Webhook retornou HTML (possível erro 404 ou página de erro)');
        console.log('');
        console.log('POSSÍVEIS CAUSAS:');
        console.log('1. URL do webhook está incorreta');
        console.log('2. Apps Script não está mais publicado');
        console.log('3. Apps Script foi removido ou desativado');
        console.log('');
        console.log('SOLUÇÃO:');
        console.log('Verifique se a URL do webhook está correta em server/routers.ts');
        console.log('URL atual:', WEBHOOK_URL);
      }
    }
  } catch (error: any) {
    console.error('❌ Erro ao testar webhook:', error.message);
  }
}

testWebhook();
