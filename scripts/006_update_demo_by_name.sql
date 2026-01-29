-- Update demo client by name (not UUID)
-- This ensures the PAGAR SERVICIO button appears

UPDATE clients 
SET 
  service_status = 'EN ESPERA DE PAGO',
  service_debt = 150.00
WHERE name = 'Usuario Demo';

-- If no demo user exists, insert one with proper UUID
INSERT INTO clients (id, name, email, plan, initial_capital, is_active, service_status, service_debt, profit_share_percentage)
SELECT 
  gen_random_uuid(),
  'Usuario Demo',
  'demo@bellyswiss.com',
  'standard',
  50000,
  true,
  'EN ESPERA DE PAGO',
  150.00,
  30
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE name = 'Usuario Demo');

-- Show current status
SELECT id, name, service_status, service_debt FROM clients WHERE name = 'Usuario Demo';
