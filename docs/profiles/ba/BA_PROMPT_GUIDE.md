# BA/PO Prompt Guide

**Effective prompts for Business Analysts and Product Owners**

This guide shows how to use BA/PO agents in your daily workflow with real-world examples.

---

## Quick Reference

| Task | Agent | Example Prompt |
|------|-------|----------------|
| Define project scope | `scope_definer_agent` | "Define scope for payment integration epic DPAY-500" |
| Write user stories | `feature_writer_agent` | "Create stories for checkout flow based on requirements doc" |
| Analyze requirements | `requirements_analyst_agent` | "Review sprint 23 stories and identify gaps" |
| Complex workflow | `ba_orchestrator_agent` | "Analyze epic DPAY-500 and create complete story breakdown" |

---

## Daily Workflows

### 1. Starting a New Epic

**Scenario:** You have a new epic and need to define scope and create stories.

```bash
kiro-cli chat --agent ba_orchestrator_agent
```

**Prompt:**
```
I have a new epic DPAY-500 for payment method validation. 
Help me:
1. Define the scope and boundaries
2. Identify key requirements
3. Create user stories with acceptance criteria
```

**What happens:**
- Orchestrator fetches epic from Jira
- Delegates to `scope_definer_agent` for scope analysis
- Delegates to `feature_writer_agent` for story creation
- Returns complete breakdown with stories ready to create

---

### 2. Defining Project Scope

**Scenario:** Stakeholders want to add features, need to clarify what's in/out of scope.

```bash
kiro-cli chat --agent scope_definer_agent
```

**Prompt:**
```
Review epic DPAY-500 and define:
- What's in scope
- What's out of scope
- Key assumptions
- Dependencies on other teams
- Risks and constraints

Document findings in Confluence page "Payment Validation Scope"
```

**Output:**
- Structured scope document
- Clear boundaries
- Documented assumptions
- Created/updated Confluence page

---

### 3. Writing User Stories

**Scenario:** Need to break down a feature into implementable stories.

```bash
kiro-cli chat --agent feature_writer_agent
```

**Prompt:**
```
Create user stories for the payment validation feature:

Context:
- Users need to validate credit cards before checkout
- Support Visa, Mastercard, Amex
- Show validation errors inline
- Must work on mobile and desktop

Create stories with:
- User story format (As a... I want... So that...)
- Acceptance criteria
- Technical notes
- Estimated story points
```

**Output:**
- 5-8 well-formed user stories
- Clear acceptance criteria
- Technical considerations noted
- Ready to add to Jira

---

### 4. Sprint Planning Preparation

**Scenario:** Preparing for sprint planning, need to review backlog.

```bash
kiro-cli chat --agent requirements_analyst_agent
```

**Prompt:**
```
Analyze all stories in the "Ready for Sprint" status:
1. Check if acceptance criteria are clear
2. Identify missing information
3. Flag stories that need refinement
4. Suggest story splitting where needed
5. Verify dependencies are documented

Generate a sprint planning readiness report.
```

**Output:**
- Story-by-story analysis
- List of stories needing refinement
- Recommendations for splitting
- Readiness score

---

### 5. Requirements Gap Analysis

**Scenario:** Reviewing requirements before development starts.

```bash
kiro-cli chat --agent requirements_analyst_agent
```

**Prompt:**
```
Review all stories in epic DPAY-500 and check for:
- Missing edge cases
- Incomplete acceptance criteria
- Unclear requirements
- Missing non-functional requirements (performance, security)
- Gaps in user flows

Compare against the PRD in Confluence: "Payment Validation PRD"
```

**Output:**
- Gap analysis report
- List of missing requirements
- Recommendations for additional stories
- Risk assessment

---

### 6. Refining Existing Stories

**Scenario:** Stories from last refinement need updates.

```bash
kiro-cli chat --agent feature_writer_agent
```

**Prompt:**
```
Review story DPAY-523 and improve:
- Make acceptance criteria more specific and testable
- Add examples for each criterion
- Include edge cases
- Add technical notes about API endpoints needed
- Suggest story points based on complexity

Update the story in Jira with improvements.
```

**Output:**
- Enhanced acceptance criteria
- Concrete examples
- Edge cases documented
- Story updated in Jira

---

### 7. Creating Documentation

**Scenario:** Need to document feature for stakeholders.

```bash
kiro-cli chat --agent scope_definer_agent
```

**Prompt:**
```
Create a feature overview document for payment validation:

Include:
- Executive summary
- Business value
- User personas affected
- High-level requirements
- Success metrics
- Timeline and milestones

Save as Confluence page in "Product Documentation" space.
```

**Output:**
- Professional feature document
- Published to Confluence
- Formatted and structured

---

### 8. Backlog Grooming

**Scenario:** Weekly backlog grooming session prep.

```bash
kiro-cli chat --agent ba_orchestrator_agent
```

**Prompt:**
```
Prepare for backlog grooming:
1. Review top 20 stories in backlog
2. Identify stories missing acceptance criteria
3. Flag stories that are too large (>8 points)
4. Check for duplicate or overlapping stories
5. Suggest priority order based on dependencies

Generate a grooming agenda with recommendations.
```

**Output:**
- Grooming agenda
- Stories needing attention
- Splitting recommendations
- Priority suggestions

---

### 9. Stakeholder Requirements Gathering

**Scenario:** Stakeholder provided requirements in email/doc, need to structure them.

```bash
kiro-cli chat --agent feature_writer_agent
```

