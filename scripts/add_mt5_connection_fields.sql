-- Add MT5 connection fields to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS mt5_password_encrypted TEXT,
ADD COLUMN IF NOT EXISTS mt5_server TEXT,
ADD COLUMN IF NOT EXISTS mt5_connection_status TEXT DEFAULT 'not_submitted',
ADD COLUMN IF NOT EXISTS mt5_submitted_at TIMESTAMP WITH TIME ZONE;

-- mt5_connection_status values: 'not_submitted', 'pending', 'connected', 'error'

COMMENT ON COLUMN public.clients.mt5_password_encrypted IS 'Encrypted MT5 password - visible only to admin';
COMMENT ON COLUMN public.clients.mt5_server IS 'MT5 server name (e.g., Deriv-Server, DerivSVG)';
COMMENT ON COLUMN public.clients.mt5_connection_status IS 'Connection status: not_submitted, pending, connected, error';
COMMENT ON COLUMN public.clients.mt5_submitted_at IS 'Timestamp when credentials were submitted';
