# Guia de Teste Manual - Câmera e Galeria

## Pré-requisitos
- Dispositivo mobile (Android ou iOS)
- Navegador moderno (Chrome, Safari, Firefox)
- Acesso à URL do app
- Permissão de câmera ativada no dispositivo

## Teste 1: Câmera - Foto 1

### Passos:
1. Abrir app em dispositivo mobile
2. Preencher Seção 1 (Dados Principais):
   - Loja: Selecionar qualquer loja
   - Nome: "Teste Câmera"
   - Telefone: "(11) 99999-9999"
   - Chamado: "CHM-2026-001"
3. Preencher Seção 2 (Equipe e Serviço) com valores padrão
4. Na Seção 3 (Materiais):
   - Material: "Teste Câmera"
   - Especificação: "Validação de câmera"
   - Quantidade: 1
   - Unidade: "un"
   - Urgência: "Média"
5. **Clicar botão "Câmera" em Foto 1**

### Validação:
- ✅ Deve abrir a câmera do dispositivo (NÃO galeria)
- ✅ Deve permitir tirar foto
- ✅ Após tirar foto, deve aparecer preview (miniatura 96x96px)
- ✅ Preview deve ter botão X para remover

### Resultado esperado:
```
[Camera] Acionando camera para foto1 {
  hasCapture: true,
  captureValue: "environment",
  accept: "image/*"
}
```

---

## Teste 2: Galeria - Foto 2

### Passos:
1. Na mesma solicitação, clicar botão "Galeria" em Foto 2
2. Selecionar uma foto da galeria

### Validação:
- ✅ Deve abrir seletor de galeria (NÃO câmera)
- ✅ Deve permitir selecionar foto
- ✅ Após selecionar, deve aparecer preview

### Resultado esperado:
```
[Camera] Acionando gallery para foto2 {
  hasCapture: false,
  captureValue: null,
  accept: "image/*"
}
```

---

## Teste 3: Envio com Fotos

### Passos:
1. Com as 2 fotos selecionadas, clicar "Enviar Solicitação"
2. Aguardar processamento (deve aparecer spinner)
3. Verificar tela de sucesso com Request_ID

### Validação:
- ✅ Deve enviar sem erros
- ✅ Deve exibir Request_ID (formato: YYYYMMDD-HHMMSS-6CHARS)
- ✅ Deve exibir botão "Novo Pedido"

### Verificação na Planilha:
1. Abrir Google Sheets (Solicitações de Materiais)
2. Verificar última linha adicionada
3. Confirmar que:
   - ✅ Foto1_URL contém URL válida (começa com https://)
   - ✅ Foto2_URL contém URL válida
   - ✅ URLs são acessíveis (clicar e abrir imagem)

---

## Teste 4: Envio SEM Fotos

### Passos:
1. Clicar "Novo Pedido"
2. Preencher formulário SEM selecionar fotos
3. Clicar "Enviar Solicitação"

### Validação:
- ✅ Deve enviar sem erros (fotos são opcionais)
- ✅ Deve exibir Request_ID
- ✅ Na planilha, Foto1_URL e Foto2_URL devem estar vazios

---

## Teste 5: Múltiplas Fotos (2 Materiais)

### Passos:
1. Preencher Seção 1 e 2
2. Na Seção 3, adicionar 2 materiais:
   - Material 1: Foto 1 (câmera) + Foto 2 (galeria)
   - Material 2: Foto 1 (galeria) + Foto 2 (câmera)
3. Enviar solicitação

### Validação:
- ✅ Todas as 4 fotos devem ser enviadas
- ✅ Deve exibir Request_ID
- ✅ Na planilha, deve haver 2 linhas (1 por material)
- ✅ Cada linha deve ter suas 2 fotos

---

## Teste 6: Câmera em iOS vs Android

### iOS (iPhone/iPad):
- ✅ Câmera deve abrir frontal por padrão
- ✅ Deve permitir trocar para câmera traseira
- ✅ Deve permitir trocar para galeria

### Android:
- ✅ Câmera deve abrir traseira por padrão
- ✅ Deve permitir trocar para câmera frontal
- ✅ Deve permitir trocar para galeria

---

## Teste 7: Limite de Tamanho (5MB)

### Passos:
1. Tentar enviar foto > 5MB

### Validação:
- ✅ Deve exibir erro: "Arquivo muito grande (máx 5MB)"
- ✅ Foto não deve ser enviada
- ✅ Deve permitir tentar novamente

---

## Teste 8: Permissões de Câmera

### Passos:
1. Se câmera não funcionar, verificar:
   - Permissões do navegador (Settings → Camera)
   - Permissões do dispositivo (Settings → App Permissions)
   - Reiniciar navegador

### Validação:
- ✅ Após ativar permissões, câmera deve funcionar

---

## Checklist Final

- [ ] Câmera abre corretamente (não abre galeria)
- [ ] Galeria abre corretamente (não abre câmera)
- [ ] Fotos aparecem como preview
- [ ] Fotos são enviadas para a planilha
- [ ] URLs das fotos são válidas e acessíveis
- [ ] Envio sem fotos funciona
- [ ] Múltiplas fotos funcionam
- [ ] Limite de 5MB é respeitado
- [ ] Funciona em iOS
- [ ] Funciona em Android

---

## Troubleshooting

### Câmera não abre
1. Verificar permissões do navegador
2. Verificar permissões do dispositivo
3. Abrir DevTools (F12) e verificar console
4. Procurar por mensagens `[Camera]` nos logs

### Foto não aparece como preview
1. Verificar se arquivo é imagem (jpg, png, webp)
2. Verificar tamanho (máx 5MB)
3. Verificar se há espaço em disco

### Foto não chega na planilha
1. Verificar se webhook está funcionando (botão "Diagnosticar Webhook")
2. Verificar se URL da foto é válida
3. Verificar logs do servidor

### Erro "Arquivo muito grande"
1. Comprimir imagem
2. Usar ferramenta online para reduzir tamanho
3. Tirar foto com qualidade menor

---

## Logs Esperados

Ao abrir DevTools (F12) e ir em Console, você deve ver:

```
[Camera] Acionando camera para foto1 {
  hasCapture: true,
  captureValue: "environment",
  accept: "image/*"
}
```

Se não ver estes logs, a câmera pode não estar funcionando corretamente.

---

## Suporte

Se a câmera não funcionar:
1. Verificar navegador (Chrome/Safari recomendados)
2. Verificar permissões
3. Testar em outro dispositivo
4. Verificar console para erros
5. Contatar suporte com screenshot do erro