**Prompt:**
```
I have requirements from stakeholders in this document:
[paste requirements]

Convert these into:
- Structured user stories
- Acceptance criteria
- Open questions that need clarification
- Assumptions we're making

Don't create in Jira yet, just provide the structured output for review.
```

**Output:**
- Structured stories (not yet in Jira)
- List of clarifying questions
- Documented assumptions
- Ready for stakeholder review

---

### 10. Epic Breakdown

**Scenario:** Large epic needs to be broken into manageable pieces.

```bash
kiro-cli chat --agent ba_orchestrator_agent
```

**Prompt:**
```
Break down epic DPAY-500 into:
1. Sub-epics or themes
2. User stories for each theme
3. Suggested sprint groupings
4. Dependencies between stories
5. MVP vs. nice-to-have features

Create a visual breakdown I can present to the team.
```

**Output:**
- Hierarchical breakdown
- Story groupings
- Dependency map
- MVP identification
- Presentation-ready format

---

### 11. Acceptance Criteria Review

**Scenario:** Dev team says acceptance criteria are unclear.

```bash
kiro-cli chat --agent requirements_analyst_agent
```

**Prompt:**
```
Review acceptance criteria for stories DPAY-520 through DPAY-530.

For each story, check:
- Are criteria testable?
- Are they specific enough?
- Do they cover happy path and edge cases?
- Are they written from user perspective?

Provide specific improvement suggestions for each story.
```

**Output:**
- Story-by-story review
- Specific improvements
- Examples of better criteria
- Testability assessment

---

### 12. Cross-Epic Analysis

**Scenario:** Multiple epics might have overlapping requirements.

```bash
kiro-cli chat --agent requirements_analyst_agent
```

**Prompt:**
```
Compare requirements across epics:
- DPAY-500 (Payment Validation)
- DPAY-510 (Checkout Flow)
- DPAY-520 (Payment Methods)

Identify:
- Overlapping requirements
- Potential conflicts
- Shared dependencies
- Opportunities for consolidation
```

**Output:**
- Cross-epic analysis
- Overlap identification
- Conflict resolution suggestions
- Consolidation opportunities

---

## Advanced Techniques

### Chaining Agents

For complex workflows, use orchestrator to chain multiple agents:

```bash
kiro-cli chat --agent ba_orchestrator_agent
```

**Prompt:**
```
Complete workflow for new feature:
1. Define scope for payment tokenization
2. Analyze existing payment stories for reusable patterns
3. Create new stories with acceptance criteria
4. Document in Confluence
5. Create Jira epic and link all stories
```

### Using Context Files

Reference existing documentation:

```
Review the API specification at docs/payment-api.md and create stories 
for implementing the new /validate endpoint. Ensure acceptance criteria 
match the API contract.
```

### Iterative Refinement

Start broad, then refine:

```
First pass: "Create high-level stories for payment validation"
Second pass: "Take story DPAY-523 and add detailed acceptance criteria"
Third pass: "Add edge cases and error scenarios to DPAY-523"
```

---

## Best Practices

### ✅ Do

- **Be specific:** "Create stories for credit card validation" vs. "Create stories"
- **Provide context:** Include epic numbers, links, background
- **Set expectations:** "Create 5-7 stories" vs. "Create stories"
- **Reference docs:** Point to PRDs, specs, existing stories
- **Iterate:** Start high-level, then drill down

### ❌ Don't

- **Be vague:** "Help me with requirements" (too broad)
- **Skip context:** Agents need background to provide good output
- **Expect mind reading:** Specify what format/detail you want
- **Ignore validation:** Always review agent output before using
- **Forget to save:** Explicitly ask to create/update Jira/Confluence

---

## Prompt Templates

### New Feature
```
Create user stories for [feature name]:
- Context: [background]
- Users: [personas]
- Goals: [what users want to achieve]
- Constraints: [technical/business limits]
- Format: Standard user story with acceptance criteria
```

### Scope Definition
```
Define scope for [epic/project]:
- In scope: [what's included]
- Out of scope: [what's excluded]
- Assumptions: [what we're assuming]
- Dependencies: [what we depend on]
- Risks: [potential issues]
```

### Requirements Review
```
Review [stories/epic] for:
- Completeness
- Clarity
- Testability
- Edge cases
- Dependencies
Provide specific improvement recommendations.
```

### Gap Analysis
```
Compare [source] against [target] and identify:
- Missing requirements
- Incomplete specifications
- Unclear acceptance criteria
- Gaps in user flows
```

---

## Troubleshooting

### Agent doesn't understand context
**Solution:** Provide more background, reference specific Jira issues or Confluence pages

### Output is too generic
**Solution:** Be more specific about format, detail level, and examples you want

### Can't access Jira/Confluence
**Solution:** Check MCP server configuration, verify credentials

### Stories don't match your style
**Solution:** Provide examples of good stories, reference story templates

---

## Quick Tips

💡 **Start with orchestrator** when you're not sure which agent to use  
💡 **Use specific agent** when you know exactly what you need  
💡 **Provide examples** of the format/style you want  
💡 **Reference existing work** to maintain consistency  
💡 **Review before committing** to Jira/Confluence  
💡 **Iterate** - refine output through follow-up prompts  

---

## Next Steps

- See `BA_WORKFLOWS.md` for complete workflow examples
- See `.kiro-ba/context/ba_guidelines.md` for best practices
- See `.kiro-ba/context/story_templates.md` for story formats

---

**Version:** 1.0  
**Last Updated:** March 12, 2026
