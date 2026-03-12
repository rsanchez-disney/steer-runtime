---
inclusion: always
---

# Foundation — Config Studio conventions

## Vocabulary
- **UI**: Angular client (Payment Controls Client)
- **WebAPI**: Node gateway / BFF (Payment Controls API)
- **Backend**: Java microservice (Config Services)

## Golden rules
- Backward compatible by default.
- Prefer additive schema changes.
- Performance + reliability are features.

## Output format expectations
When asked to implement changes:
1) summarize impact surface (files/modules)
2) implement in smallest possible diff
3) ensure tests and lint are updated
4) document any important behavioral change
