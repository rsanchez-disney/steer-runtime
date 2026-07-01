---
inclusion: fileMatch
fileMatchPattern: ["**/*Controller.java", "**/*Resource.java", "**/*Adapter.java", "**/*Gateway.java", "**/*Client.java", "**/*Repository.java", "**/*Dao.java", "**/*Security*.java", "**/*Auth*.java", "**/*Xml*.java", "**/*Parser*.java", "**/*Filter.java", "**/*Interceptor.java", "**/*Crypto*.java", "**/*Deserializ*.java", "**/application*.properties", "**/application*.yml"]
description: Secure coding principles - OWASP, input validation, cryptography
---

# Java Security Guidelines

> **Related Rules**:
> - `dlp/security-pii.mdc` - PII protection, data masking, Vault secrets, data handling
> - `dlp/authorization.mdc` - authz/OneId authentication
> - `dlp/foundation-usage.mdc` - foundation-web security

---

## What IS vs IS NOT a Security Issue

| ✅ IS a Security Issue | ❌ IS NOT a Security Issue |
|------------------------|---------------------------|
| XXE vulnerability | Field injection (`@Autowired`) |
| SQL/Command injection | Missing constructor injection |
| Hardcoded secrets | Code in "security-sensitive" file |
| XSS (Cross-Site Scripting) | Using `@Value` on fields |
| SSRF | Missing `@Cacheable` |
| Insecure deserialization | Duplicate code |
| Missing authentication | JUnit 4 vs JUnit 5 |
| Weak cryptography (MD5, SHA-1) | Empty catch blocks |

**Rule**: If it doesn't allow an attacker to exploit the system, it's not a security issue.

---

## Core Security Principles

| Principle | Action |
|-----------|--------|
| **Never commit** | Passwords, API keys, credentials |
| **Always validate** | User input, API responses, file uploads |
| **Use parameterized** | SQL queries, LDAP queries |
| **Use HTTPS** | All external calls |
| **Use environment** | Variables for secrets |

---

## OWASP Top 10 Coverage Map

| OWASP Category | Covered In | Why There |
|---|---|---|
| A01: Broken Access Control | This rule (below) | Code-level patterns (path traversal) |
| A02: Cryptographic Failures | This rule + `dlp/security-pii.mdc` | Secrets belong in Vault, not code |
| A03: Injection | This rule (below) | SQL, Command, XSS prevention |
| A04: Insecure Design | `dlp/hexagonal-architecture.mdc` | Architecture-level concern — enforced by layer separation, port/adapter boundaries, and ArchUnit tests |
| A05: Security Misconfiguration | This rule (below) | Error disclosure, server config |
| A06: Vulnerable Components | This rule (below) | Dependency scanning |
| A07: Auth Failures | `dlp/authorization.mdc` + `dlp-configure-authorization` skill | DLP-specific OneID/JWT/OAuth2 patterns |
| A08: Insecure Deserialization | This rule (below) | Allowlists for deserialization |
| A09: Security Logging | `dlp/logging-wdpr.mdc` + `dlp-configure-wdpr-logging` skill | DLP-specific WDPR logging with PII masking, MDC correlation |
| A10: SSRF | This rule (below) | URL allowlists, internal IP blocking |

---

## A01: Broken Access Control

```java
// ✅ Path traversal prevention
Path basePath = Path.of("/uploads").toRealPath();
Path requestedPath = basePath.resolve(userInput).normalize();
if (!requestedPath.startsWith(basePath)) {
    throw new SecurityException("Path traversal attempt");
}
```

---

## A02: Cryptographic Failures

**Password hashing**: Use Argon2 (preferred) or BCrypt (cost 12+). Never MD5, SHA-1, or SHA-256 for passwords -- they're too fast for brute-force resistance. Salt is automatic with BCrypt/Argon2.

```java
// ✅ PREFERRED - Argon2 (memory-hard, PHC winner)
PasswordEncoder encoder = Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8();
// ✅ GOOD - BCrypt (cost 12+)
String hash = BCrypt.hashpw(password, BCrypt.gensalt(12));
```

> Hardcoded secrets and Vault configuration: see `dlp/security-pii.mdc`

---

## A03: Injection Prevention

**SQL**: Always use parameterized queries (`PreparedStatement`, Spring Data `@Query`) -- never concatenate user input into SQL strings.

```java
// ❌ Command Injection
Runtime.getRuntime().exec("cmd /c " + userInput);
// ✅ Use ProcessBuilder with separate args
ProcessBuilder pb = new ProcessBuilder("program", sanitizedArg);

// ❌ XSS - Never trust user input in HTML
return "<div>" + userInput + "</div>";
// ✅ Encode output
return "<div>" + HtmlUtils.htmlEscape(userInput) + "</div>";
```

