---
inclusion: always
---

# Security & secrets

- Never commit tokens, credentials, or internal secrets.
- Prefer env vars and documented local dev files (ignored by git).
- If you see a hard-coded token, treat as a defect and remove it.
