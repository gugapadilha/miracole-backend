# 🔍 Como Encontrar o DB_HOST Completo no Render

## 📍 Método 1: Na Página do Database (Mais Fácil)

### Passo a Passo:

1. **Acesse Render Dashboard:**
   - Vá para: https://dashboard.render.com
   - Faça login

2. **Encontre seu Database:**
   - No menu lateral esquerdo, clique em **"Databases"** ou procure por `miracole-database`
   - Clique no nome do database (`miracole-database`)

3. **Procure por "Connection Info" ou "Connections":**
   - Na página do database, role para baixo
   - Procure por uma seção chamada:
     - **"Connection Info"**
     - **"Connections"**
     - **"Internal Database URL"**
     - **"Connection String"**

4. **Copie o Host:**
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

## 📍 Método 2: Na Seção "Info" ou "Overview"

1. **Na página do database**, procure por:
   - **"Info"** tab
   - **"Overview"** tab
   - **"Details"** tab

2. **Procure por:**
   - **"Host"** ou **"Hostname"**
   - **"Internal Host"**
   - **"Connection Host"**

3. **O host deve estar no formato:**
   ```
   dpg-d45p4qili9vc7385h3og-a.oregon-postgres.render.com
   ```
   (ou similar, terminando com `.oregon-postgres.render.com` ou `.oregon-postgres.render.com`)

---

## 📍 Método 3: Na Connection String (Se Disponível)

Alguns databases do Render mostram uma **Connection String** completa:

1. **Procure por:**
   - **"Connection String"**
   - **"DATABASE_URL"**
   - **"Internal Connection String"**

2. **O formato será:**
   ```
   postgres://USER:PASSWORD@HOST:PORT/DATABASE
   ```

3. **Exemplo:**
   ```
   postgres://miracole_api_user:BcLBgvZfIawWwOaw2tqpy3Wh4AHXrJmP@dpg-d45p4qili9vc7385h3og-a.oregon-postgres.render.com:5432/miracole_api
   ```

4. **Extraia o HOST:**
   - Depois do `@` e antes dos `:`
   - Neste exemplo: `dpg-d45p4qili9vc7385h3og-a.oregon-postgres.render.com`

---

## 📍 Método 4: Se Não Encontrar (Construir Manualmente)

Se você não encontrar o host completo, mas tem o prefixo:

**Você configurou:**
```
DB_HOST = dpg-d45p4qili9vc7385h3og-a
```

**Adicione o sufixo baseado na região:**

- **Oregon (mais comum):**
  ```
  dpg-d45p4qili9vc7385h3og-a.oregon-postgres.render.com
  ```

- **Frankfurt:**
  ```
  dpg-d45p4qili9vc7385h3og-a.frankfurt-postgres.render.com
  ```

- **Singapore:**
  ```
  dpg-d45p4qili9vc7385h3og-a.singapore-postgres.render.com
  ```

**Como descobrir a região:**
- No Render Dashboard, na página do database
- Procure por **"Region"** ou **"Location"**
- Ou simplesmente tente `.oregon-postgres.render.com` primeiro (mais comum)

---

## ✅ Depois de Encontrar o Host

### Atualize no Render:

1. **Vá para o serviço `miracole-backend`**
2. **Clique em "Environment"** (ou "Environment Variables")
3. **Encontre `DB_HOST`**
4. **Atualize para o host completo:**
   ```
   dpg-d45p4qili9vc7385h3og-a.oregon-postgres.render.com
   ```
   (substitua pelo host que você encontrou)

5. **Salve as alterações**

---

## 🐛 Se Ainda Não Encontrar

**Alternativa: Use o Render API ou verifique os logs**

1. **Verifique os logs do serviço:**
   - No Render Dashboard, vá para `miracole-backend`
   - Clique em **"Logs"**
   - Procure por mensagens de erro de conexão
   - Às vezes o host completo aparece nos logs

2. **Verifique o arquivo `.env` no código:**
   - Se você já fez deploy, o host pode estar no código
   - Verifique o repositório no GitHub

3. **Teste manualmente:**
   - Tente adicionar `.oregon-postgres.render.com` no final
   - Se não funcionar, tente outras regiões

---

## 📝 Checklist

- [ ] Acessei o Render Dashboard
- [ ] Encontrei o database `miracole-database`
- [ ] Encontrei a seção "Connection Info" ou similar
- [ ] Copiei o host completo (termina com `.oregon-postgres.render.com`)
- [ ] Atualizei `DB_HOST` no serviço `miracole-backend`
- [ ] Salvei as alterações

---

**Última atualização:** 2025-11-05

