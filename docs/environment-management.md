# Environment Management

## Environments

- `local`: developer machine; Docker-backed dependencies and `.env.local`.
- `test`: isolated automated tests; never use production credentials or data.
- `staging`: production-like validation; isolated database, Redis, integrations and billing sandbox accounts.
- `production`: real customer data; secrets supplied only by the deployment secret manager.

## Rules

1. `.env`, `.env.*` are ignored by Git except `.env.example`.
2. `.env.example` contains placeholders only.
3. Real API keys, database passwords, encryption keys, webhook secrets and OAuth client secrets must never be committed.
4. Production secrets must be injected by the deployment platform/secret manager, not baked into images.
5. Bank, accounting and payment-provider credentials are tenant/integration secrets and must be encrypted at rest.
6. Secrets must be rotated without requiring a source-code change.
7. Logs must never contain access tokens, refresh tokens, API keys, card data, bank credentials or raw financial credentials.
8. Staging and production must use separate credentials and data stores.

## Secret classes

### Server secrets
Authentication signing secrets, encryption keys, database credentials, Redis credentials, provider secrets and webhook signing secrets.

### Tenant integration secrets
OAuth access/refresh tokens and provider connection credentials. Encrypt before persistence; decrypt only inside the connector boundary.

### Public configuration
URLs, feature flags that contain no secrets, locale defaults and non-sensitive application configuration.

## CI/CD

GitHub Actions may read CI-only secrets for tests/builds. Production deployment secrets belong to the deployment environment, with least-privilege access and environment protection rules.

## Required production controls

- Secret manager or platform-managed encrypted environment variables
- Separate staging/production environments
- Environment-specific database and Redis
- Secret rotation procedure
- Audit trail for privileged secret access
- Backup and recovery for encrypted secret material
- No secrets in client-side bundles
