-- Add server and account_type fields to mt5_accounts if they don't exist
-- These are used for Deriv integration

-- Add server column
ALTER TABLE mt5_accounts 
ADD COLUMN IF NOT EXISTS server text DEFAULT 'Deriv-Server';

-- Add account_type column (always REAL for client dashboard)
ALTER TABLE mt5_accounts 
ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'REAL';

-- Add constraint to ensure only REAL accounts in client-facing operations
-- (keeping flexible for potential admin features)
COMMENT ON COLUMN mt5_accounts.account_type IS 'Account type: REAL or DEMO. Client dashboard only supports REAL.';
COMMENT ON COLUMN mt5_accounts.server IS 'MT5 server name. Auto-detected for Deriv.';
