# Studio Triton — Project Architecture

## dcl-seaware-genesys-screenpop

**Source:** `github.disney.com/dcl/dcl-seaware-genesys-screenpop` (branch: `develop`)

### Stack
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 24 (Debian 12 base) |
| Language | TypeScript 5.3 (strict, ES6 target, CommonJS) |
| Framework | Express 4.x |
| Caching | Redis (ioredis ~4.28.5) |
| Auth | WDPR AuthZ (`@wdpr/ra-node-auth-filter` ^16.1.2) |
| SOAP | `soap` ^0.35.0 (ActiveMQ messaging) |
| Validation | Joi ^17.3.0 |
| Testing | Jest 29.7 + ts-jest + Supertest 7 |
| Linting | ESLint 10 + @typescript-eslint + Prettier 3.6 |
| Docker Base | `wdpr-ra-docker-base-nodejs-node24ts-debian12:v3` |
| Version | 1.3.0 |

### Purpose
Node/Express proxy between **Genesys WWE** (contact center) and **ActiveMQ CTI topics** so agents get Seaware screen pops. Same codebase serves DCL and ABD — only env vars differ.

### Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/screenpop/` | Status HTML (version, env) |
| GET | `/screenpop/api/v1/healthcheck` | Liveness probe |
| POST | `/screenpop/api/sw/{sitename}/new/:url?` | New-reservation screen pop |
| POST | `/screenpop/api/sw/{sitename}/existing/:url?` | Existing-reservation screen pop |
| POST | `/screenpop/api/sw/{sitename}/validate` | Bearer token check |

### CTI Logic
Posts XML messages to ActiveMQ REST API:
- `ShowExistingRes` — when `p_ResID` is non-empty and ≠ `00000000`
- `ShowNewRes` — with ClientID, IATA/ARC/CLIA/AgencyID, or default agency

Posts to two topics: **Main** (uses `Username`) and **Touch** (uses `ExternalUser`).

### Key Dependencies
- `@wdpr/ra-node-auth-filter` — WDPR AuthZ enforcement (permission: `tpr-dse-screenpop`)
- `@wdpr/ra-node-json-web-token` — JWT handling
- `@wdpr/ra-node-logasaurus` — structured logging
- `ioredis` — Redis client for session/state
- `soap` — SOAP client for ActiveMQ XML posting

### Build & Deploy
```
npm run build → tsc → dist/
Docker: node24ts-debian12 base → COPY src → npm run build → CMD node dist/app.js
CI/CD: Harness
Port: 3000
```

### Environment Variables
| Variable | Purpose |
|----------|---------|
| `broker_url` | ActiveMQ base URL |
| `topictouch` / `topicmain` | CTI topic names |
| `touchenabled` / `mainenabled` | Enable/disable topic posting |
| `sitename` | DCL or ABD (route parameter) |
| `agentid` | Default agency ID (66214) |
| `auth` / `authURL` | AuthZ toggle + validation URL |

---

## seaware-graphql (GitLab)

**Source:** `gitlab.disney.com/dse/container-applications/seaware/seaware-graphql`

### Stack
- **Language:** Java
- **Purpose:** Unified GraphQL data access layer over Seaware Oracle DB
- **Consumers:** Gadget Hackwrench services (DataNavigator), other studios
- **CI/CD:** Harness
- **Hosting:** Kubernetes (Rancher)

---

## Other Repos (Azure DevOps — .NET)

All remaining Triton services are in Azure DevOps (`dev.azure.com/disney-cruise/shoreside/_git/`):
- **CAP Services** — Credit Account Processing (Seaware.CAP, ABD.Seaware.CAP)
- **Refund Services** — Payment reversals (Seaware.RefundInterface)
- **DICE** — Internal resort bookings (ResortBookings.Dice/DiceUI)
- **Executor** — Bulk Seaware operations (DCL.Services.Executor)
- **AAA** — Air Accounting Audit (Seaware.AAA.Api/Web)
- **Batch Jobs** — Automic-scheduled .NET console apps (Scheduler.Seaware, Seaware.AutoCancel, etc.)

Stack: C# / .NET Core + Framework, Oracle DB (stored procs), Azure DevOps Pipelines → ECS.
