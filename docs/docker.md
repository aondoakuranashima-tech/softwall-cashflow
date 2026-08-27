# Docker Architecture

Docker is the infrastructure boundary for local development and future deployment. The repository deliberately keeps application images separate from stateful infrastructure.

## Local stack

`docker-compose.yml` currently provisions:

- PostgreSQL 17 for durable application data
- Redis 8 for cache, queues and ephemeral coordination

Both services have persistent named volumes and health checks.

## Application containers

`docker/Dockerfile.node` is the reusable Node.js 22 + pnpm 10.15.0 baseline for future:

- `apps/web`
- `apps/api`
- `apps/billing-api`
- `apps/workers`

The image uses dependency/build/runtime stages and runs the runtime as an unprivileged user. Application-specific images should eventually provide their own startup command and, where appropriate, Next.js standalone output.

## Principles

1. Stateless application containers; persistent state belongs in managed databases/storage.
2. Never copy `.env` or secrets into images.
3. Pin major/runtime versions and update deliberately.
4. Use health checks for infrastructure dependencies.
5. Keep images minimal and multi-stage.
6. Run application processes without root privileges.
7. Separate development infrastructure from production infrastructure.
8. Production deployments should use managed PostgreSQL/Redis where practical rather than self-hosting state inside containers.

## Future services

As the product grows, compose can add isolated services for API, billing API, workers, web, observability and integration emulators without changing the fundamental architecture.
