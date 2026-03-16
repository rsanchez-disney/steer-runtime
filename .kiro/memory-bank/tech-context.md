# Tech Context

## Languages & Frameworks
- Agent prompts: Markdown
- Agent configs: JSON
- MCP servers: Node.js/TypeScript, Docker
- Setup tooling: Bash (setup.sh)

## Agent Profiles
| Profile | Agents | Key Agents |
|---------|--------|------------|
| dev | 18 | orchestrator, backend, webapi, ui, flutter, android_native, ios_native, code_review_agent, security_scanner_agent |
| ba | 4 | ba_orchestrator_agent, scope_definer_agent, feature_writer_agent, requirements_analyst_agent |
| qa | 6 | qa_orchestrator_agent, test_planner_agent, test_automation_agent, defect_analyst_agent, api_tester_agent, performance_tester_agent |
| ops | 5 | ops_orchestrator_agent, ai_metrics_agent, infra_check_agent, deployment_agent, code_quality_agent |

## External Integrations
- Jira (myjira.disney.com)
- Confluence (confluence.disney.com)
- GitHub (via github-mcp)
- Harness (disney.harness.io) — CI/CD pipelines
- SonarQube (sonar.cicd.wdprapps.disney.com) — Code quality
- Docker container registry (containerregistry.disney.com)
- AWS ECS — Infrastructure monitoring

## CLI
- `kiro-cli chat --agent <agent_name>` to interact with agents
- `./setup.sh` for installation and management

## Setup Commands
| Command | Purpose |
|---------|---------|
| `install <profiles>` | Install profiles |
| `sync` | Update installed profiles |
| `remove <profiles>` | Remove profiles |
| `clean` | Remove all |
| `list` | List available profiles |
| `check` | Verify installation |
| `mcp-install` | Install MCP dependencies |
| `rules [list\|install]` | Manage common coding rules |
| `prompts [list\|install]` | Manage standalone prompts |
| `init-memory <dir>` | Initialize project memory bank |
| `configure` | Configure MCP tokens |

## Security Notes
- `.env` files are gitignored per MCP server
- `mcp-config.json` and `~/.kiro/config.json` are gitignored
- Ops profile uses `YOUR_TOKEN` placeholder pattern for safe commits
- `./setup.sh configure` manages tokens in `~/.kiro/.env`
