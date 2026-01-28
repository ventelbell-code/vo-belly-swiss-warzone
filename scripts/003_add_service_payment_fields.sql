-- Agregar campos para sistema de pagos USDT
-- service_status: ACTIVO, EN ESPERA DE PAGO, PAGO REPORTADO
-- service_debt: monto pendiente en USDT

-- Agregar columna service_status si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'clients' 
                   AND column_name = 'service_status') THEN
        ALTER TABLE public.clients 
        ADD COLUMN service_status TEXT NOT NULL DEFAULT 'ACTIVO' 
        CHECK (service_status IN ('ACTIVO', 'EN ESPERA DE PAGO', 'PAGO REPORTADO'));
    END IF;
END $$;

-- Agregar columna service_debt si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'clients' 
                   AND column_name = 'service_debt') THEN
        ALTER TABLE public.clients 
        ADD COLUMN service_debt DECIMAL(10,2) NOT NULL DEFAULT 0.00;
    END IF;
END $$;

-- Agregar columna profit_share_percentage si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'clients' 
                   AND column_name = 'profit_share_percentage') THEN
        ALTER TABLE public.clients 
        ADD COLUMN profit_share_percentage DECIMAL(5,2) NOT NULL DEFAULT 30.00;
    END IF;
END $$;

-- Agregar columna plan si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'clients' 
                   AND column_name = 'plan') THEN
        ALTER TABLE public.clients 
        ADD COLUMN plan TEXT NOT NULL DEFAULT 'standard';
    END IF;
END $$;

-- Agregar columna is_active si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'clients' 
                   AND column_name = 'is_active') THEN
        ALTER TABLE public.clients 
        ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
    END IF;
END $$;

-- Actualizar tabla payments para soportar USDT
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'payments' 
                   AND column_name = 'currency') THEN
        ALTER TABLE public.payments 
        ADD COLUMN currency TEXT NOT NULL DEFAULT 'USDT';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'payments' 
                   AND column_name = 'payment_method') THEN
        ALTER TABLE public.payments 
        ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'TRC20';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'payments' 
                   AND column_name = 'notes') THEN
        ALTER TABLE public.payments 
        ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Hacer opcionales los campos que antes eran requeridos en payments
ALTER TABLE public.payments 
    ALTER COLUMN operations_count DROP NOT NULL,
    ALTER COLUMN period_start DROP NOT NULL,
    ALTER COLUMN period_end DROP NOT NULL;

-- Actualizar el constraint de status en payments si existe
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_status_check 
    CHECK (status IN ('pending', 'paid', 'overdue', 'completed', 'cancelled'));

-- Actualizar activity_log para soportar nuevos tipos
ALTER TABLE public.activity_log DROP CONSTRAINT IF EXISTS activity_log_activity_type_check;
ALTER TABLE public.activity_log ADD CONSTRAINT activity_log_activity_type_check 
    CHECK (activity_type IN ('operation', 'payment', 'system', 'config', 'payment_reported', 'payment_confirmed'));

-- Agregar columna action y details a activity_log si no existen
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'activity_log' 
                   AND column_name = 'action') THEN
        ALTER TABLE public.activity_log 
        ADD COLUMN action TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'activity_log' 
                   AND column_name = 'details') THEN
        ALTER TABLE public.activity_log 
        ADD COLUMN details JSONB;
    END IF;
END $$;

-- Actualizar cliente demo con nuevos campos
UPDATE public.clients 
SET 
    service_status = 'EN ESPERA DE PAGO',
    service_debt = 150.00,
    profit_share_percentage = 30.00
WHERE id = '00000000-0000-0000-0000-000000000001';
