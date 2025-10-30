# Guia Rápido de Deploy

## 📦 Preparação

1. **Configure o .env.local** com suas credenciais do Supabase
2. **Execute os scripts SQL** no Supabase:
   - `supabase-schema.sql` (criar tabelas)
   - `supabase-migration.sql` (adicionar coluna entry_type)

## 🚀 Deploy na Vercel

### Via Interface Web

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New Project"
3. Importe seu repositório do GitHub
4. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL` = sua URL do Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = sua chave anon do Supabase
5. Clique em "Deploy"

### Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Adicionar variáveis de ambiente
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Deploy production
vercel --prod
```

## ✅ Checklist Pré-Deploy

- [ ] Projeto Supabase criado
- [ ] Tabelas criadas (supabase-schema.sql)
- [ ] Migração executada (supabase-migration.sql)
- [ ] Variáveis de ambiente configuradas
- [ ] Build local testado (`npm run build`)
- [ ] Projeto commitado no Git

## 🌍 Após o Deploy

1. Acesse a URL fornecida pela Vercel
2. Crie uma conta
3. Teste o registro de pontos
4. Verifique se os dados sincronizam

## 🐛 Troubleshooting

**Erro 406 ou dados não carregam:**
- Verifique se executou os scripts SQL
- Confirme as variáveis de ambiente na Vercel

**Erro de autenticação:**
- Verifique as credenciais do Supabase
- Confirme que o projeto está ativo

**Build falha:**
- Execute `npm run build` localmente
- Verifique os logs de erro
- Confirme que todas as dependências estão no package.json
