# Skill: WebAPI bugfix triage (NestJS)

Use when triaging and fixing bugs in DCL BFF applications.

## Workflow
1. Reproduce — identify endpoint, headers, and upstream dependency
2. Check logs — look for conversation/correlation IDs, error messages
3. Check upstream — is the Content Cache / external service returning errors?
4. Check guards — is the request being rejected before reaching the service?
5. Check exception filter — is the error being properly normalized?
6. Identify root cause in controller/service/connector/parser
7. Fix with minimal diff
8. Add or update test covering the bug scenario
9. Run `npm run jest` and `npm run test:e2e`
