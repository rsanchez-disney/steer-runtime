# Security Golden Rules — POS Platform

Based on OWASP Developer Guide principles. Apply to all code changes across Connect, microservices, and connect-frontend.

## 1. Validate All Inputs

Never trust data from ActivateX, connect-frontend, or external systems. Validate type, length, range, and format server-side.

- Whitelist allowed values over blacklisting
- Reject unexpected input — don't sanitize and proceed
- Validate at the API boundary, not just the UI

## 2. Least Privilege

Grant minimum access needed. DB users, API tokens, service accounts, and roles should only have permissions required for their function.

- Don't use admin/root credentials for application connections
- Scope API keys to specific operations
- Time-bound elevated access when needed

## 3. Defense in Depth

Don't rely on a single security control. Layer protections so a single failure doesn't compromise the system.

- Input validation + parameterized queries + output encoding
- Authentication + authorization + session management
- Network controls + application controls + monitoring

## 4. Fail Safe

When errors occur, deny access by default. Never expose internals to clients.

- Return generic error messages to users
- Never expose stack traces, SQL errors, or internal paths
- Log detailed errors server-side only
- Default to "deny" when authorization state is unclear

## 5. Encode and Escape Output

Encode all data rendered in HTML, JS, or API responses to prevent injection attacks.

- HTML-encode for views (backoffice PHP templates, React JSX)
- URL-encode for query parameters
- Use context-appropriate encoding (HTML vs JS vs SQL vs LDAP)

## 6. Parameterized Queries

Never concatenate user input into SQL. Use prepared statements or the repository layer's query builder.

- ❌ `"SELECT * FROM items WHERE id = " . $id`
- ✅ `$this->db->where('id', $id)->get('items')`
- ✅ Illuminate query builder or Eloquent ORM

## 7. Secure Authentication and Sessions

Enforce proper session management on every request.

- Session timeouts for inactive users
- Secure cookie flags: HttpOnly, Secure, SameSite
- Regenerate session ID after login
- Validate tokens on every API request, not just login

## 8. Protect Data in Transit and at Rest

TLS for all communication. Never store sensitive data in plaintext.

- gRPC channels use TLS by default — don't disable
- Never log card numbers, tokens, passwords, or PII
- Mask sensitive fields in API responses
- Use environment variables for secrets, never config files in repo

## 9. Complete Mediation

Check authorization on every request, not just at entry points.

- Verify permissions at controller AND service layer
- Don't rely on UI hiding elements as access control
- Re-validate on state-changing operations (not just reads)
- ActivateX requests must be authenticated per-call

## 10. Leverage Existing Security Components

Use the platform's existing security infrastructure. Don't roll your own.

- Use `DependencyInjection` to resolve auth/session services
- Use the existing role-based permission system
- Don't write custom crypto, hashing, or token generation
- Prefer well-maintained libraries over custom implementations
