# Dev Mobile Profile

Mobile specialists for Flutter cross-platform and native platform channels.

Requires `dev-core` as a base.

## Agents (3)

| Agent | Purpose |
|-------|---------|
| flutter | Dart/Flutter cross-platform development |
| android_native | Kotlin/Java platform channels for Android |
| ios_native | Swift/Obj-C platform channels for iOS |

## Structure

```
.kiro-dev-mobile/
├── agents/       # 3 agent JSON configs
├── prompts/      # 3 agent prompt files
├── steering/     # Flutter monorepo, mobile coordination
└── skills/       # 4 skills: flutter-*, android-*, ios-*
```

## Install

```bash
koda install dev-core dev-mobile    # Mobile developer
koda install dev                    # All dev-* profiles
```
