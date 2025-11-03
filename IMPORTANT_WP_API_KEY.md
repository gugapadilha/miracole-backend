# ⚠️ IMPORTANTE: WP_API_KEY no Render

## 📝 Como Funciona

A `WP_API_KEY` **NÃO está hardcoded no código**. O backend lê ela de:

```javascript
// src/config/index.js
wordpress: {
  apiKey: process.env.WP_API_KEY || ''
}
```

Isso significa que a chave vem da **variável de ambiente no Render**, não do código commitado.

## ✅ O que fazer AGORA

### 1. Atualizar Variável no Render (MANUALMENTE)

**Você precisa atualizar manualmente no dashboard do Render:**

1. Acesse: https://dashboard.render.com
2. Vá em **miracole-backend** → **Environment**
3. Procure por `WP_API_KEY`
4. **Altere o valor para:** `miracole_secret_key_123`
5. **Salve** e aguarde o redeploy

**NÃO há como fazer isso via código/Git** - é uma configuração manual do ambiente.

### 2. Commit foi feito ✅

O commit inclui:
- ✅ Plugin WordPress
- ✅ Scripts de teste
- ✅ Documentação
- ✅ Script para criar ZIP do plugin

**Mas a variável de ambiente no Render precisa ser atualizada manualmente!**

## 🔍 Verificação

Após atualizar a variável no Render e o redeploy completar:

```bash
# Teste o endpoint
curl https://miracole-backend.onrender.com/api/plans

# Ou use o script
node test-wp-with-key.js
```

Se ainda retornar `"source": "fallback"`, significa que:
- A variável pode não ter sido atualizada corretamente, OU
- O endpoint `/wp-json/pmpro/v1/levels` não existe no WordPress

## 📋 Checklist

- [x] Commit feito com plugin e documentação
- [ ] **WP_API_KEY atualizada manualmente no Render** ← FAÇA ISSO AGORA
- [ ] Redeploy do Render completado
- [ ] Teste do endpoint `/api/plans` funcionando
- [ ] Plugin instalado no WordPress

---

**Nota:** Os scripts de teste (`test-wp-with-key.js`) têm a chave hardcoded apenas para testes locais. O código de produção usa `process.env.WP_API_KEY` do Render.

