# Bugfix Pre-Implementation Check

Before executing any bugfix tasks:

1. Read the full spec or bug description (ticket, design doc, tasks)
2. Locate the relevant code identified as the root cause
3. Analyze whether the current codebase already addresses the bug condition
   - If a PR or branch is provided, check out and analyze that source — do not only check the default branch
4. If the fix is already in place:
   - Report which changes address which requirements
   - Identify any gaps (partial fix, missing tests, incomplete coverage)
   - Skip implementation tasks that are already satisfied
5. If the fix is NOT in place:
   - Provide a concise explanation of what's missing and why the bug condition persists
   - Ask the user whether to proceed with implementation
   - Do NOT start implementing until the user explicitly confirms
