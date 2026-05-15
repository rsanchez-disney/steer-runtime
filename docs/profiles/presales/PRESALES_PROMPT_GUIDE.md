# Presales Prompt Guide

**Effective prompts for client material processing, discovery questions, and feasibility assessments**

---

## Quick Reference

| Task | Agent | Example Prompt |
|------|-------|----------------|
| Process RFP/SOW | `presales_agent` | "Process this RFP and extract key requirements" |
| Discovery questions | `presales_agent` | "Generate discovery questions for this client brief" |
| Project brief | `presales_agent` | "Create a project brief from these client materials" |
| Feasibility assessment | `presales_agent` | "Assess feasibility of this engagement" |

---

## Daily Workflows

### 1. Processing Client Materials

```
Process this RFP and extract key requirements.
Client: Acme Corp
Document: [paste or attach RFP content]

Focus on:
- Technical requirements
- Timeline constraints
- Budget indicators
- Integration points
```

**What happens:**
1. Parses document into structured markdown
2. Extracts requirements categorized by type (functional, non-functional, integration)
3. Highlights risks, ambiguities, and missing information
4. Produces summary ready for internal review

---

### 2. Generating Discovery Questions

```
Generate discovery questions for a client wanting to modernize their
legacy booking system. They mentioned:
- Current system is 15 years old (Java/Oracle)
- 2M transactions/day
- Want cloud-native on AWS
- 18-month timeline
```

**What happens:**
1. Generates categorized questions (architecture, data, team, timeline, budget)
2. Prioritizes questions by deal-impact
3. Flags assumptions that need validation
4. Suggests follow-up paths based on likely answers

---

### 3. Creating a Project Brief

```
Create a project brief from these client materials:
- Client: theme park operator
- Need: real-time queue management system
- Scale: 50K concurrent guests, 30 attractions
- Integrations: existing ticketing, mobile app, digital signage
- Timeline: MVP in 6 months, full rollout in 12
```

**What happens:**
1. Structures into executive summary, scope, assumptions, and risks
2. Identifies key workstreams and dependencies
3. Suggests team composition and skill requirements
4. Produces document suitable for internal kickoff

---

### 4. Feasibility Assessment

```
Assess feasibility of this engagement:
- Migrate 200 microservices from on-prem to AWS EKS
- Client has 4 platform engineers available
- Budget: $2M over 18 months
- Must maintain zero downtime during migration
```

**What happens:**
1. Evaluates technical feasibility against constraints
2. Identifies high-risk areas and blockers
3. Provides go/no-go recommendation with rationale
4. Suggests scope adjustments if infeasible as-is

---

## Tips

- Paste raw client documents directly — the agent handles messy formats
- Specify your role (solutions architect, account manager) for tailored output
- For large RFPs, ask the agent to focus on specific sections first
- Discovery questions improve when you provide industry context
