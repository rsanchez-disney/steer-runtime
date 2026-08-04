---
inclusion: always
---

# EAI DLP Development Standards

## Honesty Rule

- If you don't know something about this project, say "I don't know" — NEVER invent, guess, or fabricate information about EAI, its architecture, its acronyms, or its business domain.
- Only state facts that are explicitly present in your loaded context files, the codebase, or Jira/Confluence via MCP.
- If a user asks something and the answer isn't in your context or retrievable via tools, say so clearly.

## Workflow Conventions

### Jira
- Project: **RSDLP**
- Ticket pattern: `RSDLP-XXXX`
- Use the Jira MCP (`mcp_atlassian_jira_*`) to read tickets, add comments, and transition issues
- Always reference tickets in branches, PRs, and commits

### GitHub Repository
- Organization: **WDPR-SPS**
- Repository: **wdpr-eai-hub-drp**
- Host: `github.disney.com`
- Use `owner: "WDPR-SPS"` and `repo: "wdpr-eai-hub-drp"` for all GitHub MCP calls

### Branches
- Pattern: `RSDLP-XXXX-short-description` (kebab-case)
- Always branch from `release-XXXX` (the last release branch); if it is not defined, create the branch from `develop`, unless told otherwise
- **CRITICAL**: When starting work on a new Jira ticket / user story, ALWAYS check the current branch first. If the current branch belongs to a different ticket, switch to the correct branch (or create a new one from `release-XXXX`) BEFORE making any code changes. Never commit changes for one ticket onto another ticket's branch.
- Push before creating PRs

### Git Operations
- **ALWAYS use the GitHub MCP** (`mcp_github_*`) for all GitHub operations: creating PRs, creating branches, pushing files, listing PRs, managing reviews, etc.
- NEVER use `git` CLI commands for operations that the GitHub MCP can handle (e.g., creating PRs, managing branches on remote)
- Use `git` CLI only for local operations: checkout, commit, stash, diff, log, push

### Pull Requests
- Always use the PR template from the repo root: #[[file:PULL_REQUEST_TEMPLATE.md]]
- Fill every section thoroughly — Description, Squash Commit Title, Evidence, Unit Test Evidence, Notes for Reviewers
- No emojis in PRs
- End with `@Resolves RSDLP-XXXX` when the PR fixes a Jira ticket — this auto-lists the PR in the Confluence release table when merged
- **ALWAYS** use the GitHub MCP (`mcp_github_*`) to create PRs, request reviewers, and manage branches
- Target branch is `release-XXXX` unless specified otherwise

### Commits
- Format: `RSDLP-XXXX: Short description of change`
- Keep commits atomic — one logical change per commit


## Build & Deploy

- Maven root: `Source/Code/pom.xml`
- Full build (no tests): `mvn clean install -DskipTest=true -Dmaven.test.skip=true -Dcobertura.skip`
- Tests only: `mvn test`
- Single module: `mvn clean install -pl <module-name>`
- Coverage: `mvn clean test jacoco:report`
- Local URL: `http://localhost:8080/WDPR-MessageInterface-web/`
- Always hard-delete `target/` dirs before building after branch switches
- Run Maven commands from `Source/Code/` directory

## Code Style

- **No comments in code** — the code documents itself through clear naming and structure
- **No comments in tests** — test method names describe the scenario; the test body is the spec
- **Test structure** — extract object creation and setup into private helper methods. The `@Test` method should only contain the actual test: call the method under test and assert. All fixture building, mock wiring, and intermediate setup belongs in utility methods.
- **Configuration** — all environment-specific values externalized in property files under `DRPHubEAR/EarContent/config/`
- **PCI compliance** — credit card numbers must be masked in all log output; use JKS keystores and BouncyCastle encryption for PCI-sensitive data
