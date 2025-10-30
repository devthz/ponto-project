# Sistema de Controle de Ponto e Banco de Horas

Aplicativo web moderno para gerenciar registros de ponto com sincronização na nuvem.

## 🚀 Tecnologias

- **Next.js 14** com TypeScript
- **Tailwind CSS** para estilização
- **Supabase** para backend e autenticação
- **Lucide React** para ícones

## 📋 Funcionalidades

- ✅ Registro de 4 pontos diários (Entrada, Saída Almoço, Volta Almoço, Saída)
- ⚙️ Configuração de carga horária personalizada
- 📊 Cálculo automático de banco de horas
- 📋 Histórico completo de registros
- 🔐 Autenticação segura
- ☁️ Sincronização automática entre dispositivos
- 📱 Interface responsiva (mobile, tablet, desktop)
- 🌓 Suporte a modo escuro

## 🛠️ Instalação

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com) (gratuita)

### 1. Clone e instale dependências

```bash
git clone <seu-repositorio>
cd ponto-thz
npm install
```

### 2. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie `.env.local.example` para `.env.local`
3. Adicione suas credenciais (URL e Anon Key do Supabase)

### 3. Crie as tabelas no banco

No **SQL Editor** do Supabase, execute o script `supabase-schema.sql`

### 4. Execute a migração (se necessário)

Execute também `supabase-migration.sql` para adicionar suporte aos 4 pontos

### 5. Rode o projeto

```bash
npm run dev
```

Acesse em [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy na Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automático!

### Build para produção local

```bash
npm run build
npm start
```

## 💡 Como Usar

1. **Crie uma conta** ou faça login
2. **Configure sua carga horária** (ex: 8h/dia, 40h/semana)
3. **Registre seus pontos**:
   - Entrada
   - Saída para almoço
   - Volta do almoço
   - Saída final
4. **Acompanhe seu banco de horas** em tempo real

## 📁 Estrutura do Projeto

```
ponto-thz/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Página inicial com lógica
│   └── globals.css         # Estilos globais
├── components/
│   ├── Auth.tsx            # Autenticação
│   ├── ClockConfig.tsx     # Configuração de carga horária
│   ├── DailyTimeEntry.tsx  # Registro de pontos (4 horários)
│   ├── HourBank.tsx        # Exibição do banco de horas
│   └── TimeHistory.tsx     # Histórico de registros
├── lib/
│   └── supabase.ts         # Cliente Supabase
├── supabase-schema.sql     # Script inicial do banco
└── supabase-migration.sql  # Migração para 4 pontos
```

## � Segurança e Dados

- **Row Level Security (RLS)** ativo no Supabase
- Cada usuário acessa apenas seus próprios dados
- Autenticação segura via Supabase Auth
- Dados criptografados em trânsito (HTTPS)
- Backup automático pelo Supabase

## 📊 Plano Gratuito Supabase

- 500MB de armazenamento
- 50.000 usuários ativos/mês
- Autenticação ilimitada
- Ideal para uso pessoal e pequenas equipes

## 📝 Licença

MIT

---

Desenvolvido para facilitar o controle de ponto profissional
