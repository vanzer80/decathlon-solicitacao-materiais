# Runbook de Troubleshooting - MOPAR Solicitação de Materiais

**Para**: Operadores, DevOps, Suporte Técnico | **Versão**: 1.0 | **Última atualização**: Janeiro 2026

---

## 🔍 Diagnóstico Rápido

### Checklist Inicial (5 minutos)

```
[ ] App está online? (tente acessar URL)
[ ] Servidor está respondendo? (verifique status no Management UI)
[ ] Database está conectado? (verifique logs)
[ ] Google Sheets está acessível? (tente abrir manualmente)
[ ] Apps Script está publicado? (verifique permissões)
[ ] S3 está acessível? (tente fazer upload teste)
```

### Verificar Logs

**Frontend**:
```bash
# Abrir DevTools no navegador (F12)
# Aba "Console" - procure por erros vermelhos
# Aba "Network" - procure por requisições falhadas (status 5xx)
```

**Backend**:
```bash
# SSH no servidor
tail -f .manus-logs/devserver.log
tail -f .manus-logs/browserConsole.log
tail -f .manus-logs/networkRequests.log
```

---

## 🐛 Problemas Comuns e Soluções

### 1. "Webhook retornou HTML (status 401, content-type: text/html)"

**Sintoma**: Ao enviar solicitação, erro: "Webhook retornou HTML — verifique URL /exec e publicação do Apps Script"

**Causa Raiz**:
- Apps Script não está publicado como Web App público
- URL do webhook está incorreta
- Apps Script foi reimplantado sem atualizar URL

**Diagnóstico**:
1. Clique no botão **"Diagnosticar Webhook"** no app (aparece no erro)
2. Verifique resposta:
   - Se retorna HTML com `<!DOCTYPE`, problema é permissão
   - Se retorna `{ "ok": true }`, webhook está OK

**Solução Passo a Passo**:

1. **Abrir Google Apps Script**:
   - Ir para https://script.google.com
   - Selecionar projeto MOPAR

2. **Verificar Publicação**:
   - Clicar em **"Deploy"** (botão azul)
   - Se houver deployment antigo, clicar em **"Manage deployments"**
   - Deletar deployment antigo
   - Clicar em **"New deployment"**

3. **Configurar Novo Deployment**:
   - Type: **"Web app"**
   - Execute as: Sua conta Google
   - Who has access: **"Anyone"** (CRÍTICO - não é "Me")
   - Clicar **"Deploy"**

4. **Copiar URL**:
   - Copiar URL gerada (algo como `https://script.google.com/macros/s/AKfycby.../exec`)

5. **Atualizar Variável de Ambiente**:
   - No Management UI → Settings → Secrets
   - Editar `WEBHOOK_URL` com nova URL
   - Salvar

6. **Testar**:
   - Clicar novamente em "Diagnosticar Webhook"
   - Deve retornar `{ "ok": true }`

**Verificação Final**:
- Enviar solicitação teste
- Verificar se linha aparece no Google Sheets
- Verificar se Request_ID foi gerado

---

### 2. "401 Unauthorized" no Webhook

**Sintoma**: Webhook retorna status 401

**Causa Raiz**:
- Token webhook incorreto
- Token não está sendo enviado
- Apps Script não está validando token corretamente

**Diagnóstico**:
1. Verificar `WEBHOOK_TOKEN` em variáveis de ambiente
2. Usar "Diagnosticar Webhook" para ver headers enviados
3. Verificar logs do Apps Script

**Solução**:

1. **Verificar Token**:
   ```bash
   # No servidor
   echo $WEBHOOK_TOKEN
   # Deve retornar: DECATHLON-2026
   ```

2. **Verificar Envio**:
   - Abrir DevTools (F12) → Network
   - Enviar solicitação
   - Procurar requisição para webhook
   - Verificar headers:
     - Query param: `?token=DECATHLON-2026`
     - Header: `X-Webhook-Token: DECATHLON-2026`

3. **Verificar Apps Script**:
   - Abrir Apps Script
   - Procurar função `doPost(e)`
   - Verificar se está validando token:
     ```javascript
     const token = e.parameter.token || e.postData.headers['X-Webhook-Token'];
     if (token !== 'DECATHLON-2026') {
       return ContentService.createTextOutput('Unauthorized').setMimeType(ContentService.MimeType.TEXT);
     }
     ```

