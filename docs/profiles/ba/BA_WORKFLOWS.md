# BA/PO Complete Workflows

**End-to-end workflow examples for common BA/PO activities**

---

## Workflow 1: New Epic → Ready for Development

**Goal:** Take a new epic from concept to sprint-ready stories

### Step 1: Initial Scope Definition (15 min)

```bash
kiro-cli chat --agent scope_definer_agent
```

```
Epic DPAY-600 "Multi-currency Payment Support" was just created.

Define the scope:
1. What currencies are in scope? (start with USD, EUR, GBP)
2. What's out of scope? (crypto, gift cards)
3. Key assumptions (exchange rates updated daily)
4. Dependencies (need currency service API)
5. Constraints (must work with existing payment flow)

Save to Confluence: "Multi-currency Support - Scope"
```

### Step 2: Requirements Analysis (20 min)

```bash
kiro-cli chat --agent requirements_analyst_agent
```

```
Review the scope document and identify:
- Functional requirements (currency selection, conversion, display)
- Non-functional requirements (performance, accuracy)
- Edge cases (currency not supported, conversion failures)
- Integration points (payment gateway, currency service)
- Data requirements (exchange rates, currency symbols)

Create requirements checklist.
```

### Step 3: Story Creation (30 min)

```bash
kiro-cli chat --agent feature_writer_agent
```

```
Create user stories for multi-currency support:

Based on scope and requirements, create stories for:
1. Currency selection UI
2. Price conversion logic
3. Display in selected currency
4. Exchange rate updates
5. Error handling
6. Admin configuration

Each story needs:
- User story format
- 3-5 acceptance criteria
- Technical notes
- Story points estimate (1,2,3,5,8)
```

### Step 4: Review & Refinement (15 min)

```bash
kiro-cli chat --agent requirements_analyst_agent
```

```
Review the created stories and check:
- Do they cover all requirements?
- Are acceptance criteria testable?
- Are dependencies clear?
- Is there a logical implementation order?
- Any missing edge cases?

Provide refinement recommendations.
```

### Step 5: Jira Creation (10 min)

```bash
kiro-cli chat --agent feature_writer_agent
```

```
Create the following stories in Jira under epic DPAY-600:
[paste refined stories]

Link them to the epic and set:
- Priority based on dependencies
- Labels: multi-currency, payment
- Sprint: leave unassigned for now
```

**Total Time:** ~90 minutes  
**Output:** Epic with 6-8 sprint-ready stories

---

## Workflow 2: Sprint Planning Preparation

**Goal:** Prepare backlog for upcoming sprint planning

### Day Before Sprint Planning

```bash
kiro-cli chat --agent ba_orchestrator_agent
```

```
Sprint planning is tomorrow. Prepare the backlog:

1. Review top 30 stories in "Ready for Sprint" status
2. Check each story has:
   - Clear acceptance criteria
   - Story points
   - No blockers
3. Identify stories needing refinement
4. Flag stories with missing information
5. Suggest sprint capacity allocation (team velocity: 40 points)

Generate sprint planning prep report.
```

**Output:**
- Stories ready for sprint (with points)
- Stories needing refinement (with issues)
- Recommended sprint composition
- Risk items to discuss

---

## Workflow 3: Stakeholder Requirements → Stories

**Goal:** Convert stakeholder email/doc into structured stories

### Step 1: Extract Requirements (10 min)

```bash
kiro-cli chat --agent requirements_analyst_agent
```

```
Stakeholder sent these requirements:
---
[paste email/doc content]
---

Extract and structure:
- Core requirements
- User needs
- Business goals
- Constraints
- Open questions
```

### Step 2: Create Stories (20 min)

```bash
kiro-cli chat --agent feature_writer_agent
```

```
Based on extracted requirements, create user stories:

For each requirement, create:
- User story (As a... I want... So that...)
- Acceptance criteria (Given/When/Then format)
- Technical considerations
- Questions for stakeholder

Don't create in Jira yet - output for review.
```

### Step 3: Stakeholder Review (async)

Send output to stakeholder for validation

### Step 4: Finalize & Create (10 min)

```bash
kiro-cli chat --agent feature_writer_agent
```

```
Stakeholder approved stories with these changes:
[paste feedback]

Update stories and create in Jira under epic DPAY-XXX.
```

**Total Time:** ~40 minutes + stakeholder review  
**Output:** Validated stories in Jira

---

## Workflow 4: Epic Health Check

**Goal:** Assess epic progress and identify issues

```bash
kiro-cli chat --agent requirements_analyst_agent
```

```
Epic DPAY-500 health check:

Analyze all stories in the epic:
1. Status breakdown (To Do, In Progress, Done)
2. Blocked stories and reasons
3. Stories missing acceptance criteria
4. Stories in progress >5 days
5. Scope creep (stories added after start)
6. Completion percentage
7. Risk assessment

Generate executive summary for stakeholders.
```

**Output:**
- Epic health dashboard
- Risk items
- Recommendations
- Executive summary

---

## Workflow 5: Backlog Grooming Session

**Goal:** Weekly backlog maintenance

### Pre-Grooming (30 min before meeting)

```bash
kiro-cli chat --agent ba_orchestrator_agent
```

