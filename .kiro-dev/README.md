# Kiro Configuration

Single consolidated directory for all Kiro agents, prompts, skills, and powers.

## Structure

```
.kiro/
├── agents/          # Agent configurations (23 agents)
│   ├── orchestrator.json
│   ├── backend.json, ui.json, webapi.json
│   ├── flutter.json, android-native.json, ios-native.json
│   └── planner_agent.json, architecture_agent.json, etc.
├── prompts/         # Agent prompts (25 prompts)
│   ├── orchestrator.md
│   ├── backend.md, ui.md, webapi.md
│   └── flutter.md, android-native.md, ios-native.md
├── skills/          # Specialized skills (16 skills)
│   ├── backend-*.md
│   ├── ui-*.md
│   ├── webapi-*.md
│   ├── flutter-*.md
│   └── android-*.md, ios-*.md
├── steering/        # Project steering docs (10 docs)
│   ├── 00-foundation.md
│   ├── 10-product-config-studio.md
│   ├── 20-repo-*.md (backend, ui, webapi, flutter)
│   ├── 30-quality-and-tests.md
│   ├── 40-security-and-secrets.md
│   ├── 50-kiro-powers.md
│   └── 60-mobile-coordination.md
├── powers/          # Kiro Powers (4 powers)
│   ├── git-ops/
│   ├── code-analysis/
│   ├── file-ops/
│   ├── test-runner/
│   ├── loader.js
│   ├── README.md
│   └── GUIDE.md
├── context/         # Project context
│   ├── golden_rules.md
│   └── project_mappings.md
└── tools/           # Utility scripts
    ├── test-powers.js
    ├── test-power.js
    └── sync-kiro-pack.sh
```

## Agent Types

### Specialized Agents (Config Studio)
- **orchestrator** - Routes work and enforces compatibility
- **backend** - Java services (wdpr-config-services)
- **webapi** - Node.js API (wdpr-payment-controls-api)
- **ui** - Angular (wdpr-payment-controls-client)

### Mobile Agents
- **flutter** - Dart/Flutter cross-platform
- **android-native** - Kotlin/Java platform channels
- **ios-native** - Swift/Obj-C platform channels

### Generic Agents
- **planner** - Task planning and breakdown
- **architecture** - Architecture review
- **security_scanner** - Security analysis
- **performance** - Performance optimization
- **pr_creator** - Pull request creation
- And more...

## Usage

All agents reference resources using `file://.kiro/` paths.

Example agent configuration:
```json
{
  "name": "backend",
  "prompt": "file://.kiro/prompts/backend.md",
  "resources": [
    "file://.kiro/steering/**/*.md",
    "file://AGENTS.md"
  ]
}
```

## Powers

Test powers:
```bash
node .kiro/tools/test-powers.js
```

See `.kiro/powers/GUIDE.md` for creating custom powers.

## Consolidated

This directory consolidates what was previously split across:
- `.kiro` (generic agents)
- `.kiro` (specialized agents)
- `.kiro` (duplicate)

All capabilities are now in one place.
