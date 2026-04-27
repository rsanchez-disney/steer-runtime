# Dev VAS Profile

Koa/TypeScript specialist for `opsheet-plus-vas` — Lambda (ALB) + ECS API.

Requires `dev-core` as a base.

## Agents (1)

| Agent | Purpose |
|-------|---------|
| vasapi | Koa 2/TypeScript specialist (opsheet-plus-vas) |

## Structure

```
profiles/dev-vas/
├── agents/       # vasapi.json
├── prompts/      # vasapi.md
├── steering/     # 20-repo-vasapi-node.md, 30-pr-review-guide.md
└── skills/       # api-contract-compatibility-check, api-endpoint-implementation,
                  # api-export-streaming-and-timeouts, api-observability-logging
```

## Install

```bash
./setup.sh install dev-core dev-vas
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
