# Android Skills Setup

## When to use
Use this skill when asked to install, browse, or apply Android skills — modular markdown instruction sets that ground the agent in Google's official Android best practices.

## What are Android Skills
Android skills are `SKILL.md` files hosted at https://github.com/android/android-skills. Each skill provides precise, actionable instructions for a specific Android development workflow. They trigger automatically when a prompt matches the skill's metadata.

Available skills include:
- Navigation 3 setup and migration
- Edge-to-edge support
- AGP 9 migration
- XML-to-Compose migration
- R8 config analysis
- And more (collection grows continuously)

## Browse available skills

```bash
android skills list
```

## Install skills for your agent

```bash
# Install all available skills
android skills install --all

# Install a specific skill
android skills install navigation3
android skills install edge-to-edge
android skills install agp9-migration
android skills install xml-to-compose
android skills install r8-config
```

Skills are installed to your project's `.android/skills/` directory alongside any custom skills you create.

## Verify installed skills

```bash
android skills list --installed
```

## Use skills in your workflow

Once installed, skills activate automatically when your prompt matches their trigger patterns. You can also explicitly reference a skill:

```bash
# Search the Android Knowledge Base for latest guidance
android docs search "Navigation 3 setup"
android docs search "edge-to-edge"
```

## Recommended skills for Studio Proteus

Given the team's Compose-based libraries, install at minimum:

```bash
android skills install edge-to-edge xml-to-compose agp9-migration
```

## Notes
- Skills complement the Android Knowledge Base (`android docs`) — use both for the most current guidance
- Custom skills live alongside official ones; the agent sees all installed skills
- Run `android update` first to ensure you get the latest available skills
