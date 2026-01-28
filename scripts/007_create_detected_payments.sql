-- Table for detected USDT TRC20 payments from blockchain
CREATE TABLE IF NOT EXISTS detected_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_id TEXT UNIQUE NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount NUMERIC(20, 6) NOT NULL,
  currency TEXT DEFAULT 'USDT',
  network TEXT DEFAULT 'TRC20',
  block_number BIGINT,
  block_timestamp TIMESTAMP WITH TIME ZONE,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'DETECTED' CHECK (status IN ('DETECTED', 'CONFIRMED', 'REJECTED', 'EXPIRED')),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  matched_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmed_by TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_detected_payments_status ON detected_payments(status);
CREATE INDEX IF NOT EXISTS idx_detected_payments_tx_id ON detected_payments(tx_id);
CREATE INDEX IF NOT EXISTS idx_detected_payments_client_id ON detected_payments(client_id);
CREATE INDEX IF NOT EXISTS idx_detected_payments_detected_at ON detected_payments(detected_at DESC);

-- Enable RLS
ALTER TABLE detected_payments ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS detected_payments_select_all ON detected_payments;
CREATE POLICY detected_payments_select_all ON detected_payments FOR SELECT USING (true);

DROP POLICY IF EXISTS detected_payments_insert_service ON detected_payments;
CREATE POLICY detected_payments_insert_service ON detected_payments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS detected_payments_update_service ON detected_payments;
CREATE POLICY detected_payments_update_service ON detected_payments FOR UPDATE USING (true);

-- Table to store the last scanned block for resuming
CREATE TABLE IF NOT EXISTS blockchain_scan_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network TEXT UNIQUE NOT NULL,
  wallet_address TEXT NOT NULL,
  last_scanned_block BIGINT DEFAULT 0,
  last_scanned_timestamp TIMESTAMP WITH TIME ZONE,
  last_scan_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE blockchain_scan_state ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS scan_state_select_all ON blockchain_scan_state;
CREATE POLICY scan_state_select_all ON blockchain_scan_state FOR SELECT USING (true);

DROP POLICY IF EXISTS scan_state_insert_service ON blockchain_scan_state;
CREATE POLICY scan_state_insert_service ON blockchain_scan_state FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS scan_state_update_service ON blockchain_scan_state;
CREATE POLICY scan_state_update_service ON blockchain_scan_state FOR UPDATE USING (true);

-- Initialize scan state for USDT TRC20 wallet
INSERT INTO blockchain_scan_state (network, wallet_address, last_scanned_block)
VALUES ('TRC20', 'TQhRqwKtmwWGoSwZLZazPBRWD4sVFsnRsV', 0)
ON CONFLICT (network) DO NOTHING;
