# Vista Design System

When building UI for Disney applications:

1. **Always use Vista Web Components first** — check if a `<wdpr-*>` component exists before creating custom HTML
2. **Use Vista design tokens** — colors, spacing, typography via CSS custom properties (`var(--wdpr-*)`)
3. **Tailwind for layout only** — use Tailwind utilities for spacing, flexbox, grid — not for colors or typography that Vista tokens cover
4. **Custom CSS as last resort** — only when no Vista component or token exists

This ensures visual consistency across Disney applications and built-in WCAG 2.1 AA accessibility compliance.
