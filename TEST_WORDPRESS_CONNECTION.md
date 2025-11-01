# WordPress Connection Test Guide

Este guia mostra como testar a conexão entre o backend e o WordPress.

## 📋 Pré-requisitos

- ✅ Variáveis de ambiente configuradas no Render:
  - `WP_BASE_URL=https://miracoleplus.com`
  - `WP_API_KEY=<sua-chave-da-api-rest-do-wp>`

## 🧪 Métodos de Teste

### Método 1: Testar Endpoint do Backend (Recomendado)

Teste o endpoint `/api/plans` no seu backend do Render:

```bash
# Substitua YOUR_RENDER_URL pela URL do seu serviço no Render
curl https://YOUR_RENDER_URL.onrender.com/api/plans
```

Ou usando o script de teste:

```bash
node test-wp-connection.js https://YOUR_RENDER_URL.onrender.com
```

**Interpretação dos resultados:**

✅ **Sucesso (source: "wordpress")**: 
- Status 200
- `"source": "wordpress"`
- Lista de planos retornados
- ✅ **Conexão WordPress funcionando!**

⚠️ **Fallback (source: "fallback")**:
- Status 200
- `"source": "fallback"`
- Planos estáticos retornados (IDs: 2, 3, 7, 8, 9)
- ❌ **Conexão WordPress falhou, usando dados estáticos**

❌ **Erro 401/403**:
- Problema com o token da API
- Verifique se `WP_API_KEY` está correto no Render
- Verifique se a chave tem permissões corretas no WordPress

❌ **Erro 404**:
- Endpoint não existe
- Verifique se o plugin PMPro está instalado e ativo
- Verifique se a REST API está acessível: `/wp-json/pmpro/v1/levels`

### Método 2: Teste Direto WordPress

Teste a conexão direta com WordPress usando o script:

```bash
# Certifique-se de ter WP_API_KEY no seu .env local (ou forneça como variável de ambiente)
node test-wp-connection.js
```

Ou teste diretamente com curl:

```bash
curl -H "Authorization: Bearer YOUR_WP_API_KEY" https://miracoleplus.com/wp-json/pmpro/v1/levels
```

### Método 3: Teste via Postman/Insomnia

1. **GET Request**:
   - URL: `https://YOUR_RENDER_URL.onrender.com/api/plans`
   - Method: `GET`
   - No headers necessários

2. Verifique a resposta:
   - Status: `200 OK`
   - Body: JSON com `source: "wordpress"` ou `source: "fallback"`

## 🔍 Diagnóstico de Problemas

### Erro 401/403
**Problema**: Token de autenticação inválido ou sem permissões

**Soluções**:
1. Verifique se `WP_API_KEY` está correto no Render (Environment tab)
2. Verifique se a chave foi criada corretamente no WordPress
3. Verifique se a chave tem as permissões necessárias (read, por exemplo)

### Erro 404
**Problema**: Endpoint não existe ou plugin não está ativo

**Soluções**:
1. Verifique se o plugin PMPro está instalado e ativo
2. Teste o endpoint diretamente: `https://miracoleplus.com/wp-json/pmpro/v1/levels`
3. Verifique se a REST API do WordPress está habilitada

### Timeout ou Sem Resposta
**Problema**: WordPress não está acessível ou URL incorreta

**Soluções**:
1. Verifique se `WP_BASE_URL` está correto (deve ser `https://miracoleplus.com`)
2. Teste se o WordPress está acessível: `https://miracoleplus.com`
3. Verifique se não há problemas de firewall ou rede

### Retorna Fallback
**Problema**: Backend consegue responder, mas não consegue conectar ao WordPress

**Soluções**:
1. Execute o teste direto do WordPress (Método 2) para identificar o problema
2. Verifique os logs do backend no Render
3. Verifique se todas as variáveis de ambiente estão configuradas corretamente

## ✅ Checklist de Validação

- [ ] `WP_BASE_URL` está configurado no Render
- [ ] `WP_API_KEY` está configurado no Render
- [ ] Endpoint `/api/plans` retorna status 200
- [ ] Resposta contém `"source": "wordpress"` (não "fallback")
- [ ] Lista de planos é retornada corretamente
- [ ] Nenhum erro 401/403/404

## 📝 Exemplo de Resposta de Sucesso

```json
{
  "success": true,
  "source": "wordpress",
  "plans": [
    {
      "id": 2,
      "name": "Monthly",
      "initial_payment": 0,
      "billing_amount": 0,
      "cycle_number": 1,
      "cycle_period": "Month",
      "billing_limit": null,
      "trial_amount": 0,
      "trial_limit": 0
    },
    ...
  ]
}
```

## 🚀 Próximos Passos

Após confirmar que a conexão está funcionando:

1. Teste outros endpoints que dependem do WordPress
2. Valide que os dados estão sendo sincronizados corretamente
3. Monitore os logs para garantir que não há erros intermitentes