4. **Se Tudo OK, Reiniciar**:
   ```bash
   # Reiniciar servidor
   pnpm dev
   # Ou via Management UI: Restart Server
   ```

---

### 3. "Upload URL não abre" ou "Foto não aparece"

**Sintoma**: Foto foi enviada, mas URL S3 não abre ou retorna 403

**Causa Raiz**:
- Arquivo não foi salvo no S3
- URL expirou
- Permissões S3 incorretas
- Arquivo foi deletado

**Diagnóstico**:
1. Verificar se URL aparece no Google Sheets
2. Clicar na URL - deve abrir imagem
3. Se retorna 403, problema é permissão

**Solução**:

1. **Verificar S3 Bucket**:
   ```bash
   # AWS CLI
   aws s3 ls s3://seu-bucket/ --recursive
   # Procurar arquivo com padrão: {userId}-files/{fileName}-{randomSuffix}.jpg
   ```

2. **Verificar Permissões**:
   - Bucket deve ser público (ou ter política de leitura pública)
   - Arquivo deve ter ACL pública

3. **Reenviar Foto**:
   - Solicitar técnico reenviar solicitação com foto
   - Verificar se nova URL funciona

4. **Se Persistir**:
   - Verificar logs: `.manus-logs/networkRequests.log`
   - Procurar por requisições para S3
   - Verificar status HTTP

---

### 4. "Erro de rede" ou "Timeout"

**Sintoma**: Ao enviar, erro: "Erro ao enviar solicitação: Network timeout"

**Causa Raiz**:
- Conexão internet lenta/instável
- Servidor não respondendo
- Firewall bloqueando requisição
- Arquivo de foto muito grande

**Diagnóstico**:
1. Verificar conexão internet (ping google.com)
2. Verificar se servidor está respondendo
3. Verificar tamanho da foto

**Solução**:

1. **Cliente**:
   - Tentar em conexão WiFi melhor
   - Fechar outros apps/abas
   - Recarregar página (Ctrl+Shift+R)
   - Tentar novamente

2. **Servidor**:
   ```bash
   # Verificar se servidor está rodando
   curl http://localhost:3000
   # Deve retornar HTML da página
   
   # Verificar logs
   tail -f .manus-logs/devserver.log
   ```

3. **Foto Grande**:
   - Máximo 5MB por foto
   - Se foto > 5MB, app deve avisar
   - Comprimir foto antes de enviar

4. **Firewall**:
   - Verificar se porta 3000 está aberta
   - Verificar se S3 está acessível
   - Verificar se Google APIs estão acessíveis

---

### 5. "Nenhuma loja encontrada" ou Dropdown Vazio

**Sintoma**: Campo "Loja / Cliente" não mostra lista de lojas

**Causa Raiz**:
- Arquivo `client/public/lojas.json` não carregou
- JSON está corrompido
- Navegador cacheou versão antiga

**Diagnóstico**:
1. Abrir DevTools (F12) → Network
2. Procurar requisição para `lojas.json`
3. Verificar status (deve ser 200)
4. Verificar resposta (deve ser JSON válido)

**Solução**:

1. **Verificar Arquivo**:
   ```bash
   # No servidor
   cat client/public/lojas.json | head -20
   # Deve retornar JSON com array de lojas
   ```

2. **Validar JSON**:
   ```bash
   # Verificar se JSON é válido
   cat client/public/lojas.json | jq . > /dev/null
   # Se retornar erro, JSON está corrompido
   ```

3. **Limpar Cache**:
   - Abrir DevTools (F12)
   - Clicar direito em reload → "Empty cache and hard reload"
   - Ou: Ctrl+Shift+R

4. **Recarregar Arquivo**:
   - Se arquivo foi deletado, restaurar do backup
   - Se corrompido, regenerar do Excel original

---

### 6. "Erro ao fazer upload de foto: Buffer is not defined"

**Sintoma**: Ao tentar enviar foto, erro JavaScript: "Buffer is not defined"

**Causa Raiz**:
- Código legado usando Node.js Buffer no frontend
- Problema foi corrigido em versão recente

