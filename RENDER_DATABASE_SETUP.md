# Render Database Setup - Guia Rápido

## ⚠️ PROBLEMA IDENTIFICADO

No Render, o `DB_HOST` está configurado como **`localhost`** - isso está **ERRADO**!

Quando você cria um database no Render, ele fornece um **hostname específico** que deve ser usado no `DB_HOST`.

---

## 🔧 Como Configurar Corretamente

### Passo 1: Criar Database no Render

1. Acesse: https://dashboard.render.com
2. Clique em **"New +"** > **"PostgreSQL"** ou procure por **"MySQL"**
3. Se MySQL não estiver disponível, use **PostgreSQL** (o código funciona com ambos)
4. Configure:
   - **Name:** `miracole-database`
   - **Database:** `miracole_api`
   - **Plan:** Free (ou pago)

### Passo 2: Copiar Connection Details

Após criar o database, o Render fornece:

- **Host:** `dpg-xxxxx-a.oregon-postgres.render.com` (exemplo)
- **Port:** `5432` (PostgreSQL) ou `3306` (MySQL)
- **Database:** `miracole_api`
- **User:** `miracole_database_user`
- **Password:** `xxxxx` (gerado automaticamente)

**⚠️ IMPORTANTE:** O host NÃO é `localhost`! É algo como `dpg-xxxxx-a.oregon-postgres.render.com`

### Passo 3: Atualizar Variáveis de Ambiente no Render

No seu serviço `miracole-backend`, atualize estas variáveis:

#### Para PostgreSQL (Recomendado no Render):
```
DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
DB_PORT=5432
DB_USER=miracole_database_user
DB_PASS=senha_gerada_automaticamente
DB_NAME=miracole_api
```

#### Para MySQL (se disponível):
```
DB_HOST=mysql-xxxxx.mysql.oregon.render.com
DB_PORT=3306
DB_USER=miracole_database_user
DB_PASS=senha_gerada_automaticamente
DB_NAME=miracole_api
```

**⚠️ NÃO use `localhost` no Render!**

### Passo 4: Executar Migrations

#### Opção 1: Automático no Deploy (Recomendado)

Adicione ao `package.json`:

```json
{
  "scripts": {
    "start": "node run-migrations.js && node src/server.js",
    "migrate": "node run-migrations.js"
  }
}
```

Isso executará as migrations automaticamente quando o serviço iniciar.

#### Opção 2: Manual via Render Shell

1. No Render Dashboard, vá para seu serviço
2. Clique em **"Shell"**
3. Execute:
   ```bash
   node run-migrations.js
   ```

#### Opção 3: Localmente (se tiver acesso ao database)

Se você conseguir acessar o database do Render localmente:

```bash
# Configure .env local com as credenciais do Render
DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
DB_PORT=5432
DB_USER=miracole_database_user
DB_PASS=senha_do_render
DB_NAME=miracole_api

# Execute migrations
node run-migrations.js
```

---

## ✅ Verificar se Está Funcionando

### 1. Teste o Endpoint de Teste (sem database):
```bash
curl https://miracole-backend.onrender.com/api/test
```

### 2. Teste o Endpoint de Device Code (com database):
```bash
curl -X POST https://miracole-backend.onrender.com/api/device/code \
  -H "Content-Type: application/json"
```

**Se funcionar:**
```json
{
  "success": true,
  "device_code": "AB12CD34",
  "expires_in": 900
}
```

**Se NÃO funcionar (database ainda não configurado):**
```json
{
  "error": "Service Unavailable",
  "message": "Database connection failed. Please check database configuration.",
  "details": "Error: connect ECONNREFUSED..."
}
```

---

## 🔍 Como Encontrar o Host do Database

1. No Render Dashboard, vá para seu database
2. Procure por **"Connection Info"** ou **"Internal Database URL"**
3. O host geralmente está no formato:
   - PostgreSQL: `dpg-xxxxx-a.oregon-postgres.render.com`
   - MySQL: `mysql-xxxxx.mysql.oregon.render.com`

**Exemplo de Connection String:**
```
postgres://user:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/miracole_api
```

**De onde extrair:**
- **DB_HOST:** `dpg-xxxxx-a.oregon-postgres.render.com`
- **DB_PORT:** `5432`
- **DB_USER:** `user`
- **DB_PASS:** `password`
- **DB_NAME:** `miracole_api`

---

## 🐛 Troubleshooting

### Erro: "Database connection failed"

**Causa:** `DB_HOST` está como `localhost` ou host incorreto.

**Solução:**
1. Verifique se o database foi criado no Render
2. Copie o host correto do Render Dashboard
3. Atualize `DB_HOST` no Render Environment Variables

### Erro: "connect ECONNREFUSED"

**Causa:** Host ou porta incorretos.

**Solução:**
1. Verifique se está usando o host do Render (não localhost)
2. Verifique a porta (5432 para PostgreSQL, 3306 para MySQL)

### Erro: "Access denied"

**Causa:** Usuário ou senha incorretos.

**Solução:**
1. Copie as credenciais exatas do Render Dashboard
2. Verifique se não há espaços extras nas variáveis

---

## 📝 Checklist

- [ ] Database criado no Render
- [ ] Host copiado do Render (não localhost!)
- [ ] Variáveis de ambiente atualizadas no Render:
  - [ ] `DB_HOST` (host do Render, não localhost)
  - [ ] `DB_PORT` (5432 para PostgreSQL, 3306 para MySQL)
  - [ ] `DB_USER`
  - [ ] `DB_PASS`
  - [ ] `DB_NAME`
- [ ] Migrations executadas (automático ou manual)
- [ ] Teste `/api/test` funciona
- [ ] Teste `/api/device/code` funciona

---

## 🔗 Links Úteis

- **Render Dashboard:** https://dashboard.render.com
- **Render Docs (Databases):** https://render.com/docs/databases
- **Backend Logs:** Render Dashboard > Seu Serviço > Logs

---

**Última atualização:** 2025-11-05

