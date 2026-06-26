---
name: cross-repo-impact
description: Traces a feature or change across the UC stack (uc-spa → uc-api → order-vas, or cart-ui → cart-api). Use when the user asks "what breaks if I change X", "trace the impact of", "cross-repo impact", or wants to understand how a change propagates across layers.
---

# Cross-Repo Impact Analysis

Traces how a feature or data field flows across the UC/Cart stack to identify all impacted points.

---

## Step 1 — Identify the Change

Ask the user (or infer):
- What is being changed? (field name, endpoint, component, behavior)
- Which repo is the origin of the change?

---

## Step 2 — Trace Upstream

From the origin repo, trace **who provides** the data:
- If origin is `uc-spa`: trace back to `uc-api` endpoints that provide the data
- If origin is `uc-api`: trace back to `order-vas` or `cart-service` backends
- If origin is `com-uc-ui-components`: trace which properties are passed by consuming SPAs

---

## Step 3 — Trace Downstream

From the origin repo, trace **who consumes** the data:
- If origin is `uc-api`: trace forward to `uc-spa` components that render it
- If origin is `order-vas`: trace forward to `uc-api` routes that proxy it
- If origin is `uc-spa`: trace forward to analytics, polymers, or submit payloads

---

## Step 4 — Produce Impact Map

```markdown
## Impact Analysis: [change description]

### Flow
[upstream repo] →(field/contract)→ [origin repo] →(field/contract)→ [downstream repo]

*Ask the user: "Do you want me to generate a mermaid diagram?" — if yes, produce a mermaid code block that can be opened in VS Code or pasted in a .md file.*

### Impacted Points

| Repo | File | What | Risk |
|------|------|------|------|
| uc-api | src/routes/order.actions.ts | Passes field X to SPA | Medium |
| uc-spa | src/app/.../component.ts | Reads field X for display | High |
| com-uc-ui-components | src/components/.../xxx.js | Renders field X | High |

### Breaking Changes
- [describe what breaks if repos are deployed out of order]

### Recommended Approach
- [which repo to change first, deployment order]
```

---

## Step 5 — Save to Memory

Save the analysis to yax with type `architecture`.
