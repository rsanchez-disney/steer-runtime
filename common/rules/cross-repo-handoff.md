# Cross-Repo Handoff Protocol

When an agent determines that work is needed in a different repository:

1. **Update spec files** before completing your session:
   - Requirements/bugfix docs: Add findings from your investigation (confirmed root cause, what was fixed, what remains)
   - Design docs: Update hypothesized root causes with confirmed/ruled-out status
   - Task list: Mark completed tasks, add new tasks scoped to the other repo with clear context

2. **Provide a handoff verdict** at the end of your session:
   - Which repo needs work next and why
   - What specific changes are needed (be precise)
   - What context the next agent needs to pick up immediately

3. **Save to memory** — call `mem_save` with:
   - `topic_key`: `handoff-{source-repo}-to-{target-repo}`
   - Content: the handoff verdict above

4. **No implicit assumptions** — the next agent has no access to your conversation history, only spec files and memory. Be explicit.
