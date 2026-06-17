# Android CLI Setup

## When to use
Use this skill when asked to install, update, or set up the Android CLI for agentic development.

## What is Android CLI
The Android CLI is Google's official terminal interface for Android development. It provides commands for environment setup, project creation, device management, and SDK management — optimized for use by AI agents.

Benefits: reduces LLM token usage by 70%+ and completes setup tasks 3x faster than manual toolset navigation.

## Install

```bash
# Download and install from the official source
curl -fsSL https://dl.google.com/android/cli/latest/darwin_arm64/install.sh | bash 
```

After install, verify:

```bash
android --version
```

## Update

```bash
android update
```

Always run `android update` before starting a new task to ensure you have the latest capabilities.

## Key commands

| Command | Purpose |
|---------|---------|
| `android sdk install` | Download specific SDK components |
| `android create` | Generate a new project from official templates |
| `android emulator` | Create and manage virtual devices |
| `android run` | Deploy app to a device/emulator |
| `android skills` | Browse and install Android skills |
| `android docs` | Search the Android Knowledge Base |
| `android update` | Update Android CLI to latest version |

## Environment setup

After installing Android CLI, set up the SDK environment:

```bash
# Install required SDK components
android sdk install platform-tools build-tools emulator

# Verify SDK setup
android sdk list
```

## Notes
- Android CLI is in preview; run `android update` regularly
- For full IDE experience, open the project in Android Studio
- The `android docs` command provides access to the Android Knowledge Base with the latest authoritative guidance
