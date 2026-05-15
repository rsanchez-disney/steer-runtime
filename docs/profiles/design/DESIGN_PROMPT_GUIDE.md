# Design Prompt Guide

**Effective prompts for UX research, design discovery, usability testing, and prototyping**

---

## Quick Reference

| Task | Agent | Example Prompt |
|------|-------|----------------|
| Competitive analysis | `design_discovery_agent` | "Run competitive analysis for our hotel booking flow" |
| User research plan | `user_research_agent` | "Create interview guide for resort checkout redesign" |
| Research report | `design_research_reporter_agent` | "Summarize findings from our 8 user interviews" |
| Usability test script | `usability_testing_agent` | "Design usability test for the new search filters" |
| Figma/v0 prompt | `prototype_prompt_agent` | "Generate Figma Make prompt for a dashboard layout" |
| Full design workflow | `design_orchestrator_agent` | "Run full discovery for the guest profile redesign" |

---

## Daily Workflows

### 1. Design Discovery

```
Run design discovery for the hotel booking checkout flow.
Include:
- Competitive analysis (Marriott, Hilton, Airbnb)
- Heuristic audit of our current flow
- Vision framework for the redesign
```

**What happens:**
1. Produces competitive feature matrix with screenshots references
2. Runs heuristic evaluation against Nielsen's 10 heuristics
3. Generates vision statement and elevator pitch for stakeholders

---

### 2. User Research Planning

```
Create a user research plan for the resort checkout redesign.
Target users: families booking 3+ night stays.
We have budget for 8 interviews and a survey.
```

**What happens:**
1. Generates screener criteria and recruitment brief
2. Produces interview guide with open-ended questions
3. Creates personas based on assumptions to validate
4. Outputs JTBD (Jobs to Be Done) hypothesis framework
5. Defines stakeholder RACI for the research phase

---

### 3. Synthesizing Research Findings

```
Summarize findings from our 8 user interviews on checkout.
Key themes I noticed:
- Users confused by "resort fee" appearing late
- 5/8 wanted to save and resume later
- Mobile users abandoned at payment step
```

**What happens:**
1. Structures findings into executive summary
2. Maps themes to severity and frequency
3. Produces journey map with pain points highlighted
4. Generates actionable recommendations prioritized by impact

---

### 4. Usability Testing

```
Design a usability test for the new search filters on the parks app.
We're testing with 5 participants remotely via UserTesting.
Tasks: filter by date, filter by park, combine filters, clear all.
```

**What happens:**
1. Produces moderated test script with intro, tasks, and debrief
2. Defines success metrics (completion rate, time on task, errors)
3. Creates observation template for note-taking
4. Generates post-test survey questions

---

### 5. Generating Prototype Prompts

```
Generate a Figma Make prompt for a guest profile dashboard.
Requirements:
- Show upcoming reservations as cards
- Quick actions: modify, cancel, add dining
- Dark mode support
- Mobile-first, responsive to desktop
```

**What happens:**
1. Transforms requirements into structured design prompt
2. Specifies layout, spacing, typography, and color tokens
3. Outputs prompt ready to paste into Figma Make, Google Stitch, or v0

---

### 6. Full Orchestrated Discovery

```
Run full design discovery for the guest profile redesign.
Context: current profile page has low engagement (12% monthly active).
Goal: increase engagement to 40% by adding personalization.
```

**What happens:**
1. Delegates competitive analysis to `design_discovery_agent`
2. Delegates research planning to `user_research_agent`
3. Delegates prototype generation to `prototype_prompt_agent`
4. Consolidates into a discovery package with timeline

---

## Tips

- Provide business context (metrics, goals) — agents produce more actionable outputs
- For research synthesis, paste raw notes or themes; the agent structures them
- Prototype prompts work best when you specify the target tool (Figma Make vs v0)
- The orchestrator can run a full discovery sprint in one session
