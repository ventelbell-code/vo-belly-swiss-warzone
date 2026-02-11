-- bot_status: estado de conexión de bots MT5 (para webhook heartbeat)
CREATE TABLE IF NOT EXISTS public.bot_status (
  account_id TEXT PRIMARY KEY,
  broker TEXT DEFAULT 'Unknown',
  balance NUMERIC,
  equity NUMERIC,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bot_status_last_seen ON public.bot_status(last_seen DESC);

-- RLS
ALTER TABLE public.bot_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bot_status_select_all" ON public.bot_status FOR SELECT USING (true);
CREATE POLICY "bot_status_insert_service" ON public.bot_status FOR INSERT WITH CHECK (true);
CREATE POLICY "bot_status_update_service" ON public.bot_status FOR UPDATE USING (true);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_bot_status_updated_at ON public.bot_status;
CREATE TRIGGER update_bot_status_updated_at
  BEFORE UPDATE ON public.bot_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
