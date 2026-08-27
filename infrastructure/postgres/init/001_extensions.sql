-- Softwall CashFlow PostgreSQL foundation.
-- Keep extensions deliberately small; add new ones only when a product requirement exists.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- UUID generation is provided by pgcrypto (gen_random_uuid()).