---

## A06: Vulnerable Components

- Scan dependencies regularly: `mvn dependency-check:check` or `snyk test`

---

## A08: Insecure Deserialization

```java
// ❌ NEVER deserialize untrusted data directly
ObjectInputStream ois = new ObjectInputStream(untrustedInput);
Object obj = ois.readObject();  // DANGEROUS

// ✅ Use allowlist
private static final Set<String> ALLOWED = Set.of("com.myapp.dto.SafeClass");

@Override
protected Class<?> resolveClass(ObjectStreamClass osc) throws IOException {
    if (!ALLOWED.contains(osc.getName())) {
        throw new InvalidClassException("Unauthorized: " + osc.getName());
    }
    return super.resolveClass(osc);
}
```

---

## A10: SSRF Prevention

```java
// ✅ Allowlist-based URL validation
private static final Set<String> ALLOWED_HOSTS = Set.of("api.trusted.com");

public void fetchUrl(String url) {
    URI uri = URI.create(url);
    if (!ALLOWED_HOSTS.contains(uri.getHost())) {
        throw new SecurityException("Host not allowed");
    }
    // Also block internal IPs
    InetAddress addr = InetAddress.getByName(uri.getHost());
    if (addr.isLoopbackAddress() || addr.isSiteLocalAddress()) {
        throw new SecurityException("Internal addresses blocked");
    }
}
```

---

## A05: Information Disclosure — Error Messages

**Never expose internal details in error responses.** Verbose error messages are an attack vector (OWASP A05: Security Misconfiguration).

### What Attackers Learn from Detailed Errors

| Leaked Information | What Attacker Gains | Example |
|---|---|---|
| Stack traces | Class names, frameworks, versions | `at com.disney.dlpis.lodging.infrastructure.adapter.out.persistence.BookingJpaRepository.findById(...)` |
| SQL errors | Table/column names, DB type | `ERROR: column "guest_ssn" of relation "bookings" does not exist` |
| Internal paths | Server file structure | `/opt/tomcat/webapps/WDPR-DLP-IS/WEB-INF/classes/...` |
| Exception class names | Internal architecture | `com.zaxxer.hikari.pool.HikariPool$PoolInitializationException` |
| Spring error details | Framework version, bean names | `org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'PaymentGateway'` |
| Vault/config references | Secret paths, infrastructure | `Could not resolve placeholder 'secret/oauth2.client.secret'` |

### Why This Matters

1. **Reconnaissance** — Attackers map the internal architecture (frameworks, DB, class structure) to find known CVEs
2. **Targeted attacks** — Knowledge of table/column names enables precise SQL injection attempts
3. **Credential discovery** — Config errors may leak Vault paths, env variable names, or partial secrets
4. **Exploit chaining** — Internal class names reveal which libraries are used, allowing version-specific exploits

### Rules

```java
// ❌ CRITICAL — Stack trace exposed to client
@ExceptionHandler(Exception.class)
public ResponseEntity<String> handle(Exception e) {
    return ResponseEntity.status(500).body(e.getMessage());       // Leaks internals
}

// ❌ CRITICAL — Full exception serialized to response
return ResponseEntity.status(500).body(Map.of(
    "error", e.getClass().getName(),      // Leaks class name
    "message", e.getMessage(),            // May contain SQL, paths
    "stackTrace", e.getStackTrace()       // Leaks everything
));

// ✅ CORRECT — Generic message to client, full details in logs only
@ExceptionHandler(Exception.class)
public ResponseEntity<ProblemDetail> handle(Exception e) {
    log.error("Unhandled exception", e);  // Full details stay in server logs
    ProblemDetail problem = ProblemDetail.forStatus(500);
    problem.setTitle("Internal Server Error");
    problem.setDetail("An unexpected error occurred. Please contact support.");
    return ResponseEntity.status(500).body(problem);
}
```

### What Foundation Does Right

Foundation's `AbstractProblemDetailExceptionHandler` already provides safe defaults:
- **Business exceptions** (4xx): Returns the exception message (developer-controlled, safe)
- **Unexpected exceptions** (5xx): Returns a generic message, logs the full stack trace server-side

**Your responsibility**: Ensure custom exception handlers follow the same pattern — never pass `e.getMessage()` or `e.getStackTrace()` to the client for unhandled/unexpected exceptions.

### Configuration

