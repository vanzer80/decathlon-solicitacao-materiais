/**
 * Script de diagnóstico para testar o webhook do Apps Script
 * Execute com: npx ts-node server/webhook-diagnostic.ts
 */

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzdonIA5DxB4s2fwlZphru10RSDRPxKeG_p61zn0h0CPt6EDOf4_WBO3QStGwmhZchW/exec'; // URL OFICIAL source of truth
const TOKEN = 'DECATHLON-2026';

async function testWebhook() {
  console.log('🔍 Iniciando diagnóstico do webhook...\n');

  // Teste 1: Requisição simples sem token
  console.log('📝 Teste 1: Requisição simples (GET) sem token');
  try {
    const response1 = await fetch(WEBHOOK_URL);
    console.log(`Status: ${response1.status} ${response1.statusText}`);
    const text1 = await response1.text();
    console.log(`Resposta: ${text1.substring(0, 200)}\n`);
  } catch (error: any) {
    console.error(`Erro: ${error.message}\n`);
  }

  // Teste 2: POST simples sem token
  console.log('📝 Teste 2: POST simples sem token');
  try {
    const response2 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' }),
    });
    console.log(`Status: ${response2.status} ${response2.statusText}`);
    const text2 = await response2.text();
    console.log(`Resposta: ${text2.substring(0, 200)}\n`);
  } catch (error: any) {
    console.error(`Erro: ${error.message}\n`);
  }

  // Teste 3: POST com token em query param
  console.log('📝 Teste 3: POST com token em query param');
  try {
    const urlWithToken = new URL(WEBHOOK_URL);
    urlWithToken.searchParams.append('token', TOKEN);
    const response3 = await fetch(urlWithToken.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data', token: TOKEN }),
    });
    console.log(`Status: ${response3.status} ${response3.statusText}`);
    const text3 = await response3.text();
    console.log(`Resposta: ${text3.substring(0, 200)}\n`);
  } catch (error: any) {
    console.error(`Erro: ${error.message}\n`);
  }

  // Teste 4: POST com token em header X-Webhook-Token
  console.log('📝 Teste 4: POST com token em header X-Webhook-Token');
  try {
    const response4 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Token': TOKEN,
      },
      body: JSON.stringify({ test: 'data' }),
    });
    console.log(`Status: ${response4.status} ${response4.statusText}`);
    const text4 = await response4.text();
    console.log(`Resposta: ${text4.substring(0, 200)}\n`);
  } catch (error: any) {
    console.error(`Erro: ${error.message}\n`);
  }

  // Teste 5: POST com token em Authorization Bearer
  console.log('📝 Teste 5: POST com token em Authorization Bearer');
  try {
    const response5 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ test: 'data' }),
    });
    console.log(`Status: ${response5.status} ${response5.statusText}`);
    const text5 = await response5.text();
    console.log(`Resposta: ${text5.substring(0, 200)}\n`);
  } catch (error: any) {
    console.error(`Erro: ${error.message}\n`);
  }

  // Teste 6: POST com payload estruturado
  console.log('📝 Teste 6: POST com payload estruturado (como solicitação real)');
  try {
    const urlWithToken = new URL(WEBHOOK_URL);
    urlWithToken.searchParams.append('token', TOKEN);
    
    const payload = {
      request_id: 'TEST-20260126-120000-ABC123',
      timestamp_envio: new Date().toISOString(),
      header: {
        loja_id: '001',
        loja_label: 'Loja São Paulo',
        solicitante_nome: 'Teste',
        solicitante_telefone: '11999999999',
        numero_chamado: 'CHM-001',
        tipo_equipe: 'Interna',
        empresa_terceira: '',
        tipo_servico: 'Manutenção',
        sistema_afetado: 'Ar Condicionado',
        descricao_geral_servico: 'Teste de webhook',
      },
      items: [
        {
          material_descricao: 'Filtro de ar',
          material_especificacao: 'Modelo XYZ',
          quantidade: 1,
          unidade: 'un',
          urgencia: 'Média',
          foto1_url: '',
          foto2_url: '',
        },
      ],
    };

    const response6 = await fetch(urlWithToken.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log(`Status: ${response6.status} ${response6.statusText}`);
    const text6 = await response6.text();
    console.log(`Resposta: ${text6.substring(0, 500)}\n`);
  } catch (error: any) {
    console.error(`Erro: ${error.message}\n`);
  }

  console.log('✅ Diagnóstico concluído!');
  console.log('\n📋 Resumo:');
  console.log('Se receber 401 em todos os testes, o problema está no Apps Script');
  console.log('Se receber 200 em alguns testes, use o método que funcionou');
  console.log('Se receber HTML em vez de JSON, a URL pode estar incorreta');
}

testWebhook().catch(console.error);
