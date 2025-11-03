# 🔧 Troubleshooting Webhook 404 Error

## ✅ Correções Aplicadas

### 1. Middleware de Validação Melhorado

Agora aceita **ambos os formatos** de autenticação:

- **X-API-KEY header:** `X-API-KEY: miracole_secret_key_123`
- **Authorization Bearer:** `Authorization: Bearer miracole_secret_key_123`

### 2. Endpoint Alternativo Corrigido

- ❌ **Antes:** `/api/webhooks/membership` (errado)
- ✅ **Agora:** `/api/members/webhooks/membership` (correto)

### 3. Script de Teste Atualizado

Agora envia ambos os headers para garantir compatibilidade.

## 🧪 Como Testar Agora

### Opção 1: Usando cURL (Recomendado)

```bash
# Teste 1: Health endpoint
curl -i https://miracole-backend.onrender.com/health

# Teste 2: Webhook com X-API-KEY
curl -i -X POST "https://miracole-backend.onrender.com/api/members/sync" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: miracole_secret_key_123" \
  -d '{"user_id":123,"level_id":3,"email":"test@example.com","action":"membership_change"}'

# Teste 3: Webhook com Authorization Bearer
curl -i -X POST "https://miracole-backend.onrender.com/api/members/sync" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer miracole_secret_key_123" \
  -d '{"user_id":123,"level_id":3,"email":"test@example.com","action":"membership_change"}'
```

### Opção 2: Usando Script Node.js

```bash
node test-webhook-endpoint.js
```

### Opção 3: Usando PowerShell (Windows)

```powershell
# Health
Invoke-WebRequest -Uri "https://miracole-backend.onrender.com/health" -Method GET

# Webhook
$headers = @{
    "Content-Type" = "application/json"
    "X-API-KEY" = "miracole_secret_key_123"
}
$body = @{
    user_id = 123
    level_id = 3
    email = "test@example.com"
    action = "membership_change"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://miracole-backend.onrender.com/api/members/sync" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

## 🔍 Checklist de Diagnóstico

### 1. Verificar se o código foi commitado e pushado

```bash
git log --oneline -3
```

Deve mostrar:
```
✅ 2ed1a05 - feat: Add WordPress webhook endpoints for PMPro membership sync
✅ (novo commit) - fix: Improve API key validation...
```

### 2. Verificar se o Render fez deploy

- Acesse: https://dashboard.render.com
- Vá em **miracole-backend** → **Events**
- Verifique o deploy mais recente
- Deve estar **Live** ou **Active**

### 3. Verificar logs do deploy

No Render, vá em **Logs** e procure por:
- ✅ `Server running on port...` (sucesso)
- ❌ Erros de sintaxe ou `Cannot find module` (falha)

### 4. Verificar se a rota está registrada

No arquivo `src/app.js` linha 49 deve ter:

```javascript
app.use('/api/members', require('./routes/members'));
```

### 5. Testar com verbose para ver detalhes

```bash
curl -v -X POST "https://miracole-backend.onrender.com/api/members/sync" \
  -H "Content-Type: application/json" \
  -H "X-API-KEY: miracole_secret_key_123" \
  -d '{"user_id":123,"action":"test"}'
```

O `-v` mostra os headers enviados e recebidos, facilitando o debug.

## 🐛 Possíveis Problemas e Soluções

### Problema: Ainda retorna 404 após deploy

**Causas possíveis:**

1. **Deploy não completou**
   - Verifique no Render se o status é **Live**
   - Aguarde alguns minutos após o commit

2. **Cache do Render**
   - Tente fazer um **Manual Deploy** no Render
   - Vá em **Events** → **Manual Deploy** → **Deploy latest commit**

3. **Erro no código que impede o servidor de iniciar**
   - Verifique os logs do Render
   - Procure por erros de sintaxe

### Problema: Retorna 401 Unauthorized

**Causa:** API key incorreta ou não configurada

**Solução:**
1. Verifique `WP_API_KEY` no Render → **Environment**
2. Deve ser exatamente: `miracole_secret_key_123` (sem aspas, sem espaços)
3. Faça redeploy após mudar

### Problema: Retorna 500 Internal Server Error

**Causa:** Erro no processamento

**Solução:**
1. Verifique os logs do Render em tempo real
2. Procure por: `[WP_SYNC]` nos logs
3. Verifique se os campos obrigatórios estão sendo enviados

## 📝 Verificação Final

Após fazer as correções e deploy:

1. ✅ Health endpoint funciona: `/health`
2. ✅ Webhook endpoint funciona: `/api/members/sync`
3. ✅ Endpoint alternativo funciona: `/api/members/webhooks/membership`
4. ✅ Plugin WordPress consegue enviar dados
5. ✅ Logs mostram: `[WP_SYNC] Received membership update from WordPress`

## 🚀 Próximos Passos

1. **Aguardar deploy completar** (~2-5 minutos após commit)
2. **Testar com curl** usando os comandos acima
3. **Verificar logs** do Render em tempo real durante o teste
4. **Se ainda der 404**, verifique os logs do deploy para erros

---

**Última atualização:** Middleware melhorado para aceitar X-API-KEY e Authorization Bearer

