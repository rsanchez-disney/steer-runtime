# Reference: Contrast Ratio Validation After Upstream Upgrade

## Overview

The JedAI Chat fork maintains custom accessibility fixes in `static/static/custom.css` that override Open WebUI's default colors to meet WCAG 2.1 AA/AAA contrast requirements. Every upstream upgrade risks silently breaking these overrides because:

1. Upstream redesigns rename or remove DOM IDs and class combinations
2. Upstream may gate its own a11y fixes behind `html.high-contrast` only
3. New components introduced upstream may not be covered by existing selectors

---

## Key Files

| File | Purpose |
|------|---------|
| `static/static/custom.css` | **All Disney a11y overrides live here** — survives upgrades, never modify core files |
| `src/app.css` | Upstream base styles — check for new `high-contrast` gates after each merge |
| `src/lib/components/chat/SettingsModal.svelte` | Settings tab panel IDs — must preserve `id="tab-{tab}"` on content wrappers |
| `docs/a11y-0.11.0-selector-audit.md` | Full selector audit from 0.10.2 → 0.11.0 upgrade |

---

## Validation Checklist

### Step 1 — Selector audit

```bash
grep -oP '#[\w-]+' static/static/custom.css | sort -u | while read id; do
  id_clean="${id#\#}"
  count=$(grep -r "id=\"$id_clean\"" src/ --include="*.svelte" | wc -l)
  echo "$count  $id"
done
```

Any ID returning `0` is a broken selector — investigate and fix.

### Step 2 — Class combo spot check

| Area | File | Class to verify |
|------|------|----------------|
| Settings inactive tabs | `SettingsModal.svelte` | `text-gray-500` on `button[role="tab"]` |
| Settings active tabs | `SettingsModal.svelte` | `text-gray-900` on `button[role="tab"]` |
| Banner success | `Banner.svelte` | `bg-green-500/20 text-green-700` |
| Banner warning | `Banner.svelte` | `bg-yellow-500/20 text-yellow-700` |
| Banner error | `Banner.svelte` | `bg-red-500/20 text-red-700` |
| Banner info | `Banner.svelte` | `bg-blue-500/20 text-blue-700` |
| Workspace nav | `workspace/+layout.svelte` | `drag-region` on `<nav>`, `text-gray-300` on inactive `<a>` |
| Model listbox | `Selector.svelte` | `[role="listbox"]`, `button.line-clamp-1` |
| Sidebar chat item | `ChatItem.svelte` | `id="sidebar-chat-item"`, `id="sidebar-chat-group"` |
| Sidebar timestamps | `ChatItem.svelte` | `shrink-0 self-center text-gray-400` |

### Step 3 — Check for new `high-contrast` gates in upstream `app.css`

```bash
git diff v<PREVIOUS_VERSION> v<TARGET_VERSION> -- src/app.css | grep -A3 "high-contrast"
```

Port any new gates that fix issues affecting all users into `custom.css` as unconditional overrides.

### Step 4 — Visual browser regression (browser MCP)

| Component | URL / Action | What to check |
|-----------|-------------|---------------|
| Sidebar | `/` | Date group labels, timestamps readable in light + dark |
| Search modal | Click Search | Placeholder, date labels, action hints visible |
| Model selector | Click model name | Unselected filter tabs and model names in flyout |
| Settings modal | Click user menu → Settings | Inactive nav tabs, General/About/Integrations hint text |
| Admin settings | Navigate to admin | Inactive nav tabs, description hints, badge text |
| Workspace | `/workspace` | Inactive nav tabs, search placeholder, secondary text |
| Alert banners | Trigger any alert | All 4 types (info/success/warning/error) readable in light |
| Calendar | `/calendar` | Date numbers, out-of-month dates, day labels |

---

## Known Stable Selectors (safe across upgrades)

```css
[role="dialog"] input::placeholder
[role="dialog"] textarea::placeholder
[role="listbox"] button.line-clamp-1
[data-state=unchecked] span
[data-state=checked] span
#sidebar
#workspace-container
#search-options-container
#model-search-input
#search-input-settings-modal
nav.drag-region a.text-gray-300
```

---

## Known Fragile Selectors (verify after every upgrade)

| Selector | Risk | Last broken |
|----------|------|-------------|
| `button[role="tab"].text-gray-{N}` | Upstream changed inactive tab color class from `text-gray-300` → `text-gray-500` in 0.11.0 | 0.11.0 |
| `#tab-general`, `#tab-about`, `#tab-tools` | Tab panel IDs were removed in 0.11.0; must be added back via `SettingsModal.svelte` | 0.11.0 |
| `#admin-settings-tabs-container` | ID removed in 0.11.0; admin merged into unified SettingsModal | 0.11.0 |
| `button.min-w-fit.outline-none.text-gray-300` | Model selector tab pattern removed in 0.11.0 redesign | 0.11.0 |
| `.modal .text-gray-500` | `.modal` CSS class may not be applied by `Modal.svelte` | Unverified |
| `#sidebar-workspace-button`, `#sidebar-notes-button` | Dynamically generated IDs — verify pattern matches | — |

---

## Disney-Specific IDs to Preserve

| ID | File | Why |
|----|------|-----|
| `id="tab-general"` | `SettingsModal.svelte` | Scopes theme option hiding + General tab hint fixes |
| `id="tab-about"` | `SettingsModal.svelte` | Scopes About section contrast fixes (JEDAI-6577) |
| `id="tab-tools"` | `SettingsModal.svelte` | Scopes Integrations tab hint fixes (JEDAI-6575) |
| `id="settings-tabs-container"` | `SettingsModal.svelte` | Scopes settings nav tab color fixes |
| `id="sidebar-chat-item"` | `ChatItem.svelte` | Scopes sidebar item hover/selected states |
| `id="sidebar-chat-group"` | `ChatItem.svelte` | Scopes sidebar link colors |
| `id="sidebar-chat-item-menu"` | `ChatItem.svelte` | Scopes menu gradient reset |
| `id="workspace-container"` | `workspace/+layout.svelte` | Scopes all workspace contrast fixes |
| `id="search-options-container"` | `SearchInput.svelte` | Scopes search dropdown contrast fixes |

---

## Related Issues & Audits

- **jedai/portal#294** — JedAI Chat Accessibility - Contrast Ratio Remediation (epic)
- **`docs/a11y-0.11.0-selector-audit.md`** — Full 0.10.2 → 0.11.0 selector audit with per-rule status and replacement selectors
