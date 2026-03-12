# BA/PO Quick Reference Card

**Print this for your desk!**

---

## Agent Selection

| I need to... | Use this agent |
|--------------|----------------|
| Define what's in/out of scope | `scope_definer_agent` |
| Write user stories | `feature_writer_agent` |
| Review existing requirements | `requirements_analyst_agent` |
| Do multiple BA tasks | `ba_orchestrator_agent` |

---

## Common Commands

### Start a conversation
```bash
kiro-cli chat --agent <agent_name>
```

### List installed agents
```bash
ls ~/.kiro/agents/ | grep -E "(scope|feature|requirements|ba_orchestrator)"
```

---

## 5-Minute Tasks

### Check if story is ready
```
Quick review of DPAY-XXX - is it ready for sprint?
```

### Enhance acceptance criteria
```
Add specific examples to acceptance criteria for DPAY-XXX
```

### Check scope
```
Is [feature] in scope for epic DPAY-XXX?
```

### Find gaps
```
Compare DPAY-XXX stories against requirements - any gaps?
```

### Split large story
```
Story DPAY-XXX is 13 points. Split into 3-5 point stories.
```

---

## Prompt Formula

```
[Action] for [Target]:
- Context: [background]
- Requirements: [what's needed]
- Format: [how you want output]
- Constraints: [limitations]
```

**Example:**
```
Create user stories for payment validation:
- Context: New feature for credit card validation
- Requirements: Support Visa, MC, Amex; show inline errors
- Format: User story with 3-5 acceptance criteria
- Constraints: Must work on mobile and desktop
```

---

## Best Practices

✅ **Be specific** - "Create 5 stories for checkout" not "help with checkout"  
✅ **Provide context** - Reference epics, PRDs, existing work  
✅ **Set expectations** - Specify format, detail level, number of items  
✅ **Iterate** - Start broad, refine with follow-ups  
✅ **Review output** - Always validate before committing to Jira  

❌ **Don't be vague** - "Help with requirements" is too broad  
❌ **Don't skip context** - Agents need background  
❌ **Don't expect perfection** - Review and refine output  

---

## Jira Integration

### Read from Jira
```
Fetch epic DPAY-500 and analyze scope
```

### Create in Jira
```
Create these stories in Jira under epic DPAY-500:
[paste stories]
```

### Update in Jira
```
Update story DPAY-XXX with enhanced acceptance criteria
```

---

## Confluence Integration

### Read from Confluence
```
Review PRD "Payment Integration" and extract requirements
```

### Create in Confluence
```
Save scope document to Confluence page "Payment Scope"
```

### Update in Confluence
```
Update "Feature Overview" page with new requirements
```

---

## Troubleshooting

**Agent doesn't understand**  
→ Add more context, reference specific Jira issues

**Output too generic**  
→ Provide examples of what you want

**Can't access Jira**  
→ Check `./setup.sh mcp-install` was run

**Wrong format**  
→ Show example of desired format in prompt

---

## Time Estimates

| Task | Time | Agent |
|------|------|-------|
| Define scope | 15 min | scope_definer_agent |
| Create 5-7 stories | 20 min | feature_writer_agent |
| Review 10 stories | 15 min | requirements_analyst_agent |
| Epic breakdown | 30 min | ba_orchestrator_agent |
| Enhance 1 story | 5 min | feature_writer_agent |
| Gap analysis | 20 min | requirements_analyst_agent |

---

## Getting Help

📖 **Detailed guide:** `docs/BA_PROMPT_GUIDE.md`  
📖 **Workflows:** `docs/BA_WORKFLOWS.md`  
📖 **Templates:** `.kiro-ba/context/story_templates.md`  
📖 **Guidelines:** `.kiro-ba/context/ba_guidelines.md`  

---

**Version:** 1.0 | **Updated:** March 12, 2026
