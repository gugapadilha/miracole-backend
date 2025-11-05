# 🆓 Solução GRATUITA para Executar Migrations

## ✅ Solução Implementada: Auto-Migrate no Start

**Já implementei uma solução GRATUITA!** As migrations agora executam automaticamente quando o serviço inicia.

### Como Funciona:

1. **Modifiquei o `package.json`:**
   ```json
   "start": "node run-migrations.js && node src/server.js"
   ```

2. **Quando o Render inicia seu serviço:**
   - Executa `run-migrations.js` automaticamente
   - Depois inicia o servidor
   - **TOTALMENTE GRATUITO!**

### O Que Fazer:

1. **Faça deploy do código atualizado:**
   - O Render vai fazer auto-deploy do GitHub
   - OU clique em **"Manual Deploy"** > **"Deploy latest commit"**

2. **Quando o serviço reiniciar:**
   - As migrations serão executadas automaticamente
   - Verifique os logs para confirmar

3. **Verificar nos Logs:**
   - No Render Dashboard, vá para `miracole-backend`
   - Clique em **"Logs"**
   - Procure por:
     ```
     🚀 Starting MiraCole+ database migrations...
     ✅ Database connection successful
     ✅ Migrated to batch 1:
        - 001_create_users_table.js
        - 002_create_refresh_tokens_table.js
        - 003_create_devices_table.js
     🎉 Database setup completed successfully!
     ```

---

## 🔍 Como Encontrar o DB_HOST no Render (Passo a Passo Detalhado)

### Opção 1: Na Página do Database (Mais Fácil)

1. **Render Dashboard:**
   - https://dashboard.render.com
   - Faça login

2. **Menu Lateral:**
   - Procure por **"Databases"** no menu lateral esquerdo
   - OU clique em **"All Services"** e procure por `miracole-database`

3. **Clique no Database:**
   - Clique no nome: `miracole-database`
   - Isso abre a página do database

4. **Procure por "Info" Tab:**
   - Na página do database, você verá várias **tabs** no topo
   - Procure por: **"Info"**, **"Overview"**, ou **"Details"**
   - Clique nessa tab

5. **Procure por "Connection Info":**
   - Role a página para baixo
   - Procure por uma seção chamada:
     - **"Connection Info"**
     - **"Internal Database URL"**
     - **"Connection String"**
     - **"Connections"**
     - **"Internal Connection"**

6. **Copie o Host:**
   - Você verá algo como:
     ```
     Internal Database URL:
     postgres://miracole_api_user:password@dpg-d45p4qili9vc7385h3og-a.oregon-postgres.render.com:5432/miracole_api
     ```
   - O **host** é a parte entre `@` e `:5432`:
     ```
     dpg-d45p4qili9vc7385h3og-a.oregon-postgres.render.com
     ```

---

### Opção 2: Se Não Encontrar (Método Alternativo)

**Se você já tem o prefixo do host (`dpg-d45p4qili9vc7385h3og-a`), adicione o sufixo:**

1. **Tente Oregon primeiro (mais comum):**
   ```
   DB_HOST = dpg-d45p4qili9vc7385h3og-a.oregon-postgres.render.com
   ```

2. **Se não funcionar, tente outras regiões:**
   - Frankfurt: `.frankfurt-postgres.render.com`
   - Singapore: `.singapore-postgres.render.com`

3. **Como descobrir a região:**
   - Na página do database, procure por **"Region"** ou **"Location"**
   - Ou simplesmente tente `.oregon-postgres.render.com` primeiro

---

### Opção 3: Verificar nos Logs do Render

1. **Vá para o serviço `miracole-backend`**
2. **Clique em "Logs"**
3. **Procure por erros de conexão:**
   - Se houver erro de conexão, o host completo pode aparecer nos logs
   - Procure por mensagens como:
     ```
     connect ETIMEDOUT dpg-xxxxx.oregon-postgres.render.com
     ```

---

## 📝 Checklist Completo

### 1. Encontrar DB_HOST:
- [ ] Acessei Render Dashboard
- [ ] Encontrei o database `miracole-database`
- [ ] Cliquei no database
- [ ] Procurei na tab "Info" ou "Overview"
- [ ] Encontrei "Connection Info" ou similar
- [ ] Copiei o host completo (termina com `.oregon-postgres.render.com`)

### 2. Atualizar DB_HOST no Render:
- [ ] Vá para o serviço `miracole-backend`
- [ ] Clique em "Environment" ou "Environment Variables"
- [ ] Encontrei `DB_HOST`
- [ ] Atualizei para o host completo
- [ ] Salvei as alterações

### 3. Deploy e Verificar:
- [ ] Fiz deploy do código atualizado (ou aguardei auto-deploy)
- [ ] Verifiquei os logs do Render
- [ ] Confirmo que as migrations foram executadas
- [ ] Testei os endpoints

---

## 🧪 Após Corrigir e Fazer Deploy

### Teste os Endpoints:

```bash
# 1. Device code (deve funcionar agora)
curl -X POST https://miracole-backend.onrender.com/api/device/code \
  -H "Content-Type: application/json"

# 2. Login (deve funcionar)
curl -X POST https://miracole-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "seu_usuario", "password": "sua_senha"}'
```

---

## 🆓 Soluções GRATUITAS Implementadas

1. ✅ **Auto-migrate no start** - Migrations executam automaticamente quando o serviço inicia
2. ✅ **Detecção automática de PostgreSQL** - Detecta automaticamente pelo port (5432)
3. ✅ **Suporte completo a PostgreSQL** - Código funciona com MySQL e PostgreSQL

**Você NÃO precisa pagar pelo Shell do Render!** As migrations executam automaticamente no deploy.

---

## 🐛 Troubleshooting

### Migrations não executaram?

**Verifique:**
1. O código foi atualizado no Render? (fazer deploy)
2. Os logs mostram erro? Verifique os logs do Render
3. O `DB_HOST` está correto? (com sufixo completo)

### Ainda não encontrou o DB_HOST?

**Alternativa rápida:**
1. Use o prefixo que você tem: `dpg-d45p4qili9vc7385h3og-a`
2. Adicione: `.oregon-postgres.render.com`
3. Resultado: `dpg-d45p4qili9vc7385h3og-a.oregon-postgres.render.com`
4. Teste e veja se funciona

---

**Última atualização:** 2025-11-05

