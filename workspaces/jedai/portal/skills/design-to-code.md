# Skill: Design to Code (Figma → Astro)

## When to Use
- User asks to implement a design, mentions a Figma node ID, or references a visual component for the blog page
- User says "implement this design", "match Figma", or provides a `node-id`

---

## Context

- **Figma file**: https://www.figma.com/design/PVDaQtFUDdYEO9eu3TjffB/Jedai-Portal-New?node-id=1666-7053&m=dev
- **Local dev server**: http://localhost:4321
- **Active files**: `src/pages/<page>/index.astro` (e.g., `src/pages/blog/index.astro`), `src/styles/<page>.css` (e.g., `src/styles/blog.css`)

---

## Workflow

### Step 1 — Get the node ID
If the user has not provided a Figma node ID, ask:

> "Which Figma node ID should I implement? You can find it in the Figma URL as `node-id=XXXX`"

Do not proceed until a node ID is provided.

---

### Step 2 — Read the active editor file
Check the currently open file for context — it will typically be `src/pages/blog/index.astro` or `src/styles/blog.css`. Read it to understand the existing structure and code style before making any changes.

---

### Step 3 — Inspect the Figma node via Chrome DevTools MCP

Use `@chrome-devtools/*` to navigate to the Figma node:

1. Navigate to the base Figma file:
   ```
   https://www.figma.com/design/PVDaQtFUDdYEO9eu3TjffB/Jedai-Portal-New
   ```

2. If a `node-id` is provided, navigate to the specific node URL:
   ```
   https://www.figma.com/design/PVDaQtFUDdYEO9eu3TjffB/Jedai-Portal-New?node-id=<NODE_ID>&m=dev
   ```

3. Use `takeSnapshot` on the Figma tab to read the design structure as text — extract:
   - Typography (font family, size, weight, line height, letter spacing)
   - Spacing (padding, margin, gap values)
   - Colors (hex or CSS variable equivalents)
   - Layout (flex/grid, direction, alignment, sizing)
   - Component hierarchy and nesting

---

### Step 4 — Check current state on localhost

Navigate to `http://localhost:4321` (or the relevant blog route) using Chrome DevTools MCP and take a snapshot. This gives you the current rendered state to diff against the Figma design.

---

### Step 5 — Implement the changes

Apply the design to the active file(s) following these rules:

- **Match existing code style** — Astro components in `.astro` files, styles in `src/styles/<page>.css` (e.g., `src/styles/blog.css`)
- **CSS variables first** — if the project uses CSS custom properties for colors/spacing, use them; only use raw values if no variable exists
- **No inline styles** — all styles go in `src/styles/<page>.css` (e.g., `src/styles/blog.css`) or a scoped `<style>` block in the `.astro` file
- **Astro component structure**:
  ```astro
  ---
  // frontmatter / imports
  ---
  <section class="blog-section">
    <!-- markup -->
  </section>
  <style>
    /* scoped styles only if truly component-specific */
  </style>
  ```
- **Pixel-perfect spacing** — use exact values from the Figma snapshot (convert px to rem where the project convention requires it)

---

### Step 6 — Ask for the next node

Once the implementation is complete, ask:

> "Done. Which node should I implement next?"

**Do not verify the implementation visually after finishing** — move on when the user confirms or provides the next node ID.

---

## Rules

- Never modify files outside `src/pages/` and `src/styles/` unless explicitly told to
- Never auto-verify by re-navigating to localhost after implementing — trust the diff and ask for next node
- If the Figma snapshot is ambiguous or text is truncated, ask a targeted clarifying question before coding
- Keep CSS class names consistent with the existing naming convention in the page's `src/styles/<page>.css` file
