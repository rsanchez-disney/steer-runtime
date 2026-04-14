# APP Infrastructure Context

Shared libraries and cross-cutting services for the Adaptive Payment Platform.

## Repos
| Repo | Tech | Description |
|------|------|-------------|
| wdpr-payments-ref | Java | Shared library — JavaUtil, ObjectMapper, caching, audit, models |
| wdpr-payments-model | Java | Shared data models — DTOs, enums, constants |
| app-common-keystore | Java | Keystore management — encryption keys, certificates |
| wdpr-app-crypto-key-mgmt | Java | Crypto key management service |
| wdpr-app-admin-service | Java | Admin service — configuration, monitoring |
| wdpr-app-payment-stream-handler | Java | Payment event stream processing |
| wdpr-app-payment-event-handler | Java | Payment event handling |

## Key Concerns
- Shared library versioning (payments-ref, payments-model consumed by all backend services)
- Key rotation and certificate management
- Event stream reliability and ordering
- Cross-service monitoring and admin tooling
