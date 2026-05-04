# Severity Definitions

## Levels

### CRITICAL ⛔
Immediate risk to production safety, data integrity, or security posture. Blocks downstream execution until explicitly acknowledged.

**Criteria (any one qualifies):**
- Hardcoded secrets or credentials in source
- Known exploited CVE (CVSS ≥ 9.0) in a direct dependency
- Privilege escalation path to admin/root
- PII exposed without encryption in transit or at rest
- Destructive infrastructure drift pending (data loss risk)

### HIGH 🔴
Significant risk that should be addressed before the next release.

**Criteria:**
- OWASP Top 10 vulnerability present
- CVE with CVSS 7.0–8.9 in dependency tree
- Over-permissioned IAM role with write access
- Missing authentication on an exposed endpoint
- Circular dependency creating deployment coupling

### MEDIUM 🟡
Quality or security concern that should be addressed within the current sprint.

**Criteria:**
- Dependency 2+ major versions behind (no known CVE)
- Debug/verbose logging enabled in non-dev config
- Missing circuit breaker at service boundary
- N+1 query pattern in hot path
- License incompatibility (permissive → copyleft)

### LOW 🔵
Improvement opportunity with no immediate risk.

**Criteria:**
- Missing index on filtered column (low-traffic table)
- Unstructured log output (no JSON formatting)
- Missing distributed trace context propagation
- Configuration value that could be externalized
- Stale credential within rotation window

### INFO ℹ️
Observation for awareness. No action required.

**Criteria:**
- Compliant finding (explicit pass)
- Architecture pattern detected (documentation)
- Dependency tree statistics
- Configuration inventory

## Category Codes

| Code | Domain | Used by |
|------|--------|---------|
| OWASP_A01 | Broken Access Control | security_reviewer |
| OWASP_A02 | Cryptographic Failures | security_reviewer |
| OWASP_A03 | Injection | security_reviewer |
| OWASP_A04 | Insecure Design | security_reviewer, architecture_critic |
| OWASP_A05 | Security Misconfiguration | config_inspector |
| OWASP_A06 | Vulnerable Components | dependency_auditor |
| OWASP_A07 | Auth Failures | security_reviewer, access_analyst |
| OWASP_A08 | Data Integrity Failures | security_reviewer |
| OWASP_A09 | Logging Failures | log_analyst |
| OWASP_A10 | SSRF | security_reviewer |
| CVE | Known Vulnerability | dependency_auditor |
| LICENSE | License Incompatibility | dependency_auditor |
| STALE_DEP | Outdated Dependency | dependency_auditor |
| SECRET | Exposed Secret/Credential | config_inspector, security_reviewer |
| INSECURE_DEFAULT | Insecure Default Value | config_inspector |
| MISSING_CONFIG | Required Config Missing | config_inspector |
| OVER_PRIVILEGE | Excessive Permissions | access_analyst |
| STALE_CRED | Credential Past Rotation | access_analyst |
| ESCALATION | Privilege Escalation Path | access_analyst |
| DRIFT | Infrastructure Drift | drift_detector |
| SHADOW_RESOURCE | Unmanaged Resource | drift_detector |
| STATE_ISSUE | Terraform State Problem | drift_detector |
| GDPR | GDPR Violation | compliance_checker |
| SOC2 | SOC 2 Control Gap | compliance_checker |
| PII_EXPOSURE | PII Without Controls | compliance_checker, log_analyst |
| RETENTION | Data Retention Violation | compliance_checker |
| CIRCULAR_DEP | Circular Dependency | architecture_critic |
| COUPLING | Excessive Coupling | architecture_critic |
| LAYER_VIOLATION | Layer Boundary Crossed | architecture_critic |
| MISSING_RESILIENCE | No Circuit Breaker/Retry | architecture_critic |
| N_PLUS_1 | N+1 Query Pattern | performance_auditor |
| MISSING_INDEX | Unindexed Filter/Join | performance_auditor |
| UNBOUNDED_ALLOC | Unbounded Memory Growth | performance_auditor |
| MISSING_CACHE | Cacheable but Uncached | performance_auditor |
| UNSTRUCTURED_LOG | Non-JSON Log Output | log_analyst |
| SWALLOWED_ERROR | Exception Caught Not Logged | log_analyst |
| LOG_PII | PII in Log Fields | log_analyst |
| MISSING_TRACE | No Trace Context | log_analyst |
| COMPLIANT | All Rules Pass | compliance_checker |
