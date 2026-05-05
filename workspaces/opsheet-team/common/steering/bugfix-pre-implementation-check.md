---
inclusion: fileMatch
fileMatchPattern: ["**/*.dart", "**/*.kt", "**/*.swift", "**/*.go", "**/*.ts", "**/*.java"]
description: Pre-implementation checklist for bugfix specs — verify fix state before coding
---

# Bugfix Workflow — Pre-Implementation Check

Before executing any bugfix spec tasks:

1. Read the full spec (bugfix.md, design.md, tasks.md)
2. Locate the relevant code identified in the design's hypothesized root causes
3. Analyze whether the current codebase already addresses the bug condition
   - If a PR or branch is provided, check out and analyze that source — do not only check main
4. If the fix is already in place:
   - Report which changes address which requirements
   - Identify any gaps (e.g., fix is partial, preservation not covered, tests missing)
   - Skip implementation tasks that are already satisfied
5. If the fix is NOT in place:
   - Provide a concise explanation of what's missing and why the bug condition is still present
   - Ask the user whether to proceed with implementation or provide more details first
   - Do NOT start implementing until the user explicitly confirms
