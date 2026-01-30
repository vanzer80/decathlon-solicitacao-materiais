#!/usr/bin/env node

/**
 * Script de teste para o webhook do Google Apps Script
 * Uso: node webhook-test.mjs [--mock]
 */

const WEBHOOK_URL = process.env.WEBHOOK_URL || "https://script.google.com/macros/s/AKfycby9oLYJI9mJqSDOEi6kQQELU7naTfjpesQIYyfRvS8/exec";
const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN || "DECATHLON-2026";
const USE_MOCK = process.argv.includes("--mock");

// Payload de teste
const testPayload = {
  request_id: "20260130-105500-TEST01",
  timestamp_envio: new Date().toISOString(),
  header: {
    loja_id: 0,
    loja_label: "0000 - ESCRITÓRIO (SÃO PAULO/SP)",
    solicitante_nome: "Teste Técnico",
    solicitante_telefone: "(11) 99999-9999",
    numero_chamado: "CHM-2026-001",
    tipo_equipe: "Própria",
    empresa_terceira: "",
    tipo_servico: "Preventiva",
    sistema_afetado: "HVAC",
    descricao_geral_servico: "Teste de integração com webhook",
  },
  items: [
    {
      material_descricao: "Filtro de ar condicionado",
      material_especificacao: "Tamanho: 20x25cm",
      quantidade: 2,
      unidade: "un",
      urgencia: "Média",
      foto1_url: "",
      foto2_url: "",
    },
  ],
};

async function testWebhook() {
  console.log("🧪 Teste de Webhook - Decathlon Solicitação de Materiais\n");
  console.log("Configurações:");
  console.log(`  WEBHOOK_URL: ${WEBHOOK_URL}`);
  console.log(`  WEBHOOK_TOKEN: ${WEBHOOK_TOKEN}`);
  console.log(`  Modo: ${USE_MOCK ? "MOCK" : "REAL"}\n`);

  if (USE_MOCK) {
    console.log("✅ Modo MOCK ativado - simulando resposta bem-sucedida");
    return;
  }

  try {
    console.log("📤 Enviando payload...\n");
    console.log(JSON.stringify(testPayload, null, 2));
    console.log("\n⏳ Aguardando resposta...\n");

    const url = new URL(WEBHOOK_URL);
    url.searchParams.append("token", WEBHOOK_TOKEN);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Token": WEBHOOK_TOKEN,
      },
      body: JSON.stringify(testPayload),
    });

    const responseText = await response.text();

    console.log("📥 Resposta recebida:");
    console.log(`  Status HTTP: ${response.status}`);
    console.log(`  Headers:`, Object.fromEntries(response.headers.entries()));
    console.log(`  Body (primeiros 500 chars):\n${responseText.substring(0, 500)}\n`);

    // Tenta parsear como JSON
    try {
      const jsonResponse = JSON.parse(responseText);
      console.log("✅ Resposta é JSON válido:");
      console.log(JSON.stringify(jsonResponse, null, 2));

      if (jsonResponse.ok === true) {
        console.log("\n✅ SUCESSO! Webhook respondeu com ok: true");
      } else {
        console.log("\n❌ ERRO: Webhook respondeu com ok: false ou ausente");
      }
    } catch (parseError) {
      console.log("❌ ERRO: Resposta não é JSON válido");

      // Verifica se é HTML
      if (responseText.includes("<!DOCTYPE") || responseText.includes("<html")) {
        console.log("⚠️  AVISO: Resposta parece ser HTML (erro de URL ou publicação do Apps Script)");
      }
    }
  } catch (error) {
    console.error("❌ ERRO ao enviar webhook:", error.message);
    process.exit(1);
  }
}

testWebhook();
