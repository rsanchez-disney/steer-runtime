# Enterprise Memory Bank — Assessment

**Date:** April 7, 2026
**Status:** Proposal Review
**Author:** Ricardo Sanchez (steer-runtime maintainer)

---

## Proposal Summary

A 5-layer Enterprise Memory Bank for Walt Disney World:

1. **Shared Knowledge** — Enterprise architecture, domain glossary, API standards, security/compliance, environments. Read-only foundation inherited by all.
2. **Service Banks** — One per backend service (Cart, Order, PEOS, EVAS, CME, etc.). Contains contracts, architecture, endpoints, patterns. Shared across teams.
3. **Project Banks** — One per initiative (TEP3, DLR Dynamic Room Pricing, Bolt, Mobile, Config Studio). Team-owned with overview, plans, diagrams.
4. **Channel Banks** — One per sales channel (Digital/DTC, TTC, UAD, Bolt). Flows, channel-specific contracts, error handling.
5. **Templates & Tooling** — Bootstrap new banks quickly with project/service templates and validation scripts.

**Key principle:** Projects reference Services and Channels (no duplication). Everyone inherits Shared Knowledge.

---

## Mapping to steer-runtime

### What works today

| Proposed Layer | steer-runtime Equivalent | Status |
|---|---|---|
| Shared Knowledge | `shared/context/` (golden_rules.md, project_mappings.md) + `common/rules/` | ✅ Works — agents load these as `resources` |
| Project Banks | `workspaces/<team>/projects/<project>/.kiro/rules/memory-bank/` | ✅ Works — TEP3 already follows this pattern |
| Templates | `common/memory-bank-templates/` + `common/templates/specs/` | ✅ `koda init-memory` scaffolds from these |
| Workspace inheritance | `workspace.json` → `extends` field | ✅ Child workspaces inherit parent config |

### What needs work

| Proposed Layer | Gap | Effort |
|---|---|---|
| Service Banks | No shared cross-team service context directory | Medium |
| Channel Banks | No channel-specific context directory | Medium |
| Auto-resolution | `project.yaml` doesn't resolve service/channel references at install time | Medium |
| Shared Knowledge (expanded) | Missing enterprise architecture, glossary, environments docs | Low (content only) |

---

## Recommended Implementation

### Phase 1 — Directory Structure (no code changes)

Add content to the existing repo. Agents can reference these via `file://` resources immediately.

```
steer-runtime/
├── shared/
│   ├── context/                         # Shared Knowledge (exists)
│   │   ├── golden_rules.md              # ✅ exists
│   │   ├── project_mappings.md          # ✅ exists
│   │   ├── enterprise_architecture.md   # 🆕 service map, infra topology
│   │   ├── domain_glossary.md           # 🆕 GLX, CAP, PEOS, CME definitions
│   │   ├── api_standards.md             # 🆕 conventions, error codes, naming
│   │   ├── security_compliance.md       # 🆕 PCI, PII, auth patterns
│   │   └── environments.md              # 🆕 URLs, feature flags, configs
│   │
│   └── services/                        # Service Banks (🆕)
│       ├── cart-service/
│       │   ├── api-contracts.md
│       │   ├── architecture.md
│       │   ├── endpoints.md
│       │   └── patterns.md
│       ├── order-service/
│       │   └── ...
│       ├── order-vas/
│       ├── peos/
│       ├── evas-tms/
│       ├── lexvas-tpac/
│       ├── cme-inventory/
│       ├── revenue-recognition/
│       └── _template/                   # Service template for scaffolding
│           ├── api-contracts.md
│           ├── architecture.md
│           ├── endpoints.md
│           └── patterns.md
│
├── channels/                            # Channel Banks (🆕)
│   ├── digital-dtc/
│   │   ├── flows.md
│   │   ├── channel-contracts.md
│   │   └── error-handling.md
│   ├── ttc/
│   ├── uad/
│   ├── bolt/
│   └── _template/
│       ├── flows.md
│       ├── channel-contracts.md
│       └── error-handling.md
│
├── workspaces/                          # Project Banks (exists)
│   ├── payments-core/                   # Parent workspace
│   ├── tep3/                            # Project workspace
│   │   ├── workspace.json
│   │   └── projects/
│   │       └── tep3-standalone/
│   │           └── .kiro/rules/memory-bank/
│   ├── dlr-dynamic-pricing/
│   ├── bolt-bulk-tickets/
│   └── config-studio/
```

