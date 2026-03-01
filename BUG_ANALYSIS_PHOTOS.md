# 🔴 Análise de Bug: Fotos Não Chegam na Planilha

## Resumo Executivo
As fotos são comprimidas e adicionadas com sucesso no frontend, mas **não chegam na planilha** porque o payload envia URLs vazias (`''`) para todas as fotos, independentemente se foram adicionadas ou não.

---

## 🔍 Raiz do Problema

### Localização
**Arquivo:** `client/src/pages/SolicitacaoForm.tsx`  
**Linhas:** 243-244  
**Função:** `handleSubmit()`

### Código Problemático
```javascript
materiais: validMateriais.map(m => ({
  descricao: m.descricao,
  especificacao: m.especificacao || '',
  quantidade: m.quantidade,
  unidade: m.unidade,
  urgencia: m.urgencia,
  foto1Url: m.foto1 ? '' : '',  // ❌ SEMPRE retorna ''
  foto2Url: m.foto2 ? '' : '',  // ❌ SEMPRE retorna ''
})),
```

### Por Que É Um Bug?
A expressão ternária `m.foto1 ? '' : ''` **sempre retorna string vazia**, independentemente do valor de `m.foto1`:
- Se `m.foto1` é truthy (existe) → retorna `''`
- Se `m.foto1` é falsy (não existe) → retorna `''`

**Resultado:** Mesmo que a foto tenha sido adicionada e comprimida, a URL nunca é enviada para o webhook.

---

## 📊 Fluxo de Dados Atual (Quebrado)

```
1. Usuário seleciona foto via galeria/câmera
   ↓
2. compressImage() comprime a imagem
   ↓
3. handleFotoChange() salva em estado: m.foto1 = File (comprimido)
   ↓
4. Usuário clica "Enviar Solicitação"
   ↓
5. handleSubmit() monta payload:
   - foto1Url: m.foto1 ? '' : '' = ''  ← BUG! Deveria ser m.foto1
   ↓
6. Payload enviado para webhook com foto1Url = ''
   ↓
7. Google Sheets recebe string vazia
   ↓
8. Nenhuma foto aparece na planilha ❌
```

---

## ✅ Solução Proposta

### Opção 1: Enviar URLs de Fotos (Recomendada)
Antes de enviar o payload, fazer upload das fotos para S3 e obter URLs públicas:

```javascript
// 1. Upload de fotos para S3
const foto1Url = m.foto1 ? await uploadFotoToS3(m.foto1) : '';
const foto2Url = m.foto2 ? await uploadFotoToS3(m.foto2) : '';

// 2. Montar payload com URLs
materiais: validMateriais.map(m => ({
  // ...
  foto1Url: m.foto1 ? await uploadFotoToS3(m.foto1) : '',
  foto2Url: m.foto2 ? await uploadFotoToS3(m.foto2) : '',
})),
```

### Opção 2: Enviar Arquivos Comprimidos (Alternativa)
Se o webhook suporta multipart/form-data, enviar os arquivos diretamente.

---

## 🛠️ Plano de Correção

### Fase 1: Entender o Fluxo Atual
- [x] Identificar onde as fotos são armazenadas (estado `m.foto1`, `m.foto2`)
- [x] Verificar se são File objects ou URLs
- [x] Confirmar que compressImage() retorna Blob/File

### Fase 2: Implementar Upload de Fotos
- [ ] Criar função `uploadFotoToS3(file: File): Promise<string>` que:
  - Comprime a foto (já feito em handleFotoChange)
  - Faz upload para S3
  - Retorna URL pública
- [ ] Integrar no handleSubmit() antes de enviar payload

### Fase 3: Corrigir Payload
- [ ] Atualizar mapeamento de materiais para incluir URLs reais
- [ ] Testar que URLs são enviadas corretamente

### Fase 4: Validar
- [ ] Enviar solicitação com fotos
- [ ] Verificar que URLs aparecem na planilha
- [ ] Confirmar que fotos são acessíveis via URLs

---

## 📝 Impacto

| Aspecto | Impacto |
|--------|--------|
| **Severidade** | 🔴 CRÍTICO |
| **Usuários Afetados** | Todos que tentam enviar fotos |
| **Funcionalidades Quebradas** | Upload de fotos via galeria/câmera |
| **Dados Perdidos** | URLs das fotos não chegam no Google Sheets |
| **Risco de Regressão** | Baixo (mudança isolada) |

---

## 🔧 Próximas Ações

1. Implementar upload de fotos para S3 no handleSubmit()
2. Corrigir mapeamento de foto1Url e foto2Url
3. Testar end-to-end com fotos
4. Validar que URLs aparecem na planilha
