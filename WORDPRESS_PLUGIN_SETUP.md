# Plugin WordPress - MiraCole Backend Connector

## 📦 Instalação do Plugin

### Opção 1: Upload Manual (Recomendado)

1. **Zip do Plugin:**
   - Entre na pasta: `wordpress-plugin/miracole-backend-connector/`
   - Crie um arquivo ZIP com todos os arquivos
   - Ou use o comando abaixo para criar o ZIP

2. **No WordPress Admin:**
   - Vá em **Plugins** → **Adicionar Novo**
   - Clique em **Enviar Plugin**
   - Selecione o arquivo ZIP
   - Clique em **Instalar Agora**
   - Depois clique em **Ativar Plugin**

### Opção 2: Upload via FTP

1. Faça upload da pasta `miracole-backend-connector` para `/wp-content/plugins/`
2. Vá em **Plugins** no WordPress Admin
3. Encontre **MiraCole Backend Connector** e clique em **Ativar**

## ⚙️ Configuração

### Método 1: Via Interface WordPress (Mais Fácil)

1. Após ativar o plugin, vá em **Configurações** → **MiraCole Backend**
2. Preencha os campos:
   - **Backend URL:** `https://miracole-backend.onrender.com`
   - **API Key:** `miracole_secret_key_123`
3. Clique em **Salvar Configurações**
4. Clique em **Testar Conexão** para verificar se está funcionando

### Método 2: Via wp-config.php (Opcional)

Adicione no `wp-config.php` antes de `/* That's all, stop editing! */`:

```php
// MiraCole Backend Configuration
define('MIRACOLE_BACKEND_URL', 'https://miracole-backend.onrender.com');
define('MIRACOLE_API_KEY', 'miracole_secret_key_123');
```

### Método 3: Via Variável de Ambiente (Render/Docker)

Se estiver usando variáveis de ambiente, o plugin detecta automaticamente:
- `MIRACOLE_BACKEND_URL`
- `MIRACOLE_API_KEY`

## ✅ Verificação

### 1. Teste a Conexão

No painel do WordPress:
- Vá em **Configurações** → **MiraCole Backend**
- Clique em **Testar Conexão**
- Deve mostrar: ✅ **Connection Successful!**

### 2. Verifique os Endpoints

O plugin fornece links para testar:
- **Health Check:** `https://miracole-backend.onrender.com/health`
- **Plans Endpoint:** `https://miracole-backend.onrender.com/api/plans`

### 3. Teste Manual com cURL

```bash
# Health check
curl https://miracole-backend.onrender.com/health

# Plans endpoint
curl https://miracole-backend.onrender.com/api/plans
```

## 🔗 Integração com PMPro

O plugin está preparado para sincronizar mudanças de membros automaticamente:

- Quando um usuário muda de nível de membro no PMPro
- O plugin pode enviar essa informação para o backend
- (Atualmente apenas loga - você pode habilitar o webhook se necessário)

## 🛠️ Uso Programático

Se você quiser usar o plugin em código PHP customizado:

```php
// Enviar requisição para o backend
$result = miracole_send_to_backend('/api/endpoint', 'POST', array(
    'data' => 'example'
));

if ($result && $result['status'] === 200) {
    // Sucesso
    $response_data = $result['body'];
}
```

## 📝 Checklist de Configuração

- [ ] Plugin instalado e ativado
- [ ] Backend URL configurado: `https://miracole-backend.onrender.com`
- [ ] API Key configurada: `miracole_secret_key_123`
- [ ] Teste de conexão passou
- [ ] Health check endpoint responde
- [ ] Plans endpoint retorna dados

## 🔧 Troubleshooting

### Erro: "Connection Failed"
- Verifique se a URL do backend está correta
- Verifique se o backend está online no Render
- Verifique os logs do WordPress: `/wp-content/debug.log`

### Erro: "Invalid API Key"
- Confirme que `WP_API_KEY` no Render está como `miracole_secret_key_123`
- Verifique se não há espaços extras na chave
- Faça um redeploy do backend após mudar a variável

### Plugin não aparece
- Verifique se o arquivo está na pasta correta: `/wp-content/plugins/miracole-backend-connector/`
- Verifique se o arquivo principal se chama: `miracole-backend-connector.php`
- Verifique permissões dos arquivos (deve ser 644 para arquivos)

## 🚀 Próximos Passos

Após configurar o plugin:

1. ✅ Verifique se a conexão está funcionando
2. ✅ Teste os endpoints do backend
3. ✅ Configure integrações adicionais se necessário
4. ✅ Monitore os logs para garantir que está tudo funcionando

---

**Nota:** Este plugin é o ponto de conexão entre WordPress e seu backend Render. Ele permite que o WordPress faça requisições para o backend e vice-versa.

