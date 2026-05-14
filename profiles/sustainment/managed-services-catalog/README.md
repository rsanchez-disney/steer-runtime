# ADM Managed Services Catalog

Uniform application metadata for 20+ sustainment studios. Agents and teams use this catalog to resolve observability data, escalation paths, and infrastructure context during incident triage, root cause analysis, and stability validation.

## Structure

```
managed-services-catalog/
├── _schema/app-catalog.schema.json   # JSON Schema for validation
├── _templates/
│   ├── app-template.yaml             # Blank template — copy this
│   └── docs/                         # Starter markdown templates
│       ├── troubleshooting.md
│       ├── business-rules.md
│       └── runbook.md
├── _examples/parks-ticketing.yaml    # Fully populated reference
├── _docs/
│   ├── agent-consumption-patterns.md # How agents use the catalog
│   ├── catalog-structure-tree.txt    # Field reference with types and examples
│   └── directory-structure-tree.txt  # Directory layout reference
└── studios/                          # All studio folders live here
    ├── studio-<team-name>/           # One folder per studio
    │   ├── BAPPXXXX-App_Name/        # One self-contained folder per app
    │   │   ├── app.yaml              # Structured catalog (YAML)
    │   │   ├── troubleshooting.md    # App-level troubleshooting
    │   │   ├── business-rules.md     # App-level business rules
    │   │   └── runbook.md            # App-level runbook
    │   └── BAPPYYYY-Other_App/
    │       ├── app.yaml
    │       └── ...
    ├── studio-mars/
    │   ├── BAPP0012680-Booking_Service/
    │   │   ├── app.yaml
    │   │   ├── troubleshooting.md
    │   │   ├── business-rules.md
    │   │   └── runbook.md
    │   └── ...
    └── ...
```

