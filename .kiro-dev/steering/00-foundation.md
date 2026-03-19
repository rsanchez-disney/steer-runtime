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

## Cross-platform tool usage
- **Never** use `findstr` to search files — it is Windows-only and has unreliable regex support.
- Use the `grep` tool for all file content searches. It works on macOS, Linux, and Windows (via Git Bash).
- Avoid platform-specific shell commands (`cmd`, `dir`, `type`, `findstr`, `icacls`) when a built-in agent tool exists.
- Prefer agent tools over shell equivalents: `grep` over `grep`/`findstr` in bash, `fs_read` over `cat`/`type`, `code` over manual AST parsing.
