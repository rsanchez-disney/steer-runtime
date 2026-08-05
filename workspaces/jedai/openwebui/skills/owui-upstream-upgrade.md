---
name: owui-upstream-upgrade
description: Step-by-step process for merging an upstream Open WebUI release into the Disney fork — conflict resolution, dependency validation, local run, changelog review, contrast ratio validation, and browser regression tests.
---

# Skill: Open WebUI Upstream Upgrade

## Purpose
Step-by-step process for pulling an upstream Open WebUI release into the Disney fork (`wdpr-ra-openwebui`), resolving conflicts, validating dependencies, running the project locally, and executing regression tests via the browser MCP server.

---

## Trigger
Use this skill whenever a new upstream Open WebUI version needs to be evaluated or merged into the Disney fork. Typically initiated from a spike/upgrade issue in `jedai/program`.

Example invocation:
> "Upgrade Open WebUI from 0.10.2 to 0.11.0 following the upstream upgrade skill"

---

## Context You Need Before Starting

| Item | Where to find it |
|------|-----------------|
| Current version | `package.json` → `"version"` field |
| Target version | Upstream release tag on `https://github.com/open-webui/open-webui/releases` |
| Disney remote | `git remote -v` → `origin` |
| Upstream remote | `git remote -v` → `upstream` (must be `https://github.com/open-webui/open-webui.git`) |
| Tracking issue | GitHub issue in `jedai/program` repo |
| Conda env | `local` (Python 3.11) — always use this env |

---

## Phase 1 — Preparation

### 1.1 Verify remotes
```bash
git remote -v
```
Expected:
- `origin` → `git@github.disney.com:wdpr-ra-genai/wdpr-ra-openwebui.git`
- `upstream` → `https://github.com/open-webui/open-webui.git`

If `upstream` is missing:
```bash
git remote add upstream https://github.com/open-webui/open-webui.git
```

### 1.2 Create the upgrade branch from `develop`
```bash
git checkout develop
git pull origin develop
git checkout -b feat/upgrade-owui-v<TARGET_VERSION>
```

### 1.3 Fetch the target upstream tag
```bash
git fetch upstream refs/tags/v<TARGET_VERSION>:refs/tags/v<TARGET_VERSION>
```

---

## Phase 2 — Merge Upstream

### 2.1 Merge the upstream tag into the branch
```bash
git merge v<TARGET_VERSION> --no-ff -m "chore: merge upstream open-webui v<TARGET_VERSION>"
```

### 2.2 Resolve conflicts
When conflicts arise follow this priority order:

1. **Keep Disney customizations** — files in `.kiro/`, helm charts (`.helm/`), CI workflows (`.github/workflows/`), and any file containing `jedai`, `disney`, `wdpr`, or `WDPR` in its path or content.
2. **Take upstream for core app files** — `src/`, `backend/open_webui/`, `package.json` (then re-apply version bump), `pyproject.toml`.
3. **Merge carefully** — `backend/requirements.txt`, `docker-compose*.yml`, `.env.example`.

After resolving:
```bash
git add .
git merge --continue
```

---

## Phase 3 — Dependency Check

### 3.1 Compare Python requirements
```bash
git diff v<PREVIOUS_VERSION> v<TARGET_VERSION> -- backend/requirements.txt
```

Install any new/changed deps in the `local` conda env using `uv` (preferred) or `pip3.11` directly:

```bash
conda activate local

# Install uv first if not present
pip install uv

# Install all backend dependencies (run from repo root)
uv pip install -r backend/requirements.txt
```

Alternative if `uv` is not available:
```bash
cd ./backend && /opt/homebrew/bin/pip3.11 install -r requirements.txt
```

Verify no missing modules:
```bash
python -c "import open_webui.main" 2>&1
```

### 3.2 Verify system dependencies (ffmpeg)
```bash
which ffmpeg && ffmpeg -version | head -1
```

If missing:
```bash
brew install ffmpeg
```

> Note: `brew install ffmpeg` takes several minutes. This is a one-time setup per machine.

### 3.3 Compare Node dependencies
```bash
npm install
npm ls 2>&1 | grep -i "error\|invalid\|peer"
```

---

## Phase 4 — Run Locally

### 4.1 Start the backend
```bash
conda activate local
cd backend
sh dev.sh
```

Confirm: `INFO:     Uvicorn running on http://0.0.0.0:8080`

### 4.2 Start the frontend
```bash
npm run dev
```

Confirm at `http://localhost:5173`.

---

## Phase 5 — Changelog Validation

### 5.1 Pull the upstream changelog
```bash
git show v<TARGET_VERSION>:CHANGELOG.md | head -200
```

### 5.2 Compare against previous merge point
```bash
git log --oneline --merges | grep -i "upstream\|merge.*v0\."
```

### 5.3 Categorize each entry
- ✅ **Works as-is** — no Disney-specific impact
- ⚠️ **Needs config/env change** — document what and where
- ❌ **Breaking** — schema change, removed API, or conflicts with Disney customization
- 🆕 **New feature to advertise** — relevant to JedAI users

---

## Phase 5.5 — Contrast Ratio Validation

> **Reference:** #[[file:references/contrast-ratio-validation.md]]

