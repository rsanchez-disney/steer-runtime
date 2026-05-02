# Finding Schema

Every specialist agent MUST emit findings in this exact structure. The orchestrator uses this schema for deduplication, ranking, and report generation.

## FindingSet

A `FindingSet` is the output of one specialist agent run:

```json
{
  "agent": "<agent_name>",
  "target": "<service or path inspected>",
  "timestamp": "<ISO 8601>",
  "findings": [ ...Finding objects... ],
  "summary": {
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0,
    "info": 0
  }
}
```

## Finding

Each individual finding:

```json
{
  "id": "<agent_name>-<sequential_number>",
  "severity": "CRITICAL | HIGH | MEDIUM | LOW | INFO",
  "category": "<category_code>",
  "title": "<short human-readable label, max 80 chars>",
  "description": "<what was found and why it matters>",
  "location": {
    "file": "<relative path>",
    "line": <number or null>,
    "resource": "<infrastructure resource ID if not a file>"
  },
  "proposed_fix": "<concrete remediation step>",
  "references": ["<CVE IDs, policy clauses, doc links>"],
  "confidence": "HIGH | MEDIUM | LOW"
}
```

## Field Rules

| Field | Required | Notes |
|-------|----------|-------|
| id | YES | Must be unique within the FindingSet |
| severity | YES | Must be one of the 5 levels |
| category | YES | Use codes from severity_definitions.md |
| title | YES | Concise, actionable |
| description | YES | Include impact statement |
| location.file | YES* | Required for code findings |
| location.resource | YES* | Required for infra findings |
| proposed_fix | YES | Must be actionable, not generic advice |
| references | NO | Include when CVE/policy/doc exists |
| confidence | YES | HIGH = certain, MEDIUM = likely, LOW = possible |

*At least one of `file` or `resource` must be present.

## Deduplication Rules

The orchestrator deduplicates findings using:
1. Same `location.file` + `location.line` → keep highest severity, cite both agents
2. Same `category` + same `location.resource` → merge descriptions
3. Same root cause across agents → consolidate under one finding, list contributing agents
