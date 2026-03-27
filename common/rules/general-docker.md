# Docker / Containerization Standards

## Dockerfile Best Practices

```dockerfile
# Use specific version tags, never :latest
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

# Multi-stage: production image
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

## Rules

- Use multi-stage builds to minimize image size
- Pin base image versions — never use `:latest`
- Run as non-root user (`USER node`, `USER 1001`)
- Use `.dockerignore` to exclude node_modules, .git, tests, docs
- Order layers by change frequency — dependencies before source code
- Use `COPY` over `ADD` unless extracting archives
- One process per container

## Image Security

- Scan images with `trivy`, `grype`, or `docker scout`
- Use minimal base images (`alpine`, `distroless`, `slim`)
- Don't store secrets in images — use runtime environment variables
- Set `HEALTHCHECK` for production containers
- Use read-only root filesystem where possible

## Docker Compose

```yaml
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

- Use `depends_on` with health checks
- Don't hardcode ports — use environment variables
- Use named volumes for persistent data
- Use networks to isolate services

## Layer Optimization

- Combine related `RUN` commands with `&&`
- Clean up package manager caches in the same layer
- Use `--no-cache` for package installs in CI
