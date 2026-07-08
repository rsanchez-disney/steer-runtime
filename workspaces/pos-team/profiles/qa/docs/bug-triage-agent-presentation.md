# DSP Bug Triage Agent

**Profile:** qa | **Workspace:** pos-team  
**Status:** Active | **Version:** 1.0  

---

## Overview

The DSP Bug Triage Agent automates the classification of production bugs for the Disney Selling Platform (DSP) project. It determines whether each bug belongs to **Globant** or **Disney**, assigns the correct tech stack, maps product components, and produces a structured report — all without making automatic Jira changes.

### Problem It Solves

- Release managers spent 1–2 hours per sprint reviewing 50+ new bugs manually
- Misrouted bugs caused 2–5 day delays before reaching the right team
- The agent reduces this to a **2-minute review cycle** with confidence-scored recommendations

---

## How It Works

1. **Fetch Bugs** — Queries Jira for open bugs in target releases (DSP 2.1.1–2.1.3) without `glb-prod-triage` label
2. **Post-Filter by Team** — Reads `customfield_10001` and excludes Disney teams (Heimdall, Bifrost, etc.)
3. **Classify Ownership** — Matches bug's epic link against the "DSP 2.1" filter (single source of truth for GLB scope)
4. **Assign Tech Stack** — Maps to Android, PHP, React, Go, or Data
5. **Map Product Components** — Keyword matching to 50+ product areas
6. **Generate Report** — Globant bugs only + unassigned-team bugs table

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Post-filter instead of JQL for team | `customfield_10001` doesn't support JQL operators |
| Epic link checked first | Most reliable ownership signal |
| Only Globant bugs listed | Disney bugs are their responsibility |
| No auto-updates | All changes require explicit approval |
| `glb-prod-triage` label | Marks processed bugs to avoid re-processing |

---

## Usage

```
Triage bugs for DSP 2.1.1
```

Or all releases:
```
Triage all DSP bugs
```

---

## Files

| File | Location |
|------|----------|
| Agent config | `workspaces/pos-team/profiles/qa/agents/bug_triage_agent.json` |
| Agent prompt | `workspaces/pos-team/profiles/qa/prompts/bug_triage_agent.md` |
| Scope reference | `DSP-Receipts-Scope-Differentiation.md` (root) |
