-- MIGRAÇÃO: Adicionar suporte para múltiplos registros por dia
-- Execute este SQL no Supabase SQL Editor

-- Adicionar coluna para tipo de registro
ALTER TABLE time_records 
ADD COLUMN IF NOT EXISTS entry_type TEXT DEFAULT 'entry';

-- Adicionar comentário explicativo
COMMENT ON COLUMN time_records.entry_type IS 'Tipo: entry (entrada), lunch_out (saída almoço), lunch_in (volta almoço), exit (saída)';

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_time_records_date ON time_records(date, user_id);
