# Dev Core Profile (OpSheet Go)

Go specialist for OpSheet+ core backend services — APIs, event processors, shared libraries, and monorepo services.

Requires `dev-core` (base) as a foundation.

## Agents (1)

| Agent | Purpose                                                    |
|-------|------------------------------------------------------------|
| godev | Go specialist for OpSheet+ core services (APIs, processors, libraries) |

## Structure

```
profiles/dev-core/
├── agents/       # godev.json
├── prompts/      # godev.md
├── steering/     # Go architecture, tech stack, code patterns, testing, PR review, git workflow
└── skills/       # go-api-endpoint, go-event-processor, go-shared-library, go-monorepo-service
```

## Install

```bash
./setup.sh install dev-core dev-core   # within opsheet-team workspace
```

---

## ESLint — Format on Save

This workspace includes an `.eslintrc.json`. To enable auto-fix on save in Kiro:

1. Install the **ESLint extension** (search `dbaeumer.vscode-eslint` in the Extensions panel)
2. Open the command palette: **Ctrl+Shift+P** (Windows) or **Cmd+Shift+P** (macOS)
3. Type **"Preferences: Open User Settings (JSON)"** and select it
4. Add these entries:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": ["javascript", "typescript"]
}
```

> Make sure the key is `editor.codeActionsOnSave` (not `notebook.codeActionsOnSave`) and there are no trailing spaces in the language names.

5. Save and close the settings file

ESLint will now auto-fix lint issues every time you save a `.js` or `.ts` file.
