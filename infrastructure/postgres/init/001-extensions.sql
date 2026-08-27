-- Softwall CashFlow PostgreSQL baseline extensions.
-- Keep extension creation explicit and idempotent.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
