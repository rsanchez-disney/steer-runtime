# Dev Mobile Profile

Mobile specialists for Flutter cross-platform and native platform channels, plus supporting agents for architecture, code review, security, testing, and PR creation.

Requires `dev-core` as a base.

## Agents (8)

| Agent                  | Purpose                                          |
|------------------------|--------------------------------------------------|
| flutter                | Dart/Flutter cross-platform development          |
| android_native         | Kotlin/Java platform channels for Android        |
| ios_native             | Swift/Obj-C platform channels for iOS            |
| architecture_agent     | Architecture guidance and design decisions       |
| code_review_agent      | Code review for quality, security, performance   |
| pr_creator_agent       | GitHub pull request creation and formatting      |
| security_scanner_agent | Vulnerability, secrets, and compliance scanning  |
| test_runner_agent      | Test execution and coverage validation           |

## Structure

```
profiles/dev-mobile/
├── agents/       # 8 agent JSON configs
├── prompts/      # 8 agent prompt files
├── steering/     # Product context, tech stack, code style, monorepo, coordination
└── skills/       # 8 skills: flutter-*, android-*, ios-*, ui-*
```

## Install

```bash
./setup.sh install dev-core dev-mobile    # Mobile developer
./setup.sh install dev                    # All dev (includes mobile)
```
