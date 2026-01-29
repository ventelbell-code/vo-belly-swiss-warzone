-- MT5 Multi-Account Support
-- Permite que un cliente tenga multiples cuentas MT5

-- Tabla de cuentas MT5 (una por cuenta conectada)
CREATE TABLE IF NOT EXISTS public.mt5_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL,
  broker TEXT NOT NULL DEFAULT 'Deriv',
  balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  equity DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  leverage INTEGER DEFAULT 500,
  currency TEXT DEFAULT 'USD',
  server TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, account_number)
);

-- Indice para busquedas rapidas
CREATE INDEX IF NOT EXISTS idx_mt5_accounts_client_id ON public.mt5_accounts(client_id);
CREATE INDEX IF NOT EXISTS idx_mt5_accounts_account_number ON public.mt5_accounts(account_number);

-- Habilitar RLS
ALTER TABLE public.mt5_accounts ENABLE ROW LEVEL SECURITY;

-- Politicas RLS
CREATE POLICY "mt5_accounts_select_all" ON public.mt5_accounts FOR SELECT USING (true);
CREATE POLICY "mt5_accounts_insert_service" ON public.mt5_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "mt5_accounts_update_service" ON public.mt5_accounts FOR UPDATE USING (true);
CREATE POLICY "mt5_accounts_delete_service" ON public.mt5_accounts FOR DELETE USING (true);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_mt5_accounts_updated_at ON public.mt5_accounts;
CREATE TRIGGER update_mt5_accounts_updated_at
    BEFORE UPDATE ON public.mt5_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Agregar columna mt5_account_id a operations si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'operations' 
        AND column_name = 'mt5_account_id'
    ) THEN
        ALTER TABLE public.operations ADD COLUMN mt5_account_id UUID REFERENCES public.mt5_accounts(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_operations_mt5_account ON public.operations(mt5_account_id);
    END IF;
END $$;

-- Insertar cuenta MT5 demo para el cliente demo
INSERT INTO public.mt5_accounts (client_id, account_number, broker, balance, equity, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '12345678',
  'Deriv',
  62459.40,
  62459.40,
  true
) ON CONFLICT (client_id, account_number) DO NOTHING;
