# BA/PO Profile

**Business Analyst and Product Owner agents for requirements, scope, and feature definition**

---

## Agents (4)

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
├── agents/              # 4 agent configurations
│   ├── ba_orchestrator_agent.json
│   ├── scope_definer_agent.json
│   ├── feature_writer_agent.json
│   └── requirements_analyst_agent.json
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
**Agents:** 4  
**Last Updated:** March 12, 2026
