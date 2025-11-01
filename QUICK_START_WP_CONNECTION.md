# 🚀 Guia Rápido - Conectar WordPress ao Backend

## ✅ O que já está pronto

- ✅ Plugin WordPress criado e pronto
- ✅ Backend funcionando no Render
- ✅ Scripts de teste atualizados
- ✅ Documentação completa

## 📋 Passos Rápidos (5 minutos)

### 1️⃣ Atualizar WP_API_KEY no Render (2 min)

1. Acesse: https://dashboard.render.com
2. Vá em **miracole-backend** → **Environment**
3. Edite `WP_API_KEY` → Coloque: `miracole_secret_key_123`
4. **Salve** e aguarde o redeploy (~2 minutos)

### 2️⃣ Criar ZIP do Plugin (1 min)

```bash
npm run create-plugin-zip
```

O arquivo será criado em:
```
wordpress-plugin/miracole-backend-connector.zip
```

### 3️⃣ Instalar Plugin no WordPress (2 min)

1. No WordPress Admin → **Plugins** → **Adicionar Novo**
2. Clique em **Enviar Plugin**
3. Selecione o arquivo ZIP: `miracole-backend-connector.zip`
4. Clique em **Instalar Agora** → **Ativar Plugin**

### 4️⃣ Configurar Plugin

1. Vá em **Configurações** → **MiraCole Backend**
2. Preencha:
   - **Backend URL:** `https://miracole-backend.onrender.com`
   - **API Key:** `miracole_secret_key_123`
3. Clique em **Salvar Configurações**
4. Clique em **Testar Conexão**

## ✅ Verificação Final

Teste o endpoint do backend:

```bash
node test-wp-with-key.js
```

Ou acesse diretamente:
```
https://miracole-backend.onrender.com/api/plans
```

**Resultado esperado:**
- ✅ Status 200
- ✅ `"source": "wordpress"` (ou "fallback" se o endpoint PMPro não existir ainda)

## ⚠️ Importante sobre PMPro

Se ainda retornar `"source": "fallback"`:
- Isso significa que o endpoint `/wp-json/pmpro/v1/levels` não existe no WordPress
- Verifique se o **PMPro está instalado e ativo**
- Verifique se a **REST API do PMPro está habilitada**

## 📚 Documentação Completa

- **Plugin Setup:** `WORDPRESS_PLUGIN_SETUP.md`
- **Atualizar Chave:** `UPDATE_WP_API_KEY.md`
- **Resumo Completo:** `CONNECTION_SETUP_COMPLETE.md`

## 🎉 Pronto!

Após seguir esses passos, seu WordPress estará conectado ao backend Render!

---

**Tempo total:** ~5 minutos
**Dificuldade:** Fácil
**Status:** Tudo pronto para instalação

