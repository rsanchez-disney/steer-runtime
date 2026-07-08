---
name: run-security-scan
description: Security assessment across POS platform repos — secrets detection, dependency vulnerabilities, OWASP compliance
agents: [pos_security_scanner_agent]
---

# Run Security Scan

Comprehensive security assessment for POS platform repositories. Checks for secrets, vulnerable dependencies, and OWASP compliance.

## Prerequisites

- Access to the target repository
- Tools available: `grep`, `shell`, code analysis

## Workflow

### Step 1: Determine Scan Scope

1. Identify which repo(s) to scan:
   - Connect monolith (PHP)
   - Connect-frontend (React/TypeScript)
   - Go microservices (product_catalog, connect-fast-api, etc.)
   - ActivateX (Android/Kotlin)
2. Determine if full scan or focused (e.g., only changed files)

### Step 2: Secrets Detection

Scan for patterns indicating leaked credentials:

- API keys (`AKIA`, `sk-`, `ghp_`, `glpat-`)
- Database connection strings with passwords
- JWT tokens or signing keys
- Private keys (RSA, EC)
- .env files committed to repo
- Hardcoded URLs with credentials in query params
- AWS credentials, Disney SSO tokens
- Docker registry credentials

**Exclusions:** Test fixtures with clearly fake values, example configs with placeholder markers

### Step 3: Dependency Vulnerability Check

**PHP (Composer):** Check `composer.lock` for known CVEs, abandoned packages
**Go (modules):** Cross-reference `go.sum` with vulnerability databases
**React (npm/yarn):** Check lockfiles for CVEs, unmaintained packages
**Android (Gradle):** Check `libs.versions.toml` for deprecated SDKs

### Step 4: OWASP Top 10 Assessment

See `references/owasp-checks.md` for POS-specific checks per category.

### Step 5: POS-Specific Checks

- gRPC endpoint authentication (mTLS, token validation)
- Payment data handling (PCI DSS awareness)
- Feature flag bypass potential
- Cross-service authentication tokens
- Database migration scripts with elevated privileges
- Cast member PII in logs or error messages

### Step 6: Generate Report

```markdown
## Security Scan: {repo/scope}

### Executive Summary
{One paragraph: overall security posture, critical findings count}

### Critical Findings (Immediate Action)
| # | Category | File | Description | Remediation |

### High Risk
| # | Category | File | Description | Remediation |

### Medium Risk
| # | Category | File | Description | Remediation |

### Dependency Vulnerabilities
| Package | Version | CVE | Severity | Fix Version |

### Compliance Summary
| OWASP Category | Status | Notes |

### Score: {🟢 PASS | 🟡 NEEDS ATTENTION | 🔴 CRITICAL ISSUES}
```

**Agent:** `pos_security_scanner_agent`

## Important Rules

- **Never ignore a potential secret** — false positives are better than misses
- **Flag, don't fix** — the scan identifies issues; implementation agents fix them
- **PCI awareness** — any code touching payment flows gets extra scrutiny
- **No secrets in output** — when reporting findings, redact the actual secret value
- **Dependency issues are real risks** — even transitive dependencies matter
