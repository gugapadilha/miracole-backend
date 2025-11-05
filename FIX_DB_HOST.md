# 🔧 CORREÇÃO URGENTE: DB_HOST Incompleto

## ⚠️ PROBLEMA IDENTIFICADO

O `DB_HOST` no Render está **INCOMPLETO**!

**Você configurou:**
```
DB_HOST = dpg-d45p4qili9vc7385h3og-a
```

**Mas deveria ser:**
```
DB_HOST = dpg-d45p4qili9vc7385h3og-a.oregon-postgres.render.com
```

O host do Render PostgreSQL **sempre termina com** `.oregon-postgres.render.com` (ou similar, dependendo da região).

---

## ✅ COMO CORRIGIR

### 1. No Render Dashboard

1. Acesse: https://dashboard.render.com
2. Vá para seu serviço `miracole-backend`
3. Clique em **"Environment"** ou **"Environment Variables"**
4. Encontre `DB_HOST`
5. **Atualize para:**
   ```
   dpg-d45p4qili9vc7385h3og-a.oregon-postgres.render.com
   ```
   (Adicione `.oregon-postgres.render.com` no final)

### 2. Verificar no Database Dashboard

Para confirmar o host correto:

1. No Render Dashboard, vá para seu **database** (`miracole-database`)
2. Procure por **"Connection Info"** ou **"Internal Database URL"**
3. Você verá algo como:
   ```
   postgres://miracole_api_user:password@dpg-d45p4qili9vc7385h3og-a.oregon-postgres.render.com:5432/miracole_api
   ```
4. O host é: `dpg-d45p4qili9vc7385h3og-a.oregon-postgres.render.com`

### 3. Verificar Todas as Variáveis

Certifique-se de que no Render estão configuradas:

```
DB_HOST=dpg-d45p4qili9vc7385h3og-a.oregon-postgres.render.com
DB_PORT=5432
DB_USER=miracole_api_user
DB_PASS=BcLBgvZfIawWwOaw2tqpy3Wh4AHXrJmP
DB_NAME=miracole_api
```

---

## 📝 Sobre o .env Local

**Você NÃO precisa atualizar o `.env` local** se:
- Você só vai testar no Render (não localmente)
- O `.env` local é apenas para desenvolvimento local

**Você PRECISA atualizar o `.env` local** se:
- Você quer executar migrations localmente
- Você quer testar localmente conectando ao database do Render

**⚠️ IMPORTANTE:** Se você atualizar o `.env` local, use o mesmo host completo:
```
DB_HOST=dpg-d45p4qili9vc7385h3og-a.oregon-postgres.render.com
DB_PORT=5432
DB_USER=miracole_api_user
DB_PASS=BcLBgvZfIawWwOaw2tqpy3Wh4AHXrJmP
DB_NAME=miracole_api
```

---

## ✅ Após Corrigir

### 1. Executar Migrations no Render

1. No Render Dashboard, vá para seu serviço `miracole-backend`
2. Clique em **"Shell"**
3. Execute:
   ```bash
   node run-migrations.js
   ```

### 2. Testar Endpoints

Após executar as migrations, teste:

```bash
# Device code (deve funcionar agora)
curl -X POST https://miracole-backend.onrender.com/api/device/code \
  -H "Content-Type: application/json"
```

**Resposta esperada:**
```json
{
  "success": true,
  "device_code": "AB12CD34",
  "expires_in": 900
}
```

---

## 🐛 Troubleshooting

### Erro: "connect ETIMEDOUT"

**Causa:** `DB_HOST` incompleto ou incorreto.

**Solução:**
1. Verifique se o host termina com `.oregon-postgres.render.com`
2. Copie o host exato do Render Dashboard > Database > Connection Info

### Erro: "Not Found" nos endpoints

**Causa:** Migrations não foram executadas OU database não está acessível.

**Solução:**
1. Execute migrations: `node run-migrations.js` no Render Shell
2. Verifique se o database está ativo no Render Dashboard

### Erro: "Service Unavailable"

**Causa:** Database não está acessível ou conexão falhou.

**Solução:**
1. Verifique se o database está ativo no Render
2. Verifique se todas as variáveis estão corretas
3. Verifique se o host está completo (com `.oregon-postgres.render.com`)

---

## 📋 Checklist

- [ ] `DB_HOST` atualizado no Render (com sufixo completo)
- [ ] Todas as variáveis configuradas no Render
- [ ] Migrations executadas no Render Shell
- [ ] Teste `/api/test` funciona
- [ ] Teste `/api/device/code` funciona
- [ ] Teste `/api/auth/login` funciona

---

**Última atualização:** 2025-11-05

