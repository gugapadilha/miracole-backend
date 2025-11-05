# Database Configuration Guide - MiraCole Backend

## ⚠️ PROBLEMA IDENTIFICADO

Os endpoints estão retornando **404** ou **500** porque o **database não está configurado** no Render!

### Endpoints que Funcionam (sem database):
- ✅ `GET /health` - Funciona (sem database)
- ✅ `GET /api/test` - Funciona (sem database)

### Endpoints que NÃO Funcionam (precisam de database):
- ❌ `POST /api/device/code` - Precisam de database
- ❌ `POST /api/device/poll` - Precisam de database
- ❌ `POST /api/device/confirm` - Precisam de database
- ❌ `POST /api/auth/login` - Precisam de database (refresh tokens)
- ❌ `POST /api/auth/refresh` - Precisam de database
- ❌ `GET /api/me` - Precisam de database (refresh tokens)

---

## 🔧 Como Configurar o Database no Render

### Opção 1: Usar MySQL/MariaDB do Render (Recomendado)

1. **Criar Database no Render:**
   - Acesse: https://dashboard.render.com
   - Clique em **"New +"** > **"PostgreSQL"** ou **"MySQL"**
   - Escolha **"MySQL"** (se disponível) ou **"PostgreSQL"**
   - Configure:
     - **Name:** `miracole-database`
     - **Plan:** Free (ou pago)
     - **Database:** `miracole_api`

2. **Copiar Connection String:**
   - Render fornece uma connection string no formato:
     ```
     mysql://user:password@host:port/database
     ```

3. **Configurar Variáveis de Ambiente no Render:**
   
   No seu serviço do backend (`miracole-backend`), adicione estas variáveis:

   ```
   DB_HOST=your-database-host
   DB_PORT=3306
   DB_USER=your-database-user
   DB_PASS=your-database-password
   DB_NAME=miracole_api
   ```

   **OU** se Render forneceu uma connection string:

   ```
   DATABASE_URL=mysql://user:password@host:port/database
   ```

4. **Executar Migrations:**
   
   Após configurar o database, você precisa executar as migrations:

   ```bash
   # No diretório do projeto
   npm run migrate
   # OU
   node run-migrations.js
   ```

   **OU** configure no Render para executar na inicialização:
   
   No `package.json`, adicione:
   ```json
   {
     "scripts": {
       "start": "node run-migrations.js && node src/server.js"
     }
   }
   ```

---

### Opção 2: Usar Database Externo (MySQL/MariaDB)

Se você já tem um database MySQL/MariaDB:

1. **Configurar Variáveis de Ambiente no Render:**
   ```
   DB_HOST=seu-host.com
   DB_PORT=3306
   DB_USER=seu-usuario
   DB_PASS=sua-senha
   DB_NAME=miracole_api
   ```

2. **Verificar Firewall:**
   - Certifique-se de que o IP do Render pode acessar seu database
   - Adicione o IP do Render na whitelist do database

3. **Executar Migrations:**
   ```bash
   node run-migrations.js
   ```

---

## 📋 Migrations Necessárias

O backend precisa destas tabelas:

1. **users** - Usuários do sistema
2. **refresh_tokens** - Tokens de refresh
3. **devices** - Códigos de device linking

As migrations estão em: `src/migrations/`

- `001_create_users_table.js`
- `002_create_refresh_tokens_table.js`
- `003_create_devices_table.js`

---

## ✅ Verificar se Database Está Funcionando

### 1. Teste o Endpoint de Teste (sem database):
```bash
curl https://miracole-backend.onrender.com/api/test
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "API is working!",
  "timestamp": "2025-11-05T...",
  "environment": "development"
}
```

### 2. Teste o Endpoint de Device Code (com database):
```bash
curl -X POST https://miracole-backend.onrender.com/api/device/code \
  -H "Content-Type: application/json"
```

**Se database estiver configurado:**
```json
{
  "success": true,
  "device_code": "AB12CD34",
  "expires_in": 900
}
```

**Se database NÃO estiver configurado:**
```json
{
  "error": "Service Unavailable",
  "message": "Database connection failed. Please check database configuration.",
  "details": "Error: connect ECONNREFUSED..."
}
```

---

## 🐛 Troubleshooting

### Erro: "Database connection failed"

**Causa:** Database não configurado ou variáveis de ambiente incorretas.

**Solução:**
1. Verifique se todas as variáveis estão configuradas no Render
2. Verifique se o database está acessível do Render
3. Verifique se as migrations foram executadas

### Erro: "Table 'devices' doesn't exist"

**Causa:** Migrations não foram executadas.

**Solução:**
```bash
node run-migrations.js
```

### Erro: "Connection refused"

**Causa:** Firewall bloqueando ou host/port incorretos.

**Solução:**
1. Verifique o host e porta do database
2. Adicione o IP do Render na whitelist do database
3. Verifique se o database permite conexões externas

---

## 📝 Checklist de Configuração

- [ ] Database criado no Render (ou externo)
- [ ] Variáveis de ambiente configuradas no Render:
  - [ ] `DB_HOST`
  - [ ] `DB_PORT`
  - [ ] `DB_USER`
  - [ ] `DB_PASS`
  - [ ] `DB_NAME`
- [ ] Migrations executadas
- [ ] Teste `/api/test` funciona
- [ ] Teste `/api/device/code` funciona
- [ ] Verificar logs do Render para erros de database

---

## 🔗 Links Úteis

- **Render Dashboard:** https://dashboard.render.com
- **Render Docs (Databases):** https://render.com/docs/databases
- **Backend Logs:** Render Dashboard > Seu Serviço > Logs

---

**Última atualização:** 2025-11-05

