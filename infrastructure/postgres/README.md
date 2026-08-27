# PostgreSQL Architecture

PostgreSQL is the system of record for Softwall CashFlow. Financial data must remain durable, auditable and transactionally consistent.

## Design rules

- PostgreSQL 17 is the baseline runtime.
- Use UUID identifiers generated with `pgcrypto` (`gen_random_uuid()`).
- Use `citext` where case-insensitive identifiers are required, such as verified email addresses.
- Store monetary values as integer minor units (`BIGINT`) plus an explicit ISO-4217 currency code. Do not use floating point for money.
- Store event timestamps as `TIMESTAMPTZ` in UTC.
- Tenant-owned records must carry an organization/tenant key and be protected by application authorization; row-level security can be introduced for defense in depth before external multi-tenant access is enabled.
- Financial ledger records are append-only. Corrections are compensating entries, not destructive edits.
- External provider IDs require unique constraints scoped to the provider where appropriate, preventing duplicate imports.
- High-volume transaction tables must be indexed for `(organization_id, occurred_at)` and common account/provider lookup paths.
- Avoid unbounded JSON blobs in hot query paths. JSONB is for provider metadata and evolving payloads, not core financial facts.
- Database constraints enforce invariants that application code alone cannot safely guarantee.

## Initial extensions

`init/001-extensions.sql` enables:

- `pgcrypto` for UUID generation and cryptographic primitives where needed.
- `citext` for case-insensitive text semantics.

## Production posture

The Compose database is for development/testing. Production should use managed PostgreSQL with automated backups, point-in-time recovery, encryption at rest, TLS, restricted network access, monitoring, replica strategy and tested restore procedures.

Never commit production credentials to Git. Never put customer financial data into source control, Docker images or logs.
