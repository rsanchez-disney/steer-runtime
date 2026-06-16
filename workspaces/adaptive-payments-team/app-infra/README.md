# APP Infrastructure

> Extends [app-team](../app-team/) — inherits dev-core, qa, shared rules and context.

Shared libraries, stream handlers, key management, and cross-cutting services.

## Repos

| Repo | Tech | Description |
|------|------|-------------|
| wdpr-payments-ref | Java | Shared utilities, caching, audit |
| wdpr-payments-model | Java | Shared DTOs, enums, constants |
| app-common-keystore | Java | Encryption keys, certificates |
| wdpr-app-crypto-key-mgmt | Java | Crypto key management |
| wdpr-app-admin-service | Java | Configuration, monitoring |
| wdpr-app-payment-stream-handler | Java | Payment event streams |
| wdpr-app-payment-event-handler | Java | Payment event handling |

## Setup

```bash
koda workspace apply app-infra
koda mcp-install
```