```properties
# ❌ NEVER enable in production — exposes full stack traces
server.error.include-stacktrace=never
server.error.include-message=never
server.error.include-binding-errors=never
server.error.include-exception=false

# ✅ Spring Boot defaults are safe (all disabled) — don't override them
```

### What IS Safe to Return

| Safe for Client | NOT Safe for Client |
|---|---|
| "Payment not found" (business error) | `java.sql.SQLException: Table 'payments' doesn't exist` |
| "Invalid email format" (validation) | `org.hibernate.exception.ConstraintViolationException: ...` |
| "Service temporarily unavailable" | `java.net.ConnectException: Connection refused to payment-service:8443` |
| RFC 7807 ProblemDetail with title + generic detail | Stack traces, class names, SQL errors, config paths |

---

## ReDoS Prevention (Regex Denial of Service)

Malicious input can cause catastrophic backtracking in regex with nested quantifiers:

```java
// ❌ VULNERABLE - nested quantifiers → exponential time on crafted input
Pattern.compile("(a+)+$");
Pattern.compile("([a-zA-Z]+)*");

// ✅ SAFE - possessive quantifiers (no backtracking)
Pattern.compile("(a++)$");
Pattern.compile("([a-zA-Z]++)*");
```

**Rules:**
- **No nested quantifiers** (`(a+)+`, `([a-z]+)*`) — use possessive (`++`) or atomic groups (`(?>...)`)
- **Limit input length** before applying regex — reject inputs > max expected size

> Regex correctness checks (boundaries, lookaheads, back references, Unicode) are in `java/clean-code.mdc`.

---

## XML Security (XXE)

**All XML parsers must disable external entities** — DocumentBuilderFactory, SAXParserFactory, XMLInputFactory, TransformerFactory:

```java
// ✅ DocumentBuilderFactory — set these features on ALL DOM/SAX parsers
DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
factory.setXIncludeAware(false);

// ✅ XMLInputFactory (StAX) — disable DTD and external entities
XMLInputFactory staxFactory = XMLInputFactory.newInstance();
staxFactory.setProperty(XMLInputFactory.SUPPORT_DTD, false);
staxFactory.setProperty(XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES, false);

// ✅ TransformerFactory — block external DTD/stylesheet access
TransformerFactory tf = TransformerFactory.newInstance();
tf.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
tf.setAttribute(XMLConstants.ACCESS_EXTERNAL_STYLESHEET, "");
```

---

## SSL/TLS Security

| Rule | Detail |
|------|--------|
| Never trust all certificates | No empty `X509TrustManager.checkServerTrusted()` |
| Never disable hostname verification | No `setDefaultHostnameVerifier((h,s) -> true)` |
| Use TLS 1.2+ only | No `SSLv3`, `TLSv1`, `TLSv1.1` |

---

## Security Anti-Patterns (quick scan)

| Anti-Pattern | What to look for | OWASP / category |
|---|---|---|
| String-concat SQL | `"SELECT ... " + userId` | Injection |
| Deserialization of untrusted types | `ObjectInputStream`, YAML `!!` tags | Insecure deserialization |
| Path traversal | `new File(base, userInput)` without canonical check | Broken access control |
| SSRF | HTTP client hits URL from user input without allowlist | SSRF |
| Weak crypto | `DES`, `RC4`, `MD5` for security properties | Cryptographic failures |
| Regex DoS | Nested quantifiers on unbounded input | ReDoS |
| Missing auth on actuator or management | `/actuator/**` open | Security misconfiguration |

---

## Security Code Review Checklist

- [ ] No hardcoded secrets or credentials
- [ ] SQL queries use parameterized statements
- [ ] User input is validated and sanitized
- [ ] Authentication/authorization implemented
- [ ] HTTPS enforced
- [ ] Dependencies scanned for vulnerabilities
- [ ] Error messages don't expose internals (no stack traces, SQL errors, class names, config paths to client)
- [ ] `server.error.include-stacktrace=never` (Spring Boot default — verify not overridden)
- [ ] Custom `@ExceptionHandler` for 5xx returns generic message, logs full details server-side
- [ ] Rate limiting on sensitive endpoints (Foundation `RateLimitFilter` for global, `PerIdentityRateLimitFilter` for per-caller — see `dlp-configure-rate-limiting` skill)
- [ ] Deserialization uses allowlists
- [ ] URLs validated against allowlists (SSRF)
- [ ] XML parsing disables external entities (XXE)
- [ ] SSL/TLS uses 1.2+ with cert verification
- [ ] Passwords use BCrypt/Argon2
- [ ] Reflection/class loading uses allowlists
- [ ] Regex: no nested quantifiers (ReDoS), input length limited before matching
