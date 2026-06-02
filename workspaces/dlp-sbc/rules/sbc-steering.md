# SBC DLP Development Standards

> **SBC** = Sales & Business Center     Disneyland Paris's booking and reservation management system (dlp-sbc-ui).


## Honesty Rule

- If you don't know something about this project, say "I don't know"     NEVER invent, guess, or fabricate information about SBC, its architecture, its acronyms, or its business domain.
- Only state facts that are explicitly present in your loaded context files, the codebase, or Jira/Confluence via MCP.
- If a user asks something and the answer isn't in your context or retrievable via tools, say so clearly.


This steering file consolidates all development patterns, workflow conventions, and MCP integrations for the SBC DLP project. It references detailed skill files for full templates and examples.

## Workflow Conventions

### Jira
- Project: **RSDLP**
- Ticket pattern: `RSDLP-XXXX`
- Use the Jira MCP (`mcp_atlassian_jira_*`) to read tickets, add comments, and transition issues
- Always reference tickets in branches, PRs, and commits

### Branches
- Pattern: `RSDLP-XXXX-short-description` (kebab-case)
- Always branch from `develop` unless told otherwise
- **CRITICAL**: When starting work on a new Jira ticket / user story, ALWAYS check the current branch first. If the current branch belongs to a different ticket, switch to the correct branch (or create a new one from `develop`) BEFORE making any code changes. Never commit changes for one ticket onto another ticket's branch.
- Push before creating PRs

### Git Operations
- **ALWAYS use the GitHub MCP** (`mcp_github_*`) for all GitHub operations: creating PRs, creating branches, pushing files, listing PRs, managing reviews, etc.
- NEVER use `git` CLI commands for operations that the GitHub MCP can handle (e.g., creating PRs, managing branches on remote)
- Use `git` CLI only for local operations: checkout, commit, stash, diff, log, push

### Pull Requests
- Always use the PR template from the repo root: #[[file:PULL_REQUEST_TEMPLATE.md]]
- Fill every section thoroughly     Description, Squash Commit Title, Evidence, Unit Test Evidence, Notes for Reviewers
- No emojis in PRs
- End with `@Resolves RSDLP-XXXX` when the PR fixes a Jira ticket     this auto-lists the PR in the Confluence release table when merged
- **ALWAYS** use the GitHub MCP (`mcp_github_*`) to create PRs, request reviewers, and manage branches     never use `git` CLI or manual GitHub UI for PR creation
- Target branch is `develop` unless specified otherwise

### Commits
- Format: `RSDLP-XXXX: Short description of change`
- Keep commits atomic     one logical change per commit

## MCP Environment

Full setup details, tokens, and troubleshooting: #[[file:.kiro/skills/mcp-environment.md]]

## Development Patterns

### Vue Modal Pattern
Template, state management, EventBus, and common mistakes: #[[file:.kiro/skills/vue-modal-pattern.md]]

Key rules:
- Never reassign reactive objects     use `Object.assign()`
- Open modals AFTER data loads (show loading state)
- Mirror DTO field names exactly
- No Vuex/Pinia     use local reactive state
- Use `.do` endpoints with `userAction` parameter (not REST)
- Extract reactive forms to separate `.js` files (e.g., `GuestForm.js`)
- Use `send`/`accept` EventBus pattern for awaitable modal flows
- Standalone popup pages manage their own state     no EventBus orchestration

### Struts Action Pattern
Action class template, session management, JSON responses: #[[file:.kiro/skills/struts-action-pattern.md]]

Key rules:
- Extend `DestinyActionParent`
- Route via `userAction` parameter
- Store handlers in session via `SessionUtility`
- Return `null` for AJAX responses after writing JSON
- Use `ObjectMapperFactory.getObjectMapper()`     never create new instances
- Use `eventBus=true` parameter for JSON branches that preserve JSP backward compatibility
- No comments in code     the code documents itself

### DTO/Form Mapping
Field mapping, type conversion, defensive assignment: #[[file:.kiro/skills/dto-form-mapping.md]]

Key rules:
- Frontend Forms mirror backend DTOs field-by-field with exact naming
- Use `Object.assign()` for defensive assignment
- Handle null vs undefined     missing fields shouldn't overwrite form state
- Dates as ISO strings, Booleans default to false, Arrays default to []
- Always extract forms to separate `.js` files     never inline reactive forms in components

## Frontend Golden Rules (Admin Popup Pages)

These three patterns are NON-NEGOTIABLE for any new admin screen or Vue 3 popup page migration. Violating any of them produces broken pages (double scrollbars, 400/403 errors, 404 assets).

### 1. Entry Point HTML Reset     #[[file:.kiro/skills/admin-popup-pattern.md]]
Every Vite entry point `index.html` MUST include `html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }` and `#app { height: 100%; overflow: hidden; }`. Without this you get a gap between the header and window edge, plus a double scrollbar.