The Disney fork maintains all accessibility overrides in `static/static/custom.css`. After every upstream merge, CSS selectors in that file must be re-validated because upstream redesigns can silently break them.

### 5.5.1 Run the selector ID audit

```bash
grep -oP '#[\w-]+' static/static/custom.css | sort -u | while read id; do
  id_clean="${id#\#}"
  count=$(grep -r "id=\"$id_clean\"" src/ --include="*.svelte" | wc -l)
  echo "$count  $id"
done
```

Any `0` result = broken selector.

### 5.5.2 Check for new upstream `high-contrast` gates

```bash
git diff v<PREVIOUS_VERSION> v<TARGET_VERSION> -- src/app.css | grep -A3 "high-contrast"
```

### 5.5.3 Verify Disney-specific IDs are still in source

| ID | File |
|----|------|
| `id="tab-general"`, `id="tab-about"`, `id="tab-tools"` | `src/lib/components/chat/SettingsModal.svelte` |
| `id="settings-tabs-container"` | `src/lib/components/chat/SettingsModal.svelte` |
| `id="sidebar-chat-item"`, `id="sidebar-chat-group"` | `src/lib/components/layout/Sidebar/ChatItem.svelte` |
| `id="workspace-container"` | `src/routes/(app)/workspace/+layout.svelte` |
| `id="search-options-container"` | `src/lib/components/layout/SearchModal.svelte` |

### 5.5.4 Document findings

Produce a selector audit file at `docs/a11y-<VERSION>-selector-audit.md`.

---

## Phase 6 — Regression Tests via Browser MCP

### 6.1 Auth flow
```
Navigate to: http://localhost:5173
Action: Sign in with SSO / test credentials
Assert: Lands on chat home, no errors in console
```

### 6.2 Chat baseline
```
Action: Start a new chat, send a message to a connected model
Assert: Response streams correctly, no UI errors
```

### 6.3 Model selector
```
Action: Open model dropdown
Assert: All expected models appear, selection persists
```

### 6.4 Settings / Admin panel
```
Navigate to: http://localhost:5173/admin
Assert: Admin panel loads, user management accessible
```

### 6.5 New features from changelog
For each 🆕 item identified in Phase 5, write a browser test step and verify end-to-end.

### 6.6 BYOK credential flow (Disney-specific)
```
Action: Trigger BYOK credential setup
Assert: .kiro/byok_credential_setup.py flow works, no regressions
```

---

## Phase 7 — Go/No-Go & PR

### 7.1 Go/No-Go checklist
- [ ] Backend starts with no import errors
- [ ] Frontend loads at localhost
- [ ] Auth flow works
- [ ] Chat sends and receives messages
- [ ] All ❌ breaking changes addressed
- [ ] All ⚠️ config changes documented and applied
- [ ] Disney customizations preserved
- [ ] Contrast ratio selectors validated
- [ ] Browser regression tests pass

### 7.2 Update the tracking issue
```bash
GH_HOST=github.disney.com gh issue comment <ISSUE_NUMBER> --repo jedai/program \
  --body "Upgrade validated. Go/no-go: GO. PR: <PR_URL>"
```

### 7.3 Open the PR
```bash
GH_HOST=github.disney.com gh pr create \
  --repo wdpr-ra-genai/wdpr-ra-openwebui \
  --base develop \
  --head feat/upgrade-owui-v<TARGET_VERSION> \
  --title "chore: upgrade Open WebUI v<PREVIOUS_VERSION> → v<TARGET_VERSION>" \
  --body "Closes jedai/program#<ISSUE_NUMBER>

## What changed
- Merged upstream open-webui v<TARGET_VERSION>
- Resolved conflicts (list key ones)
- Updated dependencies: (list)

## Validation
- [ ] Backend starts cleanly
- [ ] Frontend loads
- [ ] Browser regression tests passed
- [ ] Contrast ratio selectors validated
- [ ] Breaking changes addressed (see issue comments)
"
```

---

## Key File Locations

| File | Purpose |
|------|---------|
| `backend/requirements.txt` | Python deps — check after every merge |
| `package.json` | Node version and deps |
| `.env.example` | New env vars introduced upstream |
| `.kiro/byok_credential_setup.py` | Disney BYOK flow — verify not broken |
| `.helm/` | Helm charts — usually no upstream changes here |
| `.github/workflows/` | CI — keep Disney workflows, review upstream additions |
| `static/static/custom.css` | All Disney a11y overrides — validate selectors after every merge |
| `references/contrast-ratio-validation.md` | Contrast validation guide and selector stability reference |
| `docs/a11y-<VERSION>-selector-audit.md` | Per-upgrade selector audit output |

---

## Troubleshooting

### `ModuleNotFoundError` on backend start
```bash
conda activate local   # must be Python 3.11, NOT base (3.13)
pip install uv
uv pip install -r backend/requirements.txt
```

### Missing module not in requirements.txt
```bash
pip show <parent-package> | grep Requires
uv pip install <missing-module>
# Add it explicitly to requirements.txt
```

### Merge conflict in `package.json` version field
Always resolve to upstream version, then verify with `npm install`.

### Auth / SSO broken after upgrade
Check `.env` for new required vars — compare `.env.example` diff between versions.
