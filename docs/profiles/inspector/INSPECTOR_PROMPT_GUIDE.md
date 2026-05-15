# Inspector Prompt Guide

**Effective prompts for multi-dimensional code and infrastructure audits**

---

## Quick Reference

| Task | Agent | Example Prompt |
|------|-------|----------------|
| Full audit | `inspector_orchestrator` | "Run full audit on the payment-service repo" |
| Security scan | `security_reviewer_agent` | "Scan for OWASP Top 10 vulnerabilities" |
| Dependency check | `dependency_auditor_agent` | "Check dependencies for CVEs and stale packages" |
| IAM review | `access_analyst_agent` | "Review IAM roles for least-privilege violations" |
| Architecture review | `architecture_critic_agent` | "Analyze module dependencies for coupling issues" |
| Config inspection | `config_inspector_agent` | "Check configs for secrets and insecure defaults" |
| Terraform drift | `drift_detector_agent` | "Compare Terraform state against plan output" |
| Compliance check | `compliance_checker_agent` | "Evaluate service against GDPR and SOC 2" |
| Log audit | `log_analyst_agent` | "Audit log sites for PII leakage and missing context" |
| Performance review | `performance_auditor_agent` | "Find N+1 queries and missing indexes" |

---

## Daily Workflows

### 1. Full Multi-Dimensional Audit

```
Run full audit on the payment-service repository.
Focus areas: security, dependencies, performance, compliance.
```

**What happens:**
1. Orchestrator fans out to 9 specialist agents in parallel
2. Each produces findings with severity (🟢 low / 🟡 medium / 🔴 critical)
3. Results are synthesized into a ranked report
4. Critical findings block; medium findings warn
5. Report saved to yax for trend tracking

---

### 2. Security Review

```
Scan the checkout module for OWASP Top 10 vulnerabilities.
Pay special attention to:
- SQL injection in query builders
- Hardcoded secrets or API keys
- Auth bypass in middleware
```

**What happens:**
1. Scans code for injection vectors, XSS, CSRF, auth flaws
2. Checks for hardcoded secrets and credential patterns
3. Reports findings with file, line, severity, and remediation

---

### 3. Dependency Audit

```
Check all dependencies for CVEs, stale packages, and license issues.
Flag anything with a known CVE in the last 6 months.
```

**What happens:**
1. Resolves full dependency tree (direct + transitive)
2. Cross-references against CVE databases
3. Flags packages not updated in 12+ months
4. Identifies license incompatibilities (GPL in MIT project, etc.)

---

### 4. IAM & Access Review

```
Review IAM roles for the cart-service ECS tasks.
Check for:
- Overly broad policies (*)
- Unused permissions
- Cross-account access without justification
```

**What happens:**
1. Analyzes IAM policies attached to service roles
2. Compares granted permissions against actual API calls
3. Flags violations of least-privilege principle
4. Suggests scoped-down policy replacements

---

### 5. Architecture Critique

```
Analyze module dependencies in the monorepo.
Check for circular imports, layer violations, and excessive coupling.
```

**What happens:**
1. Builds dependency graph from imports
2. Detects circular dependencies and suggests breaks
3. Identifies god modules with too many dependents
4. Checks layer boundaries (controller → service → repo)

---

### 6. Terraform Drift Detection

```
Compare our Terraform definitions against the latest plan output.
Flag any destructive changes or shadow resources not in code.
```

**What happens:**
1. Parses Terraform plan for create/update/destroy actions
2. Identifies resources in cloud but not in IaC (drift)
3. Flags destructive changes that need approval
4. Reports shadow resources that should be imported or deleted

---

## Tips

- The orchestrator produces the most value — use it for pre-release audits
- For targeted checks, go directly to the specialist agent
- Findings are severity-ranked: 🔴 CRITICAL blocks release, 🟡 MEDIUM needs tracking
- Results are saved to yax — ask "show audit trends" to see improvement over time
- Run before major releases or after large dependency updates
