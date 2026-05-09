# BA/PO Profile

**Business Analyst and Product Owner agents for requirements, scope, and feature definition**

---

## Agents (8)

### ba_orchestrator_agent
Coordinates multiple BA tasks and delegates to specialized agents.

**Use when:** Complex workflows requiring multiple steps

### scope_definer_agent
Defines project and feature scope, boundaries, and constraints.

**Use when:** Starting new projects, clarifying scope, documenting assumptions

### feature_writer_agent
Creates user stories, acceptance criteria, and feature specifications.

**Use when:** Writing stories, breaking down epics, refining backlog

### requirements_analyst_agent
Analyzes requirements, identifies gaps, validates completeness.

**Use when:** Reviewing requirements, gap analysis, sprint prep

### prd_generator_agent
Generates Product Requirements Documents from Jira epics.

**Use when:**
- Creating PRDs
- Stakeholder analysis
- Requirements gathering

### backlog_generator_agent
Generates epic/story breakdowns from PRDs.

**Use when:**
- Story writing from PRDs
- Backlog creation
- Sprint planning prep

### translation_validator_agent
Validates translations for accuracy, idiomatic correctness, and cultural appropriateness.

**Use when:**
- Validating translated content
- Checking localization quality
- Reviewing multi-language deliverables

### estimation_agent
Dual-mode project estimation — CCV (hours/story points/FTEs) and DRIFT (tokens/cost).

**Use when:**
- RFP estimation
- Sprint planning
- AI cost projection
- Team sizing

---

## Capabilities

All agents have access to:
- ✅ **Jira** - Read/write issues, comments, transitions
- ✅ **Confluence** - Read/write pages, documentation
- ✅ **File Operations** - Read/write local files
- ✅ **Search** - Find information across systems

---

## Quick Start

```bash
# Install BA profile
./setup.sh install ba

# Use an agent
kiro-cli chat --agent scope_definer_agent
```

---

## Documentation

📖 **BA_PROMPT_GUIDE.md** - 12+ workflow examples with prompts  
📖 **BA_WORKFLOWS.md** - Complete end-to-end workflows  
📖 **BA_QUICK_REFERENCE.md** - Printable quick reference card  

📁 **context/ba_guidelines.md** - Best practices  
📁 **context/story_templates.md** - Story formats  

---

## Example Usage

### Define Scope
```bash
kiro-cli chat --agent scope_definer_agent
> "Define scope for epic DPAY-500 including in/out of scope, 
   assumptions, and dependencies. Save to Confluence."
```

### Create Stories
```bash
kiro-cli chat --agent feature_writer_agent
> "Create user stories for payment validation feature with 
   acceptance criteria and story points"
```

### Review Requirements
```bash
kiro-cli chat --agent requirements_analyst_agent
> "Review all stories in sprint 23 and identify gaps or 
   missing information"
```

### Generate PRD
```bash
kiro-cli chat --agent prd_generator_agent
> "Generate a PRD from epic DPAY-500 with stakeholder analysis 
   and success metrics"
```

### Create Backlog
```bash
kiro-cli chat --agent backlog_generator_agent
> "Break down the PRD into epics and stories with acceptance 
   criteria ready for sprint planning"
```

### Estimate Work
```bash
kiro-cli chat --agent estimation_agent
> "Estimate epic DPAY-500 using CCV model — story points, 
   hours, and FTE requirements"
```

### Complex Workflow
```bash
kiro-cli chat --agent ba_orchestrator_agent
> "Analyze epic DPAY-500, define scope, and create complete 
   story breakdown with acceptance criteria"
```

---

## Structure

```
.kiro-ba/
├── agents/              # 8 agent configurations
│   ├── ba_orchestrator_agent.json
│   ├── scope_definer_agent.json
│   ├── feature_writer_agent.json
│   ├── requirements_analyst_agent.json
│   ├── prd_generator_agent.json
│   ├── backlog_generator_agent.json
│   ├── translation_validator_agent.json
│   └── estimation_agent.json
├── prompts/             # Agent prompts
├── context/             # Guidelines and templates
│   ├── ba_guidelines.md
│   └── story_templates.md
└── README.md            # This file
```

---

## See Also

- Main README: `../README.md`
- Setup guide: `../setup.sh`
- Full documentation: `../docs/`

---

**Profile Version:** 1.0  
**Agents:** 8  
**Last Updated:** April 2, 2026
