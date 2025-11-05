# Endpoint Testing Guide - MiraCole Backend

## ⚠️ IMPORTANT: JWT Authentication Plugin

**O plugin "JWT Authentication for WP-API" NÃO bloqueia o backend Node.js!**

- O backend Node.js está hospedado no **Render** (servidor separado)
- O JWT do WordPress só afeta endpoints REST do **WordPress** (`/wp-json/*`)
- Os endpoints do backend são: `https://miracole-backend.onrender.com/api/*`

**Você NÃO precisa desativar o JWT para testar o backend!**

---

## 📋 Status de Implementação

### ✅ Backend Node.js (Render) - IMPLEMENTADO

Todos os endpoints estão implementados no backend Node.js:

#### Autenticação (`/api/auth/*`)
- ✅ `POST /api/auth/login` - Login com credenciais WordPress
- ✅ `POST /api/auth/refresh` - Renovar access token
- ✅ `POST /api/auth/logout` - Logout e revogar refresh token

#### Device Linking (`/api/device/*`)
- ✅ `POST /api/device/code` - Gerar código de 8 caracteres (rate limit: 7/hora)
- ✅ `POST /api/device/poll` - Verificar status do código
- ✅ `GET /api/device/poll?code=XXXX` - Verificar status (GET)
- ✅ `POST /api/device/confirm` - Confirmar código (requer auth)

#### User Info (`/api/me`)
- ✅ `GET /api/me` - Obter informações do usuário + subscription status
- ✅ `GET /api/me/profile` - Perfil detalhado
- ✅ `PUT /api/me/profile` - Atualizar perfil
- ✅ `GET /api/me/membership` - Informações de membership

#### Outros Endpoints
- ✅ `GET /api/plans` - Listar planos PMPro
- ✅ `GET /health` - Health check

---

### ✅ WordPress Plugins - IMPLEMENTADO

#### 1. MiraCole REST Monitor
- ✅ Plugin ativo
- ✅ Rota `/wp-json/pmpro/v1/levels` (fallback se PMPro não tiver)

#### 2. MiraCole Backend Connector
- ✅ Plugin ativo
- ✅ Sincroniza membership changes com backend
- ✅ Configuração em: `Settings > MiraCole Backend`

#### 3. MiraCole Device Link
- ✅ Plugin ativo
- ⚠️ **PRECISA**: Criar página `/link` no WordPress com shortcode `[miracole_device_link]`

---

## 🧪 Como Testar os Endpoints

### 1. Health Check (Sem autenticação)

```bash
curl https://miracole-backend.onrender.com/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX...",
  "environment": "production"
}
```

---

### 2. Gerar Device Code (Sem autenticação, rate limited)

```bash
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

**⚠️ Rate Limit:** Máximo 7 tentativas por hora por IP

---

### 3. Poll Device Code (Sem autenticação)

```bash
curl "https://miracole-backend.onrender.com/api/device/poll?code=AB12CD34"
```

**Resposta esperada (não linkado):**
```json
{
  "success": true,
  "activated": false
}
```

**Resposta esperada (linkado):**
```json
{
  "success": true,
  "activated": true,
  "user_id": 123
}
```

---

### 4. Login (Requisição POST)

```bash
curl -X POST https://miracole-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "seu_usuario",
    "password": "sua_senha"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "email": "user@example.com",
    "name": "User Name",
    "subscription": "premium"
  }
}
```

**⚠️ Lockout:** Após 7 tentativas falhadas, conta bloqueada por 30 minutos

---

### 5. Get /me (Requere autenticação)

Primeiro, faça login e copie o `access_token`:

```bash
# Substitua YOUR_ACCESS_TOKEN pelo token retornado no login
curl https://miracole-backend.onrender.com/api/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Resposta esperada:**
```json
{
  "subscribed": true,
  "subscription_level": {
    "id": 2,
    "name": "Monthly"
  },
  "credits_balance": 0,
  "language": "en",
  "playlist_count": 0,
  "watchlist_count": 0,
  "parental_settings": {
    "locked": false
  },
  "profile": {
    "id": 123,
    "username": "user",
    "email": "user@example.com",
    "display_name": "User Name"
  }
}
```

