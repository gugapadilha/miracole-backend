# 💰 Render Shell - Informações sobre Preço

## 🆓 Solução GRATUITA Implementada

**Você NÃO precisa pagar pelo Shell do Render!**

A solução de **auto-migration** já está implementada e funciona **GRATUITAMENTE**:

- ✅ Migrations executam automaticamente quando o serviço inicia
- ✅ Não precisa de Shell
- ✅ Não precisa pagar nada extra
- ✅ Funciona no plano Free do Render

---

## 💰 Sobre o Shell do Render (se quiser saber)

O Shell do Render é uma funcionalidade premium que permite acesso SSH ao seu serviço.

### Preço:
- **Starter Plan:** $7/mês por serviço
- **Professional Plan:** $25/mês por serviço
- **Business Plan:** Custom pricing

**Mas você NÃO precisa disso!** A auto-migration funciona sem Shell.

---

## 🆓 Como Funciona a Auto-Migration (GRATUITO)

### 1. Configuração Automática

O `package.json` já está configurado:

```json
{
  "scripts": {
    "start": "node run-migrations.js ; node src/server.js"
  }
}
```

### 2. Quando o Serviço Inicia

1. Render executa `run-migrations.js` automaticamente
2. Script tenta conectar ao database e executar migrations
3. Se migrations funcionarem: ✅ Tabelas criadas
4. Se migrations falharem: ⚠️ Logs mostram erro, mas servidor inicia mesmo assim
5. Servidor inicia normalmente

### 3. Verificar nos Logs

No Render Dashboard > Seu Serviço > Logs, você verá:

**Se migrations funcionaram:**
```
🚀 Starting MiraCole+ database migrations...
✅ Using PostgreSQL database: miracole_api
✅ Database connection successful
📦 Running migrations...
✅ Migrated to batch 1:
   - 001_create_users_table.js
   - 002_create_refresh_tokens_table.js
   - 003_create_devices_table.js
🎉 Database setup completed successfully!
🚀 Server running on port 4000
```

**Se migrations falharam:**
```
🚀 Starting MiraCole+ database migrations...
❌ Migration failed:
Error: connect ETIMEDOUT
💡 Troubleshooting:
   - DB_HOST (should be: dpg-xxxxx.oregon-postgres.render.com)
⚠️  Server will start anyway, but migrations need to be run manually.
🚀 Server running on port 4000
```

---

## ✅ Próximos Passos (GRATUITO)

1. **Configure DB_HOST no Render:**
   - Vá para seu serviço `miracole-backend`
   - Environment Variables
   - Atualize `DB_HOST` para: `dpg-d45p4qili9vc7385h3og-a.oregon-postgres.render.com`
   - Salve

2. **Faça Deploy:**
   - Render vai fazer auto-deploy do GitHub
   - OU clique em "Manual Deploy" > "Deploy latest commit"

3. **Verifique os Logs:**
   - Render Dashboard > Seu Serviço > Logs
   - Procure por mensagens de migration

4. **Teste os Endpoints:**
   ```bash
   curl -X POST https://miracole-backend.onrender.com/api/device/code \
     -H "Content-Type: application/json"
   ```

---

## 🐛 Troubleshooting

### Migrations não executaram?

**Verifique:**
1. `DB_HOST` está configurado corretamente? (com sufixo completo)
2. Database está ativo no Render?
3. Logs mostram erro? Verifique a mensagem de erro

### Servidor não inicia?

**Verifique:**
1. Logs do Render mostram erro específico?
2. Todas as variáveis de ambiente estão configuradas?
3. Código está atualizado no GitHub?

---

## 📝 Resumo

- ✅ **Auto-migration GRATUITA** já implementada
- ✅ **NÃO precisa pagar** pelo Shell do Render
- ✅ **Funciona automaticamente** quando o serviço inicia
- ✅ **Verifique os logs** para confirmar se migrations executaram

---

**Última atualização:** 2025-11-05

