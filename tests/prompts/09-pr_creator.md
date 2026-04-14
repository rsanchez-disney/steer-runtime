Create a pull request for the project at {{PROJECT_DIR}}.

## Steps

1. **Create a feature branch** from the current branch:
   - Branch name: `feat/<ticket-or-feature-slug>` (derive from the requirements context)
   - Run: `git checkout -b <branch-name>`

2. **Commit all changes** with a conventional commit message:
   - Run: `git add -A`
   - Commit message format: `feat(<scope>): <short description>`
   - Include a body summarizing what was implemented and why

3. **Push the branch**:
   - Run: `git push -u origin <branch-name>`

4. **Create the pull request** using your GitHub MCP tools:
   - **Title:** `feat(<scope>): <description>` — include ticket number if available
   - **Description** must include:
     - **Summary** — what this PR does and why
     - **Requirements** — key acceptance criteria addressed
     - **Changes** — list of files/modules modified with brief explanations
     - **Testing** — how changes were tested, coverage results
     - **Security** — any security considerations from the scan
   - **Base branch:** `main`

5. **Output the PR URL** clearly so downstream steps can reference it.
