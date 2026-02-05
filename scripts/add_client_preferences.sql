-- Add language and timezone columns to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'es',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Mexico_City',
ADD COLUMN IF NOT EXISTS alias TEXT;

-- Comment on columns
COMMENT ON COLUMN public.clients.language IS 'User preferred language (es, en, pt)';
COMMENT ON COLUMN public.clients.timezone IS 'User timezone in IANA format';
COMMENT ON COLUMN public.clients.alias IS 'User display name or alias';
