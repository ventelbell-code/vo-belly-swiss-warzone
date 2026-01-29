-- Remove the strict constraint on service_status to allow case variations
-- and update existing values to standardized format

-- Drop the existing constraint if it exists
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_service_status_check;

-- Update any existing values to standardized format (uppercase)
UPDATE public.clients 
SET service_status = 'EN ESPERA DE PAGO'
WHERE LOWER(service_status) LIKE '%espera%pago%';

UPDATE public.clients 
SET service_status = 'PAGO REPORTADO'
WHERE LOWER(service_status) LIKE '%pago%reportado%';

UPDATE public.clients 
SET service_status = 'ACTIVO'
WHERE LOWER(service_status) = 'activo';

-- Ensure demo client has the correct status for testing
UPDATE public.clients 
SET 
    service_status = 'EN ESPERA DE PAGO',
    service_debt = 150.00
WHERE id = '00000000-0000-0000-0000-000000000001';
