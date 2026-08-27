# Environment Management

## Environment hierarchy

Softwall CashFlow uses four logical environments:

- `local` — developer machine; sandbox integrations only.
- `test` — automated tests; isolated database and Redis.
- `staging` — production-like validation; sandbox/external test providers only.
- `production` — real customer data and live providers.

## Rules

1. Real secrets are never committed to Git.
2. `.env.example` contains names and safe placeholders only.
3. `.env`, `.env.local`, `.env.test`, `.env.staging`, and `.env.production` are ignored by Git.
4. Production secrets are injected by the deployment platform/secret manager, not baked into images.
5. Banking, accounting, payroll, payment-provider, database, encryption, and authentication credentials are environment-specific.
6. Production secrets must be rotated without requiring source-code changes.
7. Client-side variables must use an explicit public prefix and must never contain secrets.
8. Startup validation must fail fast when required variables are absent or malformed.
9. Secrets must not be printed in logs, error responses, telemetry, or crash reports.
10. Local development uses sandbox/test provider credentials wherever available.

## Secret classes

### Critical

Database credentials, encryption keys, authentication secrets, bank connector credentials, payment-provider secrets, OAuth client secrets.

### Sensitive

Webhook signing secrets, observability DSNs, internal service tokens, third-party API keys.

### Public configuration

Application URLs, feature flags that contain no sensitive information, public client identifiers intended for browsers.

## Deployment model

```text
Developer / CI
      |
      v
Validated configuration
      |
      +--> Local
      +--> Test
      +--> Staging
      +--> Production
              |
              v
       Secret manager / platform env
              |
       +------+------+------+
       |      |      |      |
      Web    API   Worker  Billing
```

CI receives only the credentials required for CI. Production secrets are not exposed to pull-request jobs.

## Rotation

Credentials are versioned outside source control. Rotation procedure:

1. Create replacement credential at provider.
2. Store replacement in secret manager.
3. Deploy/restart services using the new secret.
4. Verify health and provider connectivity.
5. Revoke old credential.
6. Record rotation in the security audit trail.

## Future implementation

The next infrastructure steps are containerization, PostgreSQL, Redis, centralized configuration validation, and deployment-platform secret injection. The application must use a typed configuration layer rather than reading arbitrary environment variables throughout the codebase.
