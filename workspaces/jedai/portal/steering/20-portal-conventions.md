---
inclusion: always
---

# Portal conventions — portal

## Stack

- Astro (primary framework — SSR or static)
- React for interactive islands only — keep JS minimal
- Tailwind CSS for styling
- MDX for content pages that need embedded components

## Content conventions

- All documentation pages live in `src/content/` or `src/pages/`
- Use MDX (`.mdx`) for pages that embed components, plain Markdown (`.md`) for static content
- Every page must have frontmatter: `title`, `description`, and `sidebar` (order/label)
- Code examples must be tested and runnable — no pseudocode in reference docs
- Model names in docs must match the logical names in LiteLLM (`config.yaml`)

## File naming

- Pages: `kebab-case.mdx` or `kebab-case.md`
- Components: `PascalCase.astro` or `PascalCase.tsx`
- Utilities: `camelCase.ts`

## Astro-specific rules

- Use Astro components (`.astro`) for layout and static UI — React only where state or interactivity is required
- `client:load` directive only when necessary; prefer `client:visible` for below-the-fold islands
- All external data fetching (model list, changelog) happens at build time via Astro's `getStaticPaths` / `fetch` in frontmatter — never at runtime from the browser
- Environment variables for external URLs go in `.env` and are accessed via `import.meta.env`

## Secrets & config

- No API keys or tokens in page code or frontmatter
- External service URLs (LiteLLM, OpenWebUI) are build-time env vars only

## Testing

- Validate builds with `astro build` before merging
- Broken internal links fail CI — run `astro check` locally before pushing
