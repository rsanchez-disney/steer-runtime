# Business Rules — WDPRD Profile JWT service

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented in MyWiki | |
| Response time (p95) | Not documented in MyWiki | |
| Error rate | Not documented in MyWiki | |

## Peak Periods

- Not documented in MyWiki

## Business Logic

- Generates client-side JSON Web Tokens after OneID login completes
- Called by AuthenticatorJS to issue session tokens
- Tokens stored in DynamoDB
- Session validation for all authenticated API calls
- Active-active across US-EAST-1 and US-WEST-2

## Dependencies

- Upstream (calls JWT): AuthenticatorJS (BAPP0248309), Profile WebAPI WAM (BAPP0253435)
- Downstream: DynamoDB (token storage)

## Impact Classification

- **Full outage:** Login flow cannot complete (no JWT issued). Session validation fails. All authenticated API calls rejected across all brands.
- **Degraded:** Increased latency in token generation; some sessions may fail to validate.
