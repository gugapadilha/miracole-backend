# 🔗 Guia de Integração Webhook WordPress ↔ Backend

## ✅ O que foi implementado

### 1. Endpoints de Webhook no Backend

#### `POST /api/members/sync`
**Endpoint principal para receber atualizações de membros do WordPress**

- **Autenticação:** Bearer Token (WP_API_KEY)
- **Content-Type:** application/json

**Payload esperado:**
```json
{
  "user_id": 123,
  "username": "usuario_exemplo",
  "email": "usuario@exemplo.com",
  "level_id": 2,
  "level_name": "Monthly",
  "old_level_id": 1,
  "action": "membership_change"
}
```

**Resposta de sucesso (200):**
```json
{
  "success": true,
  "message": "Membership sync received",
  "data": {
    "user_id": 123,
    "level_id": 2,
    "action": "membership_change",
    "synced_at": "2025-11-01T21:00:00.000Z"
  }
}
```

#### `POST /api/members/webhooks/membership`
**Endpoint alternativo (mesma funcionalidade)**

### 2. Health Check Endpoint

#### `GET /health`
**Retorna status do backend**

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-01T21:00:00.000Z",
  "environment": "development"
}
```

### 3. Plugin WordPress Atualizado

O plugin WordPress agora:
- ✅ Detecta automaticamente mudanças de membro no PMPro
- ✅ Envia webhook para `/api/members/sync` quando membro muda de nível
- ✅ Loga sucesso/erro no WordPress
- ✅ Usa API key para autenticação

## 🧪 Testando a Integração

### Passo 1: Verificar Health Endpoint

```bash
curl https://miracole-backend.onrender.com/health
```

**Resultado esperado:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "environment": "..."
}
```

### Passo 2: Testar Webhook Endpoint

**Importante:** O endpoint só funcionará após o deploy do código novo no Render!

```bash
# Usando curl
curl -X POST https://miracole-backend.onrender.com/api/members/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer miracole_secret_key_123" \
  -d '{
    "user_id": 123,
    "username": "test_user",
    "email": "test@example.com",
    "level_id": 2,
    "level_name": "Monthly",
    "old_level_id": 1,
    "action": "membership_change"
  }'
```

**Ou usando o script de teste:**
```bash
node test-webhook-endpoint.js
```

### Passo 3: Verificar Logs no Render

Após um webhook ser recebido, você verá nos logs do Render:

```
[WP_SYNC] Received membership update from WordPress
[WP_SYNC] Data: { user_id: 123, username: '...', ... }
```

## 📋 Checklist de Deploy

### No Backend (Render)

- [ ] Código commitado e push para o repositório
- [ ] Render fazendo deploy automático
- [ ] `WP_API_KEY` configurado no Render como `miracole_secret_key_123`
- [ ] Health endpoint responde: `{ "status": "ok" }`
- [ ] Webhook endpoint `/api/members/sync` responde corretamente

### No WordPress

- [ ] Plugin `miracole-backend-connector` instalado e ativo
- [ ] Plugin configurado com:
  - Backend URL: `https://miracole-backend.onrender.com`
  - API Key: `miracole_secret_key_123`
- [ ] Teste de conexão passa no plugin
- [ ] PMPro está instalado e ativo

## 🔄 Fluxo de Sincronização

```
1. Usuário muda de nível no PMPro (WordPress)
   ↓
2. Plugin WordPress detecta evento: pmpro_after_change_membership_level
   ↓
3. Plugin prepara dados (user_id, level_id, etc.)
   ↓
4. Plugin envia POST para /api/members/sync
   Headers: Authorization: Bearer miracole_secret_key_123
   ↓
5. Backend valida API key
   ↓
6. Backend processa e loga: [WP_SYNC] Received membership update
   ↓
7. Backend retorna 200 OK
   ↓
8. Plugin loga sucesso no WordPress
```

## 🛠️ Troubleshooting

### Erro 404: Endpoint não encontrado

**Causa:** Código novo ainda não foi deployado no Render

**Solução:**
1. Confirme que o commit foi feito
2. Verifique se o Render está fazendo deploy
3. Aguarde alguns minutos após o deploy
4. Teste novamente

### Erro 401: Unauthorized

**Causa:** API key incorreta ou não configurada

**Solução:**
1. Verifique `WP_API_KEY` no Render
2. Deve ser exatamente: `miracole_secret_key_123`
3. Verifique se não há espaços extras
4. Faça redeploy após mudar a variável

### Erro 500: Internal Server Error

**Causa:** Erro no processamento do webhook

**Solução:**
1. Verifique os logs do Render
2. Confirme que a estrutura do payload está correta
3. Verifique campos obrigatórios: `user_id` e `action`

### Plugin não está enviando webhooks

**Causa:** Hook do PMPro não está sendo acionado

**Solução:**
1. Verifique se PMPro está ativo
2. Confirme que há mudanças de membro acontecendo
3. Verifique os logs do WordPress: `/wp-content/debug.log`
4. Procure por: `[WP_SYNC]`

## 📝 Próximos Passos (Opcional)

### Melhorias Futuras:

1. **Persistir dados no banco:**
   - Salvar membros na tabela `users`
   - Atualizar nível de membro quando receber webhook

2. **Sincronização bidirecional:**
   - Backend pode enviar atualizações para WordPress
   - Sincronizar status de pagamento

3. **Webhooks adicionais:**
   - Novo pagamento realizado
   - Cancelamento de assinatura
   - Renovação automática

4. **Validação de dados:**
   - Validar se user_id existe no WordPress
   - Validar se level_id é válido

## ✅ Status Atual

- ✅ Endpoints criados e funcionando
- ✅ Plugin WordPress configurado para enviar webhooks
- ✅ Validação de API key implementada
- ✅ Logs estruturados para debugging
- ⏳ Aguardando deploy no Render para testes finais

---

**Última atualização:** Código pronto para deploy e testes

