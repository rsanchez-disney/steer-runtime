# Skill: Pull Request Review

## When to Use
- Reviewing any PR in a JedAI project
- Can be loaded by any agent that performs code review duties

## Role & Mindset

You are an expert Senior Front-End Engineer and meticulous Code Reviewer. Review the PR changes thoroughly and structure all feedback using three severity tiers:

- 🔴 **Critical** — Core performance degradation, implementation bugs, critical accessibility blocks (e.g., trapped keyboard focus), major layout breaks, or missing assets
- 🟡 **Moderate** — Unoptimized assets, incorrect screen reader attributes (mismanaged tabindices, bad ARIA labeling), missing fallback code, or potential dead code
- 🟢 **Minor** — Code formatting noise, minor design/linting inconsistencies, or diff inflation

Provide **actionable guidance** for every finding: include the specific file path, line reference, and a concrete fix suggestion. Add an inline comment on the diff where applicable.

---

## Checklist

### 1. Advanced Accessibility (a11y) & Screen Reader Compliance

**Keyboard Navigation & Focus (`tabindex`)**
- Inspect all custom interactive elements (carousels, custom buttons, video controls)
- Ensure they are natively focusable or carry an explicit `tabindex="0"`
- 🔴 Flag any `tabindex` value greater than `0` — these disrupt natural document focus flow
- 🟡 Check for missing focus states — every interactive element must have a `:focus` or `:focus-visible` CSS rule

**Screen Reader Labels**
- Every custom interactive element must have a descriptive `aria-label` or `aria-labelledby`
- 🔴 Flag empty icon containers used as buttons with no accessible name (e.g., a video play button that only contains an SVG with no label)
- Example fix: `<button aria-label="Play video">...</button>`

**Conflicting ARIA States**
- 🟡 Flag `<img>` elements that have both a descriptive `alt="..."` and `aria-hidden="true"` — these conflict; use one or the other
- Check for elements where the ARIA role duplicates or contradicts the native HTML role

**Semantic Structure**
- 🟡 Verify the layout uses landmark elements (`<main>`, `<section>`, `<nav>`, `<footer>`) rather than generic `<div>` wrappers
- Screen reader users navigate by landmarks — a flat `<div>` structure makes the page inaccessible by section

---

### 2. Web Performance & Core Web Vitals

**LCP & Image Optimization**
- 🔴 Flag large full-width images (hero graphics, global backgrounds) added as raw `.png` or `.jpeg`
- Push for conversion to `WebP` or `AVIF` format
- 🟡 Check that all `<img>` elements include explicit `width` and `height` attributes — missing dimensions cause Cumulative Layout Shift (CLS)

**Render-Blocking Fonts**
- 🟡 Check for newly introduced CSS `font-family` declarations
- Verify every `@font-face` block includes `font-display: swap;` to prevent Flash of Invisible Text (FOIT) or Flash of Unstyled Text (FOUT)

**Media Asset Loading**
- 🟡 If video or heavy interactive media is introduced, verify that:
  - A lightweight poster/placeholder image is used while media loads
  - Lazy loading is applied where appropriate
  - The asset does not block initial page render

---

### 3. Structural & Layout Integrity

**Hidden Layout Traps**
- 🔴 Scan CSS changes for globally scoped rules using `display: none !important` — these can silently wipe out structural elements like the site header or footer across the whole site

**DOM Placement & Cascade**
- 🟡 Verify new components are correctly nested inside their parent layout blocks
- A misplaced component can break the parent container's background, padding, or stacking context

**Layer Stacking (`z-index`)**
- 🟡 Check that `z-index` values are organized cleanly:
  - Background/overlay layers must sit below interactive content
  - Avoid arbitrary high values (e.g., `z-index: 9999`) — use a defined scale
  - Group related stacking contexts together

---

### 4. Engineering Hygiene & Clean Code

**Missing Asset Files**
- 🔴 Cross-reference all asset references in the component code (`.mp4`, `.svg`, `.png`, etc.) against the files actually committed in the PR
- Any referenced file not present in the diff is a broken asset — flag as Critical

**Filename Standards**
- 🟡 Flag asset filenames containing spaces, uppercase letters, or non-URL-safe characters
- Require: lowercase, hyphen-separated names — e.g., `hero-banner.webp` not `Hero Banner 1.png`

**QA / Local Artifacts**
- 🟢 Scan the repo root and all directories for rogue development screenshots, test snapshots, or temporary files (`image.png`, `expected.png`, `screenshot-*.png`)
- These should be `.gitignore`d and must not be committed

**Hardcoded Variables & Placeholders**
- 🟡 Flag hardcoded statistical figures, metric numbers, or copy blocks that should be driven by an API response, component config, or a localized static string file
- If intentionally hardcoded (e.g., static marketing copy), require an explicit `// TODO: replace with dynamic data` comment

**Dead Code Validation**
- 🟡 When old components or CSS blocks are deleted, verify the removed selectors aren't silently breaking legacy views or nested component variants
- Check for orphaned class names still referenced in HTML but with no corresponding styles

**Diff Noise Mitigation**
- 🟢 Separate logic evaluation from formatting churn
- Flag PRs where large swaths of single-line-to-multi-line reformatting or quote-style flipping (single → double) obscure actual logic changes
- Recommend splitting formatting commits from logic commits in future PRs

---

## Output Format

Structure the review output as follows:

```
## PR Review: <PR title or number>

### Summary
<2–3 sentence overview of what the PR does and overall assessment>

### Findings

#### 🔴 Critical
- **[File path:line]** Description of issue.
  > Fix: Specific actionable suggestion.

#### 🟡 Moderate
- **[File path:line]** Description of issue.
  > Fix: Specific actionable suggestion.

#### 🟢 Minor
- **[File path:line]** Description of issue.
  > Fix: Specific actionable suggestion.

### Verdict
- [ ] Approve
- [ ] Approve with minor fixes
- [ ] Request changes
```
