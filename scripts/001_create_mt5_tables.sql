-- MT5 Bridge Database Schema
-- Sistema de tracking de operaciones y pagos

-- Tabla de clientes (usuarios del sistema)
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  initial_capital DECIMAL(12,2) NOT NULL DEFAULT 50000.00,
  current_balance DECIMAL(12,2) NOT NULL DEFAULT 50000.00,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  mt5_account_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de operaciones (trades ejecutados por MT5)
CREATE TABLE IF NOT EXISTS public.operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  mt5_ticket TEXT UNIQUE NOT NULL,
  asset TEXT NOT NULL DEFAULT 'Boom 1000 Index',
  asset_type TEXT NOT NULL DEFAULT 'Sintetico',
  operation_type TEXT NOT NULL CHECK (operation_type IN ('Scalp', 'Expansion', 'Recovery')),
  lot_size DECIMAL(4,2) NOT NULL,
  profit DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(6,4) NOT NULL,
  entry_price DECIMAL(12,5),
  exit_price DECIMAL(12,5),
  duration_seconds INTEGER,
  opened_at TIMESTAMPTZ NOT NULL,
  closed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de configuracion del sistema por cliente
CREATE TABLE IF NOT EXISTS public.client_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID UNIQUE NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  lot_size DECIMAL(4,2) NOT NULL DEFAULT 0.20,
  daily_limit INTEGER NOT NULL DEFAULT 20,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de pagos (coste del servicio)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  operations_count INTEGER NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de estado del sistema (para tracking de estado global)
CREATE TABLE IF NOT EXISTS public.system_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID UNIQUE NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  pending_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_operations_today INTEGER NOT NULL DEFAULT 0,
  last_operation_at TIMESTAMPTZ,
  system_status TEXT NOT NULL DEFAULT 'active' CHECK (system_status IN ('active', 'pending', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de log de actividades (para el timeline en tiempo real)
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  operation_id UUID REFERENCES public.operations(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('operation', 'payment', 'system', 'config')),
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_operations_client_id ON public.operations(client_id);
CREATE INDEX IF NOT EXISTS idx_operations_closed_at ON public.operations(closed_at DESC);
CREATE INDEX IF NOT EXISTS idx_operations_client_date ON public.operations(client_id, closed_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON public.payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_activity_log_client_id ON public.activity_log(client_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Politicas RLS para acceso publico (para el API de MT5)
-- En produccion, estas politicas deberian ser mas restrictivas con autenticacion

-- Politica para clients: lectura publica, escritura con service role
CREATE POLICY "clients_select_all" ON public.clients FOR SELECT USING (true);
CREATE POLICY "clients_insert_service" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "clients_update_service" ON public.clients FOR UPDATE USING (true);

-- Politica para operations: lectura publica, escritura con service role
CREATE POLICY "operations_select_all" ON public.operations FOR SELECT USING (true);
CREATE POLICY "operations_insert_service" ON public.operations FOR INSERT WITH CHECK (true);
CREATE POLICY "operations_update_service" ON public.operations FOR UPDATE USING (true);

-- Politica para client_settings
CREATE POLICY "settings_select_all" ON public.client_settings FOR SELECT USING (true);
CREATE POLICY "settings_insert_service" ON public.client_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "settings_update_service" ON public.client_settings FOR UPDATE USING (true);

-- Politica para payments
CREATE POLICY "payments_select_all" ON public.payments FOR SELECT USING (true);
CREATE POLICY "payments_insert_service" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "payments_update_service" ON public.payments FOR UPDATE USING (true);

-- Politica para system_state
CREATE POLICY "state_select_all" ON public.system_state FOR SELECT USING (true);
CREATE POLICY "state_insert_service" ON public.system_state FOR INSERT WITH CHECK (true);
CREATE POLICY "state_update_service" ON public.system_state FOR UPDATE USING (true);

-- Politica para activity_log
CREATE POLICY "activity_select_all" ON public.activity_log FOR SELECT USING (true);
CREATE POLICY "activity_insert_service" ON public.activity_log FOR INSERT WITH CHECK (true);

-- Funcion para actualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_client_settings_updated_at ON public.client_settings;
CREATE TRIGGER update_client_settings_updated_at
    BEFORE UPDATE ON public.client_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_state_updated_at ON public.system_state;
CREATE TRIGGER update_system_state_updated_at
    BEFORE UPDATE ON public.system_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar cliente demo inicial
INSERT INTO public.clients (id, email, name, initial_capital, current_balance, status, mt5_account_id)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@bellyswiss.com',
  'Usuario Demo',
  50000.00,
  62459.40,
  'active',
  'MT5-DEMO-001'
) ON CONFLICT (id) DO NOTHING;

-- Insertar configuracion para cliente demo
INSERT INTO public.client_settings (client_id, lot_size, daily_limit, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  0.20,
  20,
  true
) ON CONFLICT (client_id) DO NOTHING;

-- Insertar estado del sistema para cliente demo
INSERT INTO public.system_state (client_id, pending_amount, total_operations_today, system_status)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  0.00,
  8,
  'active'
) ON CONFLICT (client_id) DO NOTHING;
