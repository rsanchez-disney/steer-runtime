# Commerce Ticketing & Checkout Workspace

L1 Support workspace for incident response, CTASK validation, stability monitoring, and GSM reporting.

## Prerequisites

This workspace depends on an external knowledge base repo that must be cloned as a sibling directory:

```bash
# From the steer-runtime root:
git clone git@github.disney.com:WDPR-COMMERCE/steer-ticketing-checkout-kb.git ../steer-ticketing-checkout-kb
```

The expected directory layout:

```
parent/
├── steer-runtime/                  ← this repo
└── steer-ticketing-checkout-kb/    ← external KB (sibling)
```

### Why?

The `rca_agent` loads its system prompt, auto-triage rules, and catalog index from `steer-ticketing-checkout-kb`. This keeps domain-specific context in a separate repo that the L1 team maintains independently.

If the KB repo is missing, the agent will fail to load its prompt and resources.

## Workspace Agents

This workspace defines one custom agent (others come from the shared `sustainment` profile):

| Agent | Purpose |
|-------|---------|
| `rca_agent` | Root cause analysis — Managed Services Catalog approach with preloaded index + auto-triage |

### Inherited from `sustainment` profile

| Agent | Purpose |
|-------|---------|
| `sustainment_orchestrator_agent` | Default — routes incidents across specialists |
| `incident_triage_agent` | Initial incident classification |
| `stability_validator_agent` | Post-fix stability checks |
| `gsm_analyst_agent` | GSM metric analysis |

## Additional Profile

| Profile | Agent |
|---------|-------|
| `dev-java` | `java_senior_agent` — Senior Java engineer for service development |
