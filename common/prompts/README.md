# Common Prompts

Standalone workflow prompts that can be used with any agent or directly in Kiro.

## Available Prompts

| Prompt | Description |
|--------|-------------|
| `generate-ai-metrics-report.md` | Generate AI productivity metrics and post to Jira |
| `check-ecs-tasks.md` | Check running ECS tasks in AWS clusters |

## Installation

```bash
./setup.sh prompts list                            # List available prompts
./setup.sh prompts install --all                   # Install all to ~/.kiro/prompts/
./setup.sh prompts install check-ecs-tasks         # Install specific prompt
```

## Usage

After installation, reference prompts in Kiro:
- Open the prompt file and follow the instructions
- Or copy the workflow steps into your conversation

## Adding New Prompts

1. Create a `.md` file in this directory
2. Include clear step-by-step instructions
3. Document any required MCP tools or permissions
