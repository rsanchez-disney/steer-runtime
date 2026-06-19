# Delegation Rules — Studio Anglerfish

## Coding Tasks

All file creation, editing, and execution in the project MUST be delegated to `ios_native`. The orchestrator must NEVER write, modify, or create files directly.

This includes:
- Writing Swift/Objective-C code
- Creating or editing JSON schema files
- Running build/test/generate commands
- Running swift-format
- Running swiftiermocky generate
- Running the code generator (generate-classes.swift)
- Any file system modification in the project

## Post-Implementation

After any code change, the `ios_native` agent must run the pre-build steps defined in its repo context before considering the task complete.

## Architecture & Review

- Architecture decisions → `architecture_agent`
- Code review → `code_review_agent`
- Codebase exploration → `codebase_explorer_agent`