### 2. CSRF Handling     #[[file:.kiro/skills/admin-popup-pattern.md]]
Every admin popup page MUST use the standardized `getCSRFToken()` + `fetchJSON()` pattern:
- Read token from `CSRFToken` cookie
- For POST: prepend `formToken=...&` to the request body
- For GET: just set `xhr.withCredentials = true` (cookie is sent automatically)
- ALWAYS set `Pragma: no-cache` and `Expires: -1` headers
- If you get 400 on GET     wrong URL (check struts-config.xml mapping)
- If you get 403     CSRF cookie missing or mismatched

### 3. Visual Design System     #[[file:.kiro/skills/admin-page-styles.md]]
Every admin popup page MUST follow the design system:
- Blue gradient header (`linear-gradient(135deg, #1F4F99 0%, #152f6e 100%)`)
- `base: './'` in `vite.config.js` for relative asset paths
- Sticky thead, rounded table container, hover highlights
- Modal overlay: `background: rgba(0,0,0,0.5)`     NEVER use `backdrop-filter: blur()` (breaks position:fixed in Chrome)
- Button hierarchy: primary (gradient blue), link (text blue), edit (outlined), danger (red)
- Font: `'Segoe UI', Arial, sans-serif` at 13px base
- Prefix ALL CSS classes with a short component identifier (e.g., `pim-`, `xf-`) to avoid global style conflicts

### Backend for Admin Pages     #[[file:.kiro/skills/struts-action-pattern.md]]
Admin JSON actions extend `Action` directly (NOT `DestinyActionParent`), use `action` parameter (lowercase), live in `com.dd.admin.actions`, and are stateless CRUD over DAOs.

### 4. Permissions     Server-Side canEdit (NEVER URL params)
The List endpoint MUST return `canEdit: true/false` by checking `sbc.admin_edit` ability from the session (SAML/Keystone). The frontend reads this flag and conditionally renders New/Edit/Delete buttons. NEVER pass permissions as URL parameters     that's client-side and bypassable.

## Frontend Golden Rules (Main App     Modals & Components)

For any Vue 3 modal or component that runs inside the main SBC frameset (orchestrated by Home.vue via EventBus), follow the main app design system. This is a DIFFERENT visual language from admin pages.

### Visual Design System     #[[file:.kiro/skills/main-app-styles.md]]
- Font: `Verdana, Arial, Helvetica, sans-serif` at 11px     NOT Segoe UI
- Modal titles: `#000099` blue, 12px bold     NOT gradient headers
- Buttons: gray (`rgba(116, 116, 128, 100%)`) with purple hover     NOT blue gradient
- Overlay: `.screen` class (76vw    90vh)     NOT full viewport
- Tables: `border-collapse: separate` with rounded corners
- All modals are draggable via `.modal-header`
- Inherit from `Master.scss`     override only `.dialog` dimensions in component SCSS

### Modal Pattern     #[[file:.kiro/skills/vue-modal-pattern.md]]
- EventBus `send`/`accept` for awaitable flows
- `Object.assign()` for reactive form mutation     never reassign
- Extract forms to separate `.js` files
- Open modal AFTER data loads (show loading state)
- Mirror DTO field names exactly
- Use `.do` endpoints with `userAction` parameter
- CSRF via `formToken` header (works inside frameset, unlike popup pages)

## Build & Deploy

- Build hook: `.kiro/hooks/build-deploy.sh` (local, gitignored)
- Maven: `mvn clean install -pl Config,MagicalGatheringWeb -am -DskipTests`
- Docker: `docker-compose up -d --build`
- Local URL: `http://localhost:8080/destiny`
- Always hard-delete `target/` dirs before building after branch switches
- Frontend hotswap: `docker cp` is unreliable for nested directories. Prefer full rebuild via `.kiro/hooks/build-deploy.sh` for any frontend changes.

## Code Style

- **No comments in code**     the code documents itself through clear naming and structure
- **No comments in tests**     test method names describe the scenario; the test body is the spec
- **Test structure**     extract object creation and setup into private helper methods. The `@Test` method should only contain the actual test: call the method under test and assert. All fixture building, mock wiring, and intermediate setup belongs in utility methods.
- **Frontend tests**     do NOT write preservation/property-based tests for frontend (JSP/JS/Vue) changes unless explicitly requested by the user. We are a backend team; frontend fixes should be minimal and ship fast.

## Branch Switching Safety

The `.kiro/` folder (settings, skills, steering, specs, hooks) is **untracked**     it lives on disk but is not committed to any branch. When switching branches:
- **NEVER** run `git checkout` with flags that discard untracked files (`--force`, `git clean -fd`, etc.)
- **ALWAYS** verify `.kiro/` is intact after a branch switch by listing its contents
- If `.kiro/` files disappear, they must be restored immediately     the MCP config, steering rules, and skills are critical for workflow
- The `.kiro/` folder should be in `.gitignore` to prevent accidental commits to feature branches