**Diagnóstico**:
- Verificar versão do app
- Verificar se está usando versão mais recente

**Solução**:
- Atualizar para versão mais recente
- Limpar cache do navegador (Ctrl+Shift+R)
- Reenviar foto

---

### 7. "Erro ao enviar solicitação: [validação]"

**Sintoma**: Erro com lista de erros de validação (ex: "Loja é obrigatória")

**Causa Raiz**:
- Campo obrigatório não preenchido
- Valor inválido para campo

**Diagnóstico**:
- Ler mensagem de erro
- Identificar qual campo está faltando

**Solução**:
- Preencher campo indicado
- Verificar formato (ex: telefone com DDD)
- Reenviar

---

### 8. "Histórico vazio" ou "Nenhuma solicitação encontrada"

**Sintoma**: Página de histórico não mostra solicitações anteriores

**Causa Raiz**:
- Nenhuma solicitação foi enviada ainda
- Filtros estão muito restritivos
- Database não está conectado

**Diagnóstico**:
1. Verificar se alguma solicitação foi enviada
2. Verificar filtros (data, loja)
3. Verificar logs do servidor

**Solução**:

1. **Sem Filtros**:
   - Limpar todos os filtros
   - Clicar em "Pesquisar"

2. **Testar Database**:
   ```bash
   # Verificar conexão
   mysql -u user -p -h host database
   # Ou via Management UI → Database panel
   ```

3. **Enviar Solicitação Teste**:
   - Enviar nova solicitação
   - Ir para histórico
   - Deve aparecer

---

## 🔧 Operações Comuns

### Reiniciar Servidor

```bash
# Via shell
cd /home/ubuntu/decathlon-solicitacao-materiais
pnpm dev

# Ou via Management UI
# Clicar em "Restart Server"
```

### Limpar Cache do Navegador

```
F12 → Application → Storage → Clear Site Data
Ou: Ctrl+Shift+Delete
```

### Verificar Status do Webhook

1. Abrir app
2. Clicar no erro (se houver)
3. Botão **"Diagnosticar Webhook"**
4. Aguardar resultado
5. Verificar status, content-type, body snippet

### Exportar Logs

```bash
# Copiar logs para análise
cp .manus-logs/devserver.log ~/devserver-$(date +%Y%m%d).log
cp .manus-logs/browserConsole.log ~/browser-$(date +%Y%m%d).log
```

### Fazer Backup da Planilha

1. Abrir Google Sheets
2. File → Download → CSV/Excel
3. Salvar localmente

---

## 📊 Monitoramento

### Métricas Importantes

| Métrica | Alvo | Como Verificar |
|---------|------|---|
| Uptime | > 99.5% | Management UI → Dashboard |
| Tempo Resposta | < 2s | DevTools → Network |
| Taxa Erro | < 1% | Logs do servidor |
| Upload Sucesso | > 95% | Google Sheets (contar linhas) |

### Alertas Críticos

- [ ] Servidor offline (status 5xx)
- [ ] Webhook retornando 401/403
- [ ] S3 inacessível
- [ ] Database desconectado
- [ ] Taxa erro > 5%

---

## 📞 Escalação

### Nível 1 - Suporte Técnico
- Verificar checklist inicial
- Tentar soluções básicas
- Coletar logs

### Nível 2 - DevOps
- Reiniciar servidor
- Verificar variáveis de ambiente
- Analisar logs detalhados

### Nível 3 - Engenharia
- Debugar código
- Analisar database
- Contatar Google/AWS se necessário

---

## 📝 Template de Ticket de Suporte

```
Título: [Problema] Descrição breve

Descrição:
- O que aconteceu?
- Quando começou?
- Quantos usuários afetados?

Passos para Reproduzir:
1. ...
2. ...

Erro Exato:
[Copiar mensagem de erro]

Logs:
[Copiar relevante dos logs]

Tentativas:
- [ ] Recarregar página
- [ ] Limpar cache
- [ ] Tentar em outro navegador
- [ ] Diagnosticar webhook

Ambiente:
- URL: https://...
- Navegador: Chrome/Safari/Firefox
- Dispositivo: Mobile/Desktop
```

---

**Última atualização**: 30 de janeiro de 2026  
**Mantido por**: Equipe DevOps MOPAR
