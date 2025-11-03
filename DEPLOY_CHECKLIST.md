# ✅ Checklist de Deploy - Webhook Endpoints

## 🔍 Problema Identificado

O código estava correto **localmente**, mas os commits **não foram pushados** para o repositório remoto. O Render só faz deploy de commits que estão no GitHub/GitLab.

**Status:** ✅ Commits agora foram pushados!

## 📋 Checklist Completo

### 1. ✅ Código Local

- [x] `src/routes/members.js` existe e está correto
- [x] `src/app.js` tem `app.use('/api/members', require('./routes/members'))`
- [x] Commits foram feitos localmente

### 2. ✅ Push para Repositório

- [x] Commits pushados para `origin/main`
- [x] Verificar com: `git log --oneline -5`

### 3. ⏳ Deploy no Render

- [ ] Verificar se Render detectou o push (2-5 minutos)
- [ ] Render Dashboard → **miracole-backend** → **Events**
- [ ] Último deploy deve estar **Live** ou **Deploying**

### 4. ⏳ Verificar Logs do Deploy

No Render, vá em **Logs** e procure por:

✅ **Sucesso:**
```
Server running on port 4000
Listening on port 4000
```

❌ **Erro:**
```
Cannot find module './routes/members'
SyntaxError: ...
```

### 5. ⏳ Testar Endpoints

**Após deploy completar**, teste:

**Opção 1: PowerShell Script (Windows)**
```powershell
.\test-webhook-powershell.ps1
```

**Opção 2: Node.js Script**
```bash
node test-webhook-endpoint.js
```

**Opção 3: PowerShell Manual**
```powershell
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

## 🧪 Resultado Esperado

Após o deploy completar:

### Health Endpoint
```bash
curl https://miracole-backend.onrender.com/health
```

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "environment": "development"
}
```

### Webhook Endpoint
```powershell
# Usando o script PowerShell
.\test-webhook-powershell.ps1
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Membership sync received",
  "payload": {
    "user_id": 123,
    "level_id": 3,
    ...
  }
}
```

## 🐛 Se Ainda Retornar 404

### 1. Verificar se o Deploy Completou

- Render Dashboard → **Events** → Último deploy
- Deve estar **Live** (não "Failed" ou "Deploying")

### 2. Verificar Logs do Servidor

- Render Dashboard → **Logs** (Live Logs)
- Procure por erros ao iniciar o servidor
- Procure por: `Server running on port...`

### 3. Verificar se a Rota Está Registrada

No arquivo `src/app.js` linha 49 deve ter:
```javascript
app.use('/api/members', require('./routes/members'));
```

### 4. Forçar Redeploy Manual

- Render Dashboard → **Events** → **Manual Deploy**
- Selecione **Deploy latest commit**

### 5. Verificar Variáveis de Ambiente

- Render Dashboard → **Environment**
- Confirme que `WP_API_KEY` está configurada
- Valor: `miracole_secret_key_123` (sem aspas)

## 📝 Arquivos de Teste Criados

1. ✅ `test-webhook-powershell.ps1` - Script PowerShell para Windows
2. ✅ `test-webhook-endpoint.js` - Script Node.js
3. ✅ `DEPLOY_CHECKLIST.md` - Este arquivo

## ✅ Próximos Passos

1. **Aguardar deploy completar** (~2-5 minutos após push)
2. **Verificar status** no Render Dashboard
3. **Testar com PowerShell script**: `.\test-webhook-powershell.ps1`
4. **Verificar logs** do Render durante o teste
5. **Se funcionar**, instalar plugin WordPress e configurar

---

**Última atualização:** Commits pushados para origin/main
**Status:** Aguardando deploy automático no Render

