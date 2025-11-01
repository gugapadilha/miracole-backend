# Atualizar WP_API_KEY no Render

## 🔑 Passo a Passo

### 1. Acesse o Render Dashboard

1. Vá para: https://dashboard.render.com
2. Faça login na sua conta
3. Encontre o serviço: **miracole-backend**

### 2. Atualize a Variável de Ambiente

1. Clique no serviço **miracole-backend**
2. Vá na aba **Environment**
3. Procure pela variável `WP_API_KEY`
4. **Edite** e altere o valor para:
   ```
   miracole_secret_key_123
   ```
5. Clique em **Save Changes**

### 3. Redeploy do Serviço

Após salvar a variável:
1. Vá na aba **Events**
2. Clique em **Manual Deploy** → **Deploy latest commit**
3. Ou aguarde o deploy automático (pode levar alguns minutos)

### 4. Verificar se Funcionou

Após o deploy, teste novamente:

```bash
node test-wp-connection.js https://miracole-backend.onrender.com
```

Ou acesse diretamente:
```
https://miracole-backend.onrender.com/api/plans
```

## ✅ Variáveis de Ambiente no Render

Confirme que estas variáveis estão configuradas:

```
WP_BASE_URL=https://miracoleplus.com
WP_API_KEY=miracole_secret_key_123
```

## 🔍 Troubleshooting

### A variável não aparece na lista
- Verifique se você está na aba **Environment** correta
- Procure por "WP_API_KEY" na busca de variáveis

### Após mudar, o erro persiste
- Aguarde o deploy completar (pode levar 2-5 minutos)
- Verifique os logs do serviço no Render
- Confirme que não há espaços extras na chave

### Teste direto

Execute este comando para testar se a chave está funcionando:

```bash
curl -H "Authorization: Bearer miracole_secret_key_123" https://miracoleplus.com/wp-json/pmpro/v1/levels
```

(Nota: Isso ainda pode retornar 404 se o endpoint PMPro não existir, mas não deve retornar 401/403 se a chave estiver correta)

