---
name: akamai-cache-purge
description: Purge Akamai CDN cache by URL, CP code, or cache tag. Validates targets, confirms with user, executes purge, and verifies propagation.
agents: [network_diagnostics_agent, cloud_ops_agent]
---

# Akamai cache purge

Safely purge Akamai CDN cache with validation, confirmation, and verification.

## When to use

- After a deployment when stale content needs clearing
- When a hotfix is deployed and CDN is serving old assets
- When a configuration change requires immediate propagation
- When a customer reports seeing outdated content

## Prerequisites

- Akamai CLI installed (`akamai` command available)
- `~/.edgerc` configured with valid credentials
- Network: `production` or `staging`

## Workflow

### Step 1: Identify purge targets

Determine what to purge based on the user's request:

| Method | When to use | Example |
|--------|-------------|---------|
| URL | Specific pages or assets | `https://www.disneyworld.com/dining/` |
| CP Code | Entire application | `12345` |
| Cache Tag | Tagged content group | `product-catalog-v2` |
| Wildcard | Path patterns | `https://www.disneyworld.com/assets/*` |

Ask the user:
1. What content needs to be purged? (URL, path pattern, or app name)
2. Which network? (production / staging)
3. Purge type: invalidate (soft, recommended) or delete (hard)?

### Step 2: Resolve details

If the user provides an app name or BAPP ID:
1. Look up in the managed services catalog for the Akamai property/CP code
2. Confirm the property name and CP code with the user

### Step 3: Preview and confirm

Show the user exactly what will be purged:

```text
⚠️ Akamai Cache Purge Preview

  Network:    production
  Type:       invalidate
  Method:     URL
  Targets:
    - https://www.disneyworld.com/dining/
    - https://www.disneyworld.com/dining/*

  Estimated propagation: ~5 seconds

Proceed? (yes/no)
```

**⏸ CHECKPOINT — User must confirm before executing**

### Step 4: Execute purge

```bash
# Invalidate by URL (recommended — allows origin to serve if stale)
akamai purge invalidate --network production \
  "https://www.disneyworld.com/dining/" \
  "https://www.disneyworld.com/dining/*"

# Invalidate by CP code (entire application)
akamai purge invalidate --network production --cpcode 12345

# Invalidate by cache tag
akamai purge invalidate --network production --tag product-catalog-v2

# Hard delete (use only when invalidate isn't sufficient)
akamai purge delete --network production \
  "https://www.disneyworld.com/dining/"
```

### Step 5: Verify propagation

Wait 10 seconds, then verify:

```bash
# Check cache status header
curl -sI "https://www.disneyworld.com/dining/" | grep -i "x-cache\|age\|x-akamai"

# Expected: X-Cache: TCP_MISS (fresh fetch from origin)
# If still X-Cache: TCP_HIT with high Age, purge hasn't propagated yet
```

Report result to user:
- Cache MISS → purge successful, fresh content being served
- Cache HIT with Age: 0-5 → purge propagating
- Cache HIT with high Age → purge may have failed, retry or escalate

### Step 6: Document

If there's a BEAN ticket:
- Add a comment with purge details (targets, network, timestamp, result)
- If this was part of a CHG, link the purge to the change ticket

## Purge types explained

| Type | Effect | When to use |
|------|--------|-------------|
| Invalidate | Marks as stale; origin re-validates on next request | Default — safe, allows origin to 304 if unchanged |
| Delete | Removes from cache entirely; next request fetches fresh | When content was deleted at origin or invalidate doesn't clear it |

## Safety rules

- Always use **invalidate** unless delete is specifically required
- Always confirm targets with the user before executing
- Never purge `/*` on a production property without team lead approval
- Production purges during peak hours require extra confirmation
- Log all purges in the BEAN ticket
