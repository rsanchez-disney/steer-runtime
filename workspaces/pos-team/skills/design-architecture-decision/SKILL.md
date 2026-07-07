---
name: design-architecture-decision
description: Architecture Decision Record (ADR) for POS platform — evaluates options, documents decisions with consequences for cross-service changes
agents: [pos_architecture_agent, pos_codebase_explorer_agent]
---

# Design Architecture Decision

Creates a structured Architecture Decision Record for changes that span services, introduce new patterns, or require technical alignment across the POS platform.

## Prerequisites

- Clear understanding of the problem or change being considered
- Access to relevant codebases for impact analysis

## When to Use This Skill

- New microservice extraction from the Connect monolith
- New communication pattern (sync vs async)
- Database schema changes affecting multiple services
- gRPC proto contract changes
- New technology/library adoption
- Feature flag strategy decisions
- ActivateX ↔ Connect API contract changes

## Workflow

### Step 1: Define the Context

1. What is the driver for this decision? (ticket, tech debt, scaling need)
2. What are the constraints? (timeline, backward compat, team capacity)
3. What is the current state? (how it works today)
4. What systems/services are affected?

**Agent:** `pos_architecture_agent` (direct mode)

### Step 2: Explore Impact

1. Trace dependencies across services
2. Map gRPC communication paths affected
3. Identify database schemas involved
4. Check ActivateX client impact (mobile backward compatibility)
5. Review feature flag boundaries

**Agent:** `pos_codebase_explorer_agent`

### Step 3: Evaluate Options

For each option considered:
1. **Describe** the approach
2. **Pros** — benefits, alignment with principles
3. **Cons** — risks, complexity, maintenance burden
4. **Effort** — rough sizing (S/M/L/XL)
5. **Compatibility** — backward compat assessment

### Step 4: Apply Architectural Principles

Check each option against POS platform principles (see `references/architecture-principles.md`):
- Backward compatible by default
- Feature flags for all new features
- Service boundaries are strict
- gRPC contracts are versioned
- Monolith extractions are incremental

### Step 5: Generate ADR

Use the template in `assets/adr-template.md`

**Agent:** `pos_architecture_agent`

## Anti-Patterns to Flag

When evaluating options, explicitly flag if any option introduces:
- Shared database between services
- Synchronous chains of >3 gRPC hops
- Business logic in controllers
- Feature flags without expiration plan
- Circular dependencies between services
- Direct SQL in controllers (bypassing repository layer)

## New Microservice Threshold

Only recommend a new microservice when ALL apply:
- Independent scaling requirement
- Different deployment cadence needed
- Clear domain boundary (its own aggregate)
- Team ownership is distinct

## Important Rules

- **Always check backward compatibility** with ActivateX mobile clients
- **Document ALL options considered** — even rejected ones
- **Include migration path** — how to get from here to there safely
- **Feature flags** for any user-facing change
- **Mermaid diagrams** for system interactions
