-- Criar tabela de configurações de trabalho
CREATE TABLE work_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  daily_hours DECIMAL(4,2) NOT NULL DEFAULT 8,
  weekly_hours DECIMAL(4,2) NOT NULL DEFAULT 40,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Criar tabela de registros de ponto
CREATE TABLE time_records (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL,
  clock_in TEXT NOT NULL,
  clock_out TEXT,
  total_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) para work_config
ALTER TABLE work_config ENABLE ROW LEVEL SECURITY;

-- Políticas para work_config
CREATE POLICY "Users can view their own config"
  ON work_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own config"
  ON work_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own config"
  ON work_config FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own config"
  ON work_config FOR DELETE
  USING (auth.uid() = user_id);

-- Habilitar RLS para time_records
ALTER TABLE time_records ENABLE ROW LEVEL SECURITY;

-- Políticas para time_records
CREATE POLICY "Users can view their own records"
  ON time_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own records"
  ON time_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own records"
  ON time_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own records"
  ON time_records FOR DELETE
  USING (auth.uid() = user_id);

-- Índices para melhor performance
CREATE INDEX idx_time_records_user_id ON time_records(user_id);
CREATE INDEX idx_time_records_created_at ON time_records(created_at DESC);
CREATE INDEX idx_work_config_user_id ON work_config(user_id);
