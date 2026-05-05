---
inclusion: fileMatch
fileMatchPattern: ["**/*.dart", "**/*.kt", "**/*.swift", "**/*.go", "**/*.ts", "**/*.java"]
description: Protocol for handing off work between repos via spec files
---

# Cross-Repo Handoff Protocol

When an agent determines that work is needed in a different repository (e.g., web agent finds VAS changes are required):

1. Update the spec files before completing your session:
   - **bugfix.md / requirements.md**: Add findings from your investigation (confirmed root cause, what was fixed, what remains)
   - **design.md**: Update hypothesized root causes with confirmed/ruled-out status, add any new findings relevant to the next repo
   - **tasks.md**: Mark completed tasks, add new tasks scoped to the other repo with clear context

2. Provide a clear handoff verdict at the end of your session:
   - Which repo needs work next and why
   - What specific changes are needed (be precise)
   - What context the next agent needs to pick up immediately

3. Do NOT leave implicit assumptions — the next agent has no access to your conversation history, only the spec files.
