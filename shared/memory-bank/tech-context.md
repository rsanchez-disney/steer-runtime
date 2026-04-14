# Tech Context

## Languages & Frameworks
- Agent prompts: Markdown
- Agent configs: JSON
- MCP servers: Node.js (esbuild single-file bundles)
- Setup tooling: Bash (setup.sh), PowerShell (setup.ps1)
- Cursor rules: `.mdc` (markdown + YAML frontmatter)
- Amazon Q rules: Plain `.md`

## Agent Profiles
| Profile | Agents | Key Agents |
|---------|--------|------------|
| dev | 20 | orchestrator, backend, webapi, ui, flutter, android_native, ios_native, code_review_agent, security_scanner_agent, technical_writer_agent |
| ba | 4 | ba_orchestrator_agent, scope_definer_agent, feature_writer_agent, requirements_analyst_agent |
| qa | 6 | qa_orchestrator_agent, test_planner_agent, test_automation_agent, defect_analyst_agent, api_tester_agent, performance_tester_agent |
| ops | 5 | ops_orchestrator_agent, ai_metrics_agent, infra_check_agent, deployment_agent, code_quality_agent |
| pm | 6 | pm_orchestrator_agent, sprint_manager_agent, standup_agent, retro_agent, risk_tracker_agent, delivery_reporter_agent |

## Advanced Tools (opt-in via `./setup.sh enable-tools`)
| Tool | Agents | Purpose |
|------|--------|---------|
| thinking | 5 orchestrators, architecture, planner | Step-by-step reasoning |
| todo | 5 orchestrators, sprint_manager | Persistent task tracking |
| delegate | 5 orchestrators | Async non-blocking delegation |
| knowledge | story_analyzer, architecture, test_planner, requirements_analyst | Long-term semantic memory |

## Hooks (`.kiro/hooks/`)
| Script | Event | Agents | Behavior |
|--------|-------|--------|----------|
| git-context.sh | agentSpawn | 5 orchestrators | Injects branch + dirty count |
| guard-writes.sh | preToolUse (fs_write) | 6 dev/qa agents | Blocks writes to node_modules/, dist/, .git/ |
| warn-destructive.sh | postToolUse (execute_bash) | dev orchestrator | Warns on rm -rf, DROP TABLE, --force |

## External Integrations (MCP)
- Jira (myjira.disney.com) — 22 agents
- Confluence (confluence.disney.com) — via bundled node server
- MyWiki (mywiki.disney.com) — shares confluence-mcp bundle
- GitHub (github.disney.com) — via bundled node server
- Mermaid — diagram generation, no token needed
- Context7 — up-to-date library/framework docs, npx-based, no token needed
- Harness (disney.harness.io) — CI/CD pipelines (ops)
- SonarQube (sonar.cicd.wdprapps.disney.com) — code quality (ops)

## Setup Commands (14 top-level + 7 IDE subcommands)
| Command | Purpose |
|---------|---------|
| install / sync / remove / clean | Profile lifecycle |
| list / check | Discovery and validation |
| mcp-install / configure | MCP server setup and tokens |
| enable-tools | Advanced kiro-cli settings |
| rules / prompts | Common coding rules and prompts |
| init-memory | Project memory bank initialization |
| cursor install/sync/remove/init-memory | Cursor IDE integration |
| amazonq install/sync/remove | Amazon Q Developer integration |

## Security
- `.env` files gitignored per MCP server
- `YOUR_TOKEN` placeholder pattern in all agent configs
- guard-writes.sh hook blocks writes to protected paths
- warn-destructive.sh hook alerts on dangerous commands

## Git Remotes
| Remote | URL | Purpose |
|--------|-----|---------|
| `origin` | `git@github.disney.com:SANCR225/steer-runtime.git` | Primary (Disney GHE) |
| `personal` | `git@github.com-arianthox:arianthox/steer-runtime.git` | Backup (private, github.com) |

To sync personal backup: `git push personal main`
