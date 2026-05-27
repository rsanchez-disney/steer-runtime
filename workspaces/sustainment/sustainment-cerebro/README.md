# 🧠 Cerebro Sustainment Workspace

ADM PCS · DX Profile — Incident management & triage agent for daily sustainment operations.

## Apply

```bash
koda workspace apply sustainment-cerebro
```

## Catalog Context Loading

When the orchestrator agent spawns, it should pre-load BAPP context from the managed-services-catalog. This can be configured via a hook script that loads:

- `app.yaml` — Service metadata, health checks, ECS clusters
- `runbook.md` — Operational runbooks per BAPP
- `troubleshooting.md` — Known issues and diagnostic steps

Catalog path: `profiles/sustainment/managed-services-catalog/studios/studio-cerebro`

## What Does This Give You?

When you apply this workspace, your AI assistant (in Kiro, Cursor, or kiro-cli) gains knowledge about:

- **Live ServiceNow integration** — Reads INCs in real-time, searches historical similar incidents automatically
- **Live Splunk queries** — Runs error rate queries before responding
- **8 known incident patterns** with Splunk queries and resolution steps
- **Structured 8-section response format** for incident analysis
- **ServiceNow conventions** (Disney state codes, SLAs, close codes, work note format)
- **Routing table** (which AG to reassign based on root cause)
- **Architecture context** (5-layer arch, BAPPs, ECS services, databases)
- **Splunk query templates** (by SWID, GUID, Correlation ID)

### Live Data vs. Static Knowledge

| Capability | Requires MCP Tools | Fallback |
|-----------|-------------------|----------|
| Read INC details from ServiceNow | ✅ Compass MCP (ServiceNow token) | User pastes description manually |
| Search historical similar INCs | ✅ Compass MCP (ServiceNow token) | Pattern matching from context files |
| Run Splunk error checks | ✅ Compass MCP (Splunk token) | Provides query for manual execution |
| Pattern matching | ❌ Works offline | Always available |
| Work note generation | ❌ Works offline | Always available |
| Routing/reassignment | ❌ Works offline | Always available |

> **Prerequisite for live data:** Configure your ServiceNow and Splunk tokens in Koda (`koda` → `[t]`)

## How to Use It

Open chat and describe an incident. Examples:

| You type | Cerebro responds with |
|----------|----------------------|
| `Analyze: Cast Members at City Hall cannot sync profiles in DLM` | Full 8-section analysis |
| `Login loop at DLR, users stuck in redirect` | Pattern match → Login Loops + 3 steps |
| `Give me Splunk query for SWID abc-123-def-456` | Ready-to-paste SPL query |
| `Work note for a 502 on profile API` | Disney-format work note |
| `Who do I escalate a OneID issue to?` | Routing: IDY- via Jira |
| `I have a DuplicateKeyException in VAS` | Pattern match → VAS Duplicate Key |

## The 8-Section Response

Every incident analysis comes back in this structure:

1. **Incident Understanding** — What's happening (human + technical)
2. **Probable Cause** — Ranked hypotheses with service names
3. **3-Step Resolution** — Tool → Action → What to look for
4. **Related Incidents** — Historical cross-reference
5. **ServiceNow Documentation** — Copy-paste work note
6. **Reassignment Groups** — Where to route based on cause
7. **Confidence & Caveats** — How sure is the analysis
8. **Quick Actions** — Bullet list of immediate actions

## What's Included

| File | Content |
|------|---------|
| `context/team_context.md` | AG, BAPPs, architecture, databases, ECS services, routing table |
| `context/incident_patterns.md` | 8 patterns with frequency, symptoms, Splunk queries, resolution |
| `context/splunk_queries.md` | Query templates by ID type + AppDynamics thresholds |
| `context/servicenow_conventions.md` | State codes, SLAs, close codes, triage flow, bridge protocol |
| `rules/cerebro-incident-response.md` | The 8-section response format (enforced) |

## Compatibility

This workspace **adds to** your existing profiles — it doesn't replace them. If you already have `sustainment` or `ops` installed, this workspace layers on top with DX Profile-specific knowledge.

```bash
# These all work together:
koda install sustainment dev-core    # Company profiles (keep these)
koda workspace apply cerebro-sustainment  # + DX Profile incident knowledge
```

## Profiles Used

| Profile | Why |
|---------|-----|
| `sustainment` | Base incident response, AppDynamics, ServiceNow, Splunk agents |
| `ops` | Infrastructure, deployments, log analysis |
| `dev-core` | Code review, architecture context |

## FAQ

**Q: Does this replace my existing steering/profiles?**  
A: No. It adds DX Profile-specific context on top of whatever you already have.

**Q: Can I use this in Kiro IDE instead of kiro-cli?**  
A: Yes. After `koda workspace apply`, the context files are available in your `.kiro/` directory.

**Q: What if I want to add a new incident pattern?**  
A: Edit `context/incident_patterns.md` and add a new section following the same format.

**Q: Does it work in Spanish?**  
A: Yes. Cerebro responds in the language you use (EN or ES).

---

*ADM PCS · DX Profile (Cerebro) · Globant × Disney · Internal Use Only*