### Phase 2 — project.yaml Integration

Extend `project.yaml` to declare service and channel dependencies:

```yaml
# project.yaml for TEP3 Standalone Tickets
name: tep3-standalone
stack:
  backend: java-spring
  frontend: angular
  mobile: flutter

# 🆕 Service and channel references
services:
  - cart-service
  - order-service
  - peos
  - evas-tms

channels:
  - digital-dtc
  - ttc

jira:
  project: TEP3
  board: 1234
```

**What changes in Koda:**

`koda install` and `koda sync` would read `project.yaml`, find the declared `services` and `channels`, and copy the relevant `.md` files into the project's context:

```
~/.kiro/context/
├── golden_rules.md              # from shared/context/
├── project_mappings.md          # from shared/context/
├── svc-cart-service.md          # from shared/services/cart-service/ (merged)
├── svc-order-service.md         # from shared/services/order-service/
├── svc-peos.md                  # from shared/services/peos/
├── ch-digital-dtc.md            # from channels/digital-dtc/ (merged)
└── ch-ttc.md                    # from channels/ttc/
```

Agents see a flat context folder — no nested directories to navigate.

### Phase 3 — Workspace Composition

Workspaces declare which services and channels their projects typically use:

```json
{
  "name": "tep3",
  "extends": "payments-core",
  "profiles": ["dev-core", "dev-web", "dev-mobile"],
  "services": ["cart-service", "order-service", "peos", "evas-tms"],
  "channels": ["digital-dtc", "ttc"],
  "default_agent": "orchestrator"
}
```

Running `koda workspace apply tep3` installs profiles + copies service/channel context automatically.

---

## Pros & Cons

### Pros

| # | Benefit |
|---|---------|
| 1 | **Eliminates duplication** — Service knowledge lives in one place. When Cart Service's API changes, one update propagates to every project that references it. Today each team maintains its own copy. |
| 2 | **Faster onboarding** — New project = create workspace + declare services/channels. No need to manually assemble context from scratch. |
| 3 | **Agents get richer context** — Instead of a generic memory bank, agents see the actual service contracts and channel flows relevant to the project. Better answers, fewer hallucinations. |
| 4 | **Scales with the org** — Adding a new service or channel is one PR. Every workspace that references it gets the update on next sync. |
| 5 | **Composable** — Teams pick exactly which services and channels they need. A mobile team working on Flutter + Cart + DTC gets different context than a backend team working on PEOS + TTC. |

### Cons

| # | Risk | Mitigation |
|---|------|------------|
| 1 | **Content maintenance burden** — Service banks are only valuable if kept current. Stale docs are worse than no docs (agents confidently give wrong answers). | Assign owners per service bank. Add `last-updated` headers. `koda doctor` flags stale banks (>60 days). |
| 2 | **Repo size growth** — Each service bank adds 4-6 markdown files. With 15+ services and 4+ channels, that's 80-100 new files. | Keep it markdown-only. No swagger specs, no postman collections — reference those by URL. |
| 3 | **Context window pressure** — If a project references 6 services and 2 channels, that's 30+ files loaded into agent context. May hit token limits on complex tasks. | Phase 2 flattens each service into a single merged file (`svc-cart-service.md`). Agents see 6-8 files, not 30. |
| 4 | **Coordination overhead** — Who approves changes to a shared service bank? A bad merge could affect multiple teams. | `CODEOWNERS` per service directory. PR reviews required. Same model as `shared/context/` today. |
| 5 | **Adoption friction** — Teams need to learn the new `services`/`channels` fields and restructure their project.yaml. | Phase 1 requires zero changes to existing workflows. Phase 2-3 are opt-in. Teams adopt when ready. |

---

## Backward Compatibility

**Phase 1 — Fully backward compatible (zero risk)**

- Adds new directories (`shared/services/`, `channels/`) alongside existing ones
- No existing files are modified or moved
- No code changes — existing `koda install`, `koda sync`, `koda workspace apply` work exactly as before
- Teams that don't use service/channel banks see no difference

**Phase 2 — Backward compatible (opt-in)**

- Adds optional `services` and `channels` fields to `project.yaml`
- If fields are absent (all existing projects), behavior is unchanged
- `koda install` only resolves service/channel references when the fields are present
- Schema validation accepts both old and new formats

