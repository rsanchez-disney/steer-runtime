# OWASP Top 10 Assessment Guide

## Categories & POS Platform Checks

| Category | What to Check in POS |
|----------|---------------------|
| A01 Broken Access Control | Auth checks on Connect API endpoints, role validation, gRPC auth |
| A02 Cryptographic Failures | Weak algorithms, plaintext credential storage, FiPay token handling |
| A03 Injection | SQL in CodeIgniter models, gRPC input parsing, LDAP queries |
| A04 Insecure Design | Missing rate limiting on API, no abuse guards on payment endpoints |
| A05 Security Misconfiguration | Debug mode in prod, default credentials, verbose error responses |
| A06 Vulnerable Components | Outdated Composer/npm/Go packages (see dependency check) |
| A07 Auth Failures | Session management, JWT/token handling, Disney SSO integration |
| A08 Data Integrity | Unsigned updates, untrusted deserialization, gRPC payload validation |
| A09 Logging Failures | PII in logs, missing audit trail, no trace context |
| A10 SSRF | Server-side request forgery in Connect API proxying |

## POS-Specific Security Concerns

### Payment Flows (PCI DSS Awareness)
- Card data never logged or stored in plaintext
- FiPay integration uses proper tokenization
- Payment amounts validated server-side
- Refund amounts cannot exceed original transaction

### Cast Member/Vendor PII
- Names, IDs, schedules not in debug logs
- Audit trail for data access
- Proper role-based access control

### gRPC Security
- mTLS between services
- Token validation on all endpoints
- Input size limits on proto messages
- No reflection enabled in production

### Feature Flag Security
- Flags cannot be overridden by client-side request
- Feature state not exposed in public APIs
- Admin-only access for flag management
