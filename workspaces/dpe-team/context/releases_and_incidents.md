# Releases & Incident Investigation

## Release Tracking

DPE releases are tracked on MyWiki:
- **Release Calendar (root page):** https://mywiki.disney.com/spaces/DPE/pages/945293861/DPE+Release+Calendar
- Child pages contain per-environment deployment details, versions, and schema requirements

## Incident Investigation Protocol

When a user reports an error after a deployment:

1. **Ask for**: error message, environment, and which release was just deployed
2. **Read the release page** from the Release Calendar (delegate to `story_analyzer_agent` for MyWiki access)
3. **Pull the diff** between backout and deploy versions to find what changed
4. **Trace the error** in the repo — find the throw site, call chain, and which toggle/config controls the path
5. **Correlate** with schema requirements — if code expects a newer schema, check if DB was migrated

### Prompt pattern for fast resolution

> "After deploying [service] [version] to [environment], we're getting `[error message]`. Previous version was [old version]. What in the diff could cause this?"

## Schema Versions

Schema migrations live in: `https://github.disney.com/WDPR-SPS/Dynamic-Pricing-Engine-DataService/tree/develop/data-model/dpe/`

**Critical rule:** Schema must be applied BEFORE deploying service versions that depend on it. Deploying code without its required schema causes runtime errors (e.g., missing pricingConfig, unknown columns).

## DPE Service Toggles (known)

| Toggle | Service | Default | Purpose |
|--------|---------|---------|---------|
| `dpe.functional-pipeline-enabled` | Calculator | `true` | Routes to functional pipeline vs legacy ProductAssemblyService |
| `dpe.enable-bundle-closure-hierarchy-approach` | Calculator | `false` | Closure table vs recursive CTE for product hierarchy |
| `dpe.enable-redis-cache` | Calculator | `false` | Redis caching layer |
| `isPackagePricingUIEnabled` | Admin UI | `false` | Package pricing calendar/list/breakdown views |

> **Note:** This table is a quick-reference snapshot. Source of truth: Nimbus config. Verify with `get_nimbus_settings_all_and_compare_file.py`.

## Verification Scripts

Repo: `https://github.disney.com/WDPR-SPS/dpe-admin-tools`

| Script | Purpose | Use case |
|--------|---------|----------|
| `get_version_all_html.py` | Gets deployed service versions across all environments | Cross-check deployed versions vs release page |
| `get_nimbus_settings_all_and_compare_file.py` | Gets Nimbus/C3PO env variables and compares across environments | Verify toggle values, check if config was applied |
| `get_lambda_settings.py` | Gets Lambda function configurations | Check lambda env vars and versions |

### During incident investigation

1. Run `get_version_all_html.py` to confirm which version is actually deployed (vs what the release page says)
2. Run `get_nimbus_settings_all_and_compare_file.py` to verify toggle values on the affected environment
3. Compare against the release page to detect mismatches (e.g., schema not applied, toggle not set)
