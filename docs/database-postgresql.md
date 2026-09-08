# PostgreSQL runtime

The web API now reads financial data through `@softwall/database` and Prisma. Configure `DATABASE_URL` and `SOFTWALL_ORGANIZATION_ID` before starting the server.

After pulling schema changes, run `pnpm install`, `pnpm db:generate`, and `pnpm --filter @softwall/database prisma migrate deploy` in the Codespace/deployment environment.