> **Note:** Validation tooling (schema validator, catalog loader) lives separately in the CI pipeline — not inside this catalog. See [CI Validation](#ci-validation) below.

## Adding a New Application

1. Copy the template into a new app folder:
   ```bash
   mkdir studios/studio-<your-team>/BAPPXXXX-App_Name
   cp _templates/app-template.yaml studios/studio-<your-team>/BAPPXXXX-App_Name/app.yaml
   ```

2. Copy the markdown starters into the same folder:
   ```bash
   cp _templates/docs/*.md studios/studio-<your-team>/BAPPXXXX-App_Name/
   ```

3. Fill in the YAML with your application's structured data. Delete any observability sections that don't apply.

4. Fill in the markdown docs with your team's troubleshooting steps, business rules, and runbook procedures. These are free-form — use whatever structure works for your app. For complex components, create component-specific docs (e.g., `<app-name>/<component-name>-troubleshooting.md`).

5. Update the `docs` section in the YAML to point to your markdown files:
   ```yaml
   # App-level (paths relative to the app folder)
   docs:
     troubleshooting: "troubleshooting.md"
     business_rules: "business-rules.md"
     runbook: "runbook.md"

   # Component-level (only if needed)
   components:
     - component_name: "my-complex-api"
       docs:
         troubleshooting: "my-complex-api-troubleshooting.md"
         runbook: "my-complex-api-runbook.md"
   ```

6. Validate your YAML file (see below).

7. Submit a PR.

## YAML vs Markdown — What Goes Where

| YAML (structured, validated) | Markdown (free-form, per-team) |
|------------------------------|-------------------------------|
| Splunk indexes, SPL queries | "When you see error X, check Y first" |
| AppD/NewRelic/Datadog IDs | "This service degrades during park opening hours" |
| Cloud infra (ECS, region, cluster) | "Scaling is manual — contact @bob before scaling down" |
| Health check URLs | "Health check passes but orders may still be stuck in DLQ" |
| Escalation contacts | "Escalate to vendor Z if the issue is in the payment gateway" |
| ServiceNow CI/assignment group | "This CI covers 3 microservices — check all of them" |

Agents use the YAML to *execute* (run queries, hit endpoints) and the markdown to *reason* (understand context, match known patterns).

## Validation

This catalog lives in `steer-runtime/profiles/sustainment/` where agents read it directly. Validation tooling runs **separately in CI** — not inside the agent profile.

### CI Validation

The validation scripts live in a separate CI directory (e.g., `managed-services-catalog-ci/`):

```
managed-services-catalog-ci/
├── catalog-loader.js             # Utility for programmatic catalog access
├── validate-catalog.js           # Schema validation script
└── package.json                  # Dependencies: yaml, ajv, ajv-formats
```

### Prerequisites

```bash
cd managed-services-catalog-ci
npm install yaml ajv ajv-formats
```

### Run Validation

```bash
node validate-catalog.js /path/to/managed-services-catalog
```

Output:

```
✅ studios/studio-mars/BAPP0012680-Booking_Service.yaml
✅ studios/studio-mars/BAPP0012683-Cart_Service.yaml
❌ studios/studio-streaming/playback.yaml
   /components/0 — must have required property 'component_type'

3 files checked: 2 passed, 1 failed
```

The script exits with code `1` if any file fails — suitable for CI pipelines.

### CI Integration (GitHub Actions)

```yaml
- name: Validate Managed Services Catalog
  run: |
    cd managed-services-catalog-ci
    npm ci
    node validate-catalog.js ../managed-services-catalog
```

## How Agents Use This Catalog

This catalog lives at `steer-runtime/profiles/sustainment/managed-services-catalog/`. Agents read files directly — no loader library needed at runtime.

**Agent resolution flow:**
1. Agent receives a trigger (INC CI name, app_name, or BAPP ID)
2. Agent searches `studios/**/app.yaml` files (BAPP ID is in the folder name)
3. Agent reads the matching `app.yaml` as structured context
4. Agent extracts what it needs (SPL queries, health URLs, escalation info)
5. Agent executes via MCP tools (splunkweb, etc.)

**Example — rca_agent receiving INC with CI "Booking Service":**
- Searches `studios/**/app.yaml` for matching `servicenow.configuration_item`
- Finds `studios/studio-mars/BAPP0012680-Booking_Service/app.yaml`
- Reads `splunk.error_spl` from the relevant component
- Executes the SPL via splunkweb MCP with a time window appended
- Reads `troubleshooting.md` from the same folder for known failure patterns

For detailed per-agent consumption patterns, see `_docs/agent-consumption-patterns.md`.

## Quick Reference — Required vs Optional Fields

```yaml
bapp_id: "BAPP-1234"              # REQUIRED
app_name: "my-app"                # REQUIRED (kebab-case)
full_name: "My Application"       # optional
description: "..."                # optional

support_studio: "My Team"         # REQUIRED
escalation_channel: "#channel"    # optional

servicenow:
  configuration_item: "My App CI" # REQUIRED
  assignment_group: "My Group"    # REQUIRED

components:
  - component_name: "my-api"      # REQUIRED
    component_type: "api"         # REQUIRED
    splunk:                        # At least one observability block REQUIRED
      index: "my_index"
      base_spl: >-
        index=my_index sourcetype=my_source
```

Everything else is optional — fill in what applies to your app.

## Companion Docs (Markdown)

The `docs` section in the YAML points to free-form markdown files where teams document operational knowledge. Docs can be referenced at two levels:

**App-level** — covers the application as a whole:
```yaml
docs:
  troubleshooting: "troubleshooting.md"
  business_rules: "business-rules.md"
  runbook: "runbook.md"
```

**Component-level** (optional) — for components complex enough to warrant their own docs:
```yaml
components:
  - component_name: "payments-api"
    component_type: "api"
    docs:
      troubleshooting: "payments-api-troubleshooting.md"
      runbook: "payments-api-runbook.md"
    # ... observability fields ...
```

Agent resolution: if a component has its own `docs`, agents use those. Otherwise they fall back to the app-level docs.

Example file layout for an app with 2 components (one with its own docs, one without):

```
studios/studio-parks-commerce/parks-ticketing/
├── catalog.yaml
├── troubleshooting.md                  ← app-level (general + simple components)
├── business-rules.md                   ← app-level
├── runbook.md                          ← app-level
├── ticketing-api-troubleshooting.md    ← component-specific
└── ticketing-api-runbook.md            ← component-specific
```

Starter templates are in `_templates/docs/`. Teams can add additional markdown files beyond the standard three — just reference them in the `docs` section.

Markdown files are **not schema-validated** — teams have full freedom of format. The only requirement is that the path in the YAML correctly points to the file.
