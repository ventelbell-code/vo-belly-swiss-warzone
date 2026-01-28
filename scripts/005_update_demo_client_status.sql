-- Update demo client to have EN ESPERA DE PAGO status for testing
UPDATE clients 
SET 
  service_status = 'EN ESPERA DE PAGO',
  service_debt = 150.00
WHERE name = 'Usuario Demo'
OR id = 'demo-client-001';

-- Also try updating by email pattern
UPDATE clients 
SET 
  service_status = 'EN ESPERA DE PAGO',
  service_debt = 150.00
WHERE email LIKE '%demo%';

-- If no rows updated, insert a demo client
INSERT INTO clients (id, name, email, plan, initial_capital, is_active, service_status, service_debt, profit_share_percentage)
VALUES (
  'demo-client-001',
  'Cliente Demo',
  'demo@bellyswiss.com',
  'premium',
  50000,
  true,
  'EN ESPERA DE PAGO',
  150.00,
  30
)
ON CONFLICT (id) DO UPDATE SET
  service_status = 'EN ESPERA DE PAGO',
  service_debt = 150.00;

-- Verify the update
SELECT id, name, email, service_status, service_debt FROM clients;
