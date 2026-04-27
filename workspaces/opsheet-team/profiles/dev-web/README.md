# Dev Web Profile

Fullstack web specialists for Config Studio (Java + Node.js + Angular).

Requires `dev-core` as a base.

## Agents (4)

| Agent | Purpose |
|-------|---------|
| backend | Java services specialist (wdpr-config-services) |
| webapi | Node.js/TypeScript specialist (wdpr-payment-controls-api) |
| ui | Angular specialist (wdpr-payment-controls-client) |
| ux_specialist_agent | Accessibility (WCAG 2.1 AA) and UX pattern review |

## Structure

```
.kiro-dev-web/
├── agents/       # 4 agent JSON configs
├── prompts/      # 4 agent prompt files
├── steering/     # Repo-specific: backend-java, webapi-node, ui-angular
└── skills/       # 12 skills: api-*, backend-*, ui-*
```

## Install

```bash
./setup.sh install dev-core dev-web       # Fullstack web developer
./setup.sh install dev                    # All dev (includes web)
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