```
Backlog grooming prep:

Review backlog and create agenda:
1. Stories to refine (missing details)
2. Stories to split (too large)
3. Stories to merge (duplicates/overlap)
4. Stories to re-prioritize
5. New stories to discuss

For each item, provide:
- Current state
- Recommended action
- Discussion points
```

### During Grooming (use as reference)

Review agent recommendations with team

### Post-Grooming (15 min)

```bash
kiro-cli chat --agent feature_writer_agent
```

```
Update stories based on grooming decisions:

Story DPAY-523: Split into 2 stories
Story DPAY-524: Add edge cases to AC
Story DPAY-525: Merge with DPAY-530
Story DPAY-526: Update story points to 5

Make these updates in Jira.
```

**Total Time:** ~45 minutes  
**Output:** Refined backlog

---

## Workflow 6: Requirements Traceability

**Goal:** Ensure all requirements are covered by stories

```bash
kiro-cli chat --agent requirements_analyst_agent
```

```
Traceability check for Payment Integration project:

Source: PRD in Confluence "Payment Integration Requirements"
Target: All stories in epic DPAY-500

For each requirement in PRD:
1. Find corresponding story/stories
2. Verify acceptance criteria cover requirement
3. Identify requirements without stories
4. Flag stories not tied to requirements

Generate traceability matrix.
```

**Output:**
- Requirement → Story mapping
- Coverage gaps
- Orphaned stories
- Traceability matrix

---

## Workflow 7: Story Splitting

**Goal:** Break down large stories into implementable pieces

```bash
kiro-cli chat --agent feature_writer_agent
```

```
Story DPAY-550 is estimated at 13 points (too large).

Current story:
"As a user, I want to manage my payment methods so I can choose how to pay"

Split into smaller stories:
- Each should be 3-5 points
- Maintain user value in each
- Clear dependencies
- Logical implementation order

Provide split stories with acceptance criteria.
```

**Output:**
- 3-4 smaller stories
- Dependency order
- Updated acceptance criteria

---

## Workflow 8: Cross-Team Coordination

**Goal:** Coordinate requirements across multiple teams

```bash
kiro-cli chat --agent ba_orchestrator_agent
```

```
Payment feature requires coordination with:
- Frontend team (UI changes)
- Backend team (API changes)
- Platform team (infrastructure)

Analyze epic DPAY-500 and:
1. Identify stories for each team
2. Map dependencies between teams
3. Suggest implementation sequence
4. Create coordination plan
5. Identify integration points

Generate coordination document for team leads.
```

**Output:**
- Team-specific story lists
- Dependency map
- Implementation timeline
- Integration plan

---

## Workflow 9: Acceptance Criteria Enhancement

**Goal:** Improve vague acceptance criteria

```bash
kiro-cli chat --agent feature_writer_agent
```

```
Story DPAY-555 has vague acceptance criteria:
- "Payment should work"
- "Errors should be handled"
- "UI should be responsive"

Enhance to be specific and testable:
- Use Given/When/Then format
- Include specific values/examples
- Cover happy path and edge cases
- Make measurable

Provide enhanced criteria.
```

**Output:**
- Specific, testable criteria
- Examples for each criterion
- Edge cases covered

---

## Workflow 10: Release Planning

**Goal:** Plan stories across multiple sprints

```bash
kiro-cli chat --agent ba_orchestrator_agent
```

```
Release planning for Q2 (6 sprints, 40 points each):

Epics to include:
- DPAY-500 (Payment Validation)
- DPAY-600 (Multi-currency)
- DPAY-700 (Payment Methods)

Create release plan:
1. Group stories by epic and priority
2. Allocate to sprints based on:
   - Dependencies
   - Team capacity (40 points/sprint)
   - Business priority
3. Identify MVP for each epic
4. Flag risks and dependencies

Generate sprint-by-sprint breakdown.
```

**Output:**
- 6-sprint plan
- Story allocation
- MVP identification
- Risk assessment

---

## Quick Workflow Patterns

### Pattern: Quick Story Review
```bash
kiro-cli chat --agent requirements_analyst_agent
> "Quick review of DPAY-XXX - is it ready for sprint?"
```

### Pattern: Story Enhancement
```bash
kiro-cli chat --agent feature_writer_agent
> "Enhance acceptance criteria for DPAY-XXX with examples"
```

### Pattern: Scope Question
```bash
kiro-cli chat --agent scope_definer_agent
> "Is feature X in scope for epic DPAY-500?"
```

### Pattern: Gap Check
```bash
kiro-cli chat --agent requirements_analyst_agent
> "Compare stories in DPAY-500 against PRD - any gaps?"
```

---

## Time-Saving Tips

⚡ **Use orchestrator for multi-step workflows** - Let it coordinate  
⚡ **Batch similar tasks** - Review multiple stories at once  
⚡ **Create templates** - Save common prompts  
⚡ **Iterate quickly** - Start broad, refine with follow-ups  
⚡ **Reference existing work** - Point to good examples  

---

**See Also:**
- `BA_PROMPT_GUIDE.md` - Detailed prompt examples
- `.kiro-ba/context/ba_guidelines.md` - Best practices
- `.kiro-ba/context/story_templates.md` - Story formats