**Phase 3 — Backward compatible (opt-in)**

- Adds optional `services` and `channels` fields to `workspace.json`
- Existing workspaces without these fields work exactly as before
- `koda workspace apply` only copies service/channel context when declared

**Breaking changes: None.** At every phase, the default behavior is identical to today.

---

## Workspace-Scoped Enablement

This is designed to be enabled per-workspace, not globally. Each workspace controls its own service/channel references:

```json
// workspaces/tep3/workspace.json — OPTS IN to service/channel banks
{
  "name": "tep3",
  "extends": "payments-core",
  "profiles": ["dev-core", "dev-web", "dev-mobile"],
  "services": ["cart-service", "order-service", "peos"],
  "channels": ["digital-dtc", "ttc"]
}
```

```json
// workspaces/dta-team/workspace.json — UNCHANGED, no service/channel banks
{
  "name": "dta-team",
  "extends": "payments-core",
  "profiles": ["dev-core", "dev-web"]
}
```

**What this means in practice:**

| Scenario | What happens |
|---|---|
| Team runs `koda workspace apply tep3` | Installs profiles + copies cart-service, order-service, peos, digital-dtc, ttc context |
| Team runs `koda workspace apply dta-team` | Installs profiles only — no service/channel context (same as today) |
| Team adds `services: [cart-service]` to their workspace | Next `koda sync` picks up cart-service context. No other workspace affected. |
| Team removes `services` field | Next `koda sync` stops copying service context. Existing files remain until `koda clean`. |

**Per-project override is also possible** via `project.yaml`:

```yaml
# A project within the tep3 workspace that only needs Cart Service
services:
  - cart-service
channels: []  # No channel context needed for this specific project
```

Project-level declarations override workspace-level when both exist.

---

## Concerns & Recommendations

### 1. Keep banks lightweight — markdown only

Swagger specs, Postman collections, and diagrams should be **referenced by URL**, not checked into steer-runtime. What agents need is the `.md` summary — not a 5,000-line OpenAPI spec.

```markdown
<!-- In cart-service/api-contracts.md -->
## Cart Service API

Full spec: https://swagger.disney.com/cart-service/v2

### Key endpoints
- `POST /carts` — Create cart
- `PUT /carts/{id}/items` — Add/update items
- `DELETE /carts/{id}` — Cancel cart
...
```

### 2. Assign service bank owners

Each service bank needs an owner who keeps it current. Suggestion: add a `CODEOWNERS`-style header:

```markdown
<!-- owner: @cart-team -->
<!-- last-updated: 2026-04-01 -->
```

If a service bank hasn't been updated in 60+ days, `koda doctor` could flag it as stale.

### 3. Don't over-nest at runtime

The 5-layer model is great for **organizing source content**. But at runtime, agents work best with a flat `context/` folder. The install process should flatten:

```
Source (organized):                    Runtime (flat):
shared/services/cart-service/    →     ~/.kiro/context/svc-cart-service.md
channels/digital-dtc/            →     ~/.kiro/context/ch-digital-dtc.md
shared/context/api_standards.md  →     ~/.kiro/context/api_standards.md
```

### 4. Start with content, not tooling

Phase 1 requires zero code changes. The team member can:

1. Create `shared/services/cart-service/` with the initial `.md` files
2. Create `channels/digital-dtc/` with flow docs
3. Add the expanded shared knowledge files (glossary, architecture, etc.)
4. Reference them manually in agent configs or `project.yaml`

The Koda automation (Phase 2-3) can follow once the content proves valuable.

---

## Effort Estimate

| Phase | What | Effort | Dependency |
|---|---|---|---|
| **Phase 1** | Directory structure + initial content | 1-2 days | None — start immediately |
| **Phase 2** | `project.yaml` schema + `koda install` resolution | 2-3 days | Phase 1 content exists |
| **Phase 3** | Workspace `services`/`channels` fields + `koda workspace apply` | 1 day | Phase 2 |
| **Phase 4** | `koda doctor` staleness checks + validation scripts | 1 day | Phase 1 |

---

## Decision

- [ ] Approve Phase 1 — create directory structure and initial content
- [ ] Approve Phase 2 — extend project.yaml and Koda install
- [ ] Defer — needs more discussion
- [ ] Reject — alternative approach preferred

---

*Assessment by steer-runtime maintainer. For questions: `koda chat --agent architecture_agent`*
