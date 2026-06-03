# Service → Repository Mapping — BOLT

## Repositories

| Repo | Type | Stack | Status | Base Branch | Deploy |
|------|------|-------|--------|-------------|--------|
| wdprt-bolt-admin-spa | Legacy Frontend | AngularJS 1.4, TypeScript, Grunt | 🟡 Being replaced | develop | ECS (Docker/HAProxy) |
| wdprt-bolt-admin-wam | Legacy BFF | Node.js, wdpr-wam | 🟡 Being replaced | develop | ECS (Docker) |
| wdprt-bolt-service | Backend API | Java 11, Spring 5.2, CXF 3.4 | 🟢 Unchanged | develop | ECS (Tomcat 9) |
| bolt-admin | New Frontend | Angular 20, PrimeNG, Tailwind, Nx | 🔵 In development | main | TBD |
| bolt-docs | Documentation | Markdown | 🟢 Active | main | N/A |

## Architecture Flow

```
LEGACY: SPA (:8626) → WAM (:8625) → bolt-service (:8080)
TARGET: Angular 20 (:4200) → WebTier BFF (:8625) → bolt-service (:8080)
```

## Build Commands

| Repo | Build | Test | Serve |
|------|-------|------|-------|
| wdprt-bolt-admin-spa | `npm run build` | `npm test` | `npm run serve` |
| wdprt-bolt-admin-wam | `npm run build` | `npm test` | `npm start` |
| wdprt-bolt-service | `mvn clean install` | `mvn test` | Docker compose |
| bolt-admin | `nx build` | `nx test` | `nx serve` |

## Git Host
All repos on github.disney.com under WDPR-Resort-Sales org.