---

### 6. Refresh Token

```bash
curl -X POST https://miracole-backend.onrender.com/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "access_token": "new_access_token...",
  "refresh_token": "new_refresh_token...",
  "expires_in": 3600
}
```

**⚠️ Token Rotation:** O refresh token antigo é revogado automaticamente

---

### 7. Confirm Device Code (Requere autenticação)

```bash
curl -X POST https://miracole-backend.onrender.com/api/device/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "deviceCode": "AB12CD34"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "activated": true,
  "user_id": 123
}
```

---

### 8. Logout

```bash
curl -X POST https://miracole-backend.onrender.com/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🔧 Configuração do WordPress

### 1. Configurar Backend URL

1. Acesse: `WordPress Admin > Settings > MiraCole Backend`
2. Configure:
   - **Backend URL:** `https://miracole-backend.onrender.com`
   - **API Key:** (se configurado no backend)
3. Clique em "Test Connection"

### 2. Criar Página /link

1. Crie uma nova página no WordPress
2. **Slug:** `link` (URL será: `https://miracoleplus.com/link`)
3. Adicione o shortcode: `[miracole_device_link]`
4. Publique a página

### 3. Testar Página /link

1. Acesse: `https://miracoleplus.com/link`
2. Você deve ver o formulário de "Confirm Device Link"
3. Faça login e teste o fluxo completo

---

## 📝 Checklist de Testes

### Backend Endpoints (Node.js)
- [ ] Health check funciona
- [ ] Device code generation funciona
- [ ] Device code polling funciona
- [ ] Login funciona com credenciais WordPress
- [ ] Get /me retorna subscription status correto
- [ ] Refresh token funciona
- [ ] Device confirm funciona após login
- [ ] Logout revoga refresh token
- [ ] Rate limiting funciona (7 tentativas/hora)
- [ ] Lockout funciona (7 falhas = 30 min bloqueio)

### WordPress Integration
- [ ] Página `/link` existe e funciona
- [ ] Shortcode `[miracole_device_link]` renderiza
- [ ] Login no /link funciona
- [ ] Device confirm no /link funciona
- [ ] Backend connector sincroniza membership changes

### Security
- [ ] Access token expira em 60 minutos
- [ ] Refresh token expira em 90 dias
- [ ] Refresh token é rotacionado a cada uso
- [ ] Logout revoga refresh token

---

## 🐛 Troubleshooting

### Endpoint retorna 404
- Verifique se a URL está correta: `https://miracole-backend.onrender.com/api/*`
- Verifique se o backend está rodando no Render

### Endpoint retorna 401
- Verifique se o token está sendo enviado: `Authorization: Bearer TOKEN`
- Verifique se o token não expirou (access token: 60 min)

### Login retorna 429 (Too Many Requests)
- Você foi bloqueado por muitas tentativas
- Aguarde 30 minutos ou use outro IP

### Device code não funciona
- Verifique se o código expirou (15 minutos)
- Verifique se o código foi confirmado (não pode ser reutilizado)

---

## 📞 URLs Importantes

- **Backend API:** `https://miracole-backend.onrender.com`
- **WordPress Site:** `https://miracoleplus.com`
- **Página /link:** `https://miracoleplus.com/link`
- **Health Check:** `https://miracole-backend.onrender.com/health`

---

## ✅ Próximos Passos

1. ✅ Testar todos os endpoints do backend
2. ⚠️ Criar página `/link` no WordPress
3. ✅ Testar fluxo completo de device linking
4. ✅ Verificar sincronização de membership
5. ✅ Documentar API para Roku

---

**Última atualização:** 2025-01-XX

