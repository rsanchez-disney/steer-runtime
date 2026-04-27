# Markdown Formatting Rules

Rules for all `.md` files written or edited by agents.

---

## Tables

- Pad all table cells so that pipe characters (`|`) align vertically across every row
- Use consistent column widths — match the widest cell in each column, padding shorter cells with trailing spaces
- Keep the header separator row (`|---|`) aligned with the same column widths
- Center-align numeric columns using `:--:` syntax when appropriate
- When adding a row to an existing table, adjust all other rows if the new content is wider than the current column
- When generating a new table, calculate column widths before writing any rows

Bad:

```md
| Profile | Agents | Audience |
|---------|:------:|----------|
| dev-core | 18 | All developers (orchestrator, review, test, security, PRs) |
```

Good:

```md
| Profile  | Agents | Audience                                                     |
|----------|:------:|--------------------------------------------------------------|
| dev-core |   18   | All developers (orchestrator, review, test, security, PRs)   |
```

---

## Headings

- Use ATX-style headings (`#`, `##`, `###`) — never Setext (`===`, `---` underlines)
- Leave one blank line before and after every heading
- Do not skip heading levels (e.g., `##` → `####` without `###`)
- Use sentence case for headings: capitalize the first word and proper nouns only

---

## Lists

- Use `-` for unordered lists, not `*` or `+`
- Use `1.` for all ordered list items (let the renderer auto-number)
- Indent nested lists by 2 spaces
- Leave one blank line before the first list item when the list follows a paragraph
- Do not leave blank lines between list items unless an item contains multiple paragraphs

---

## Code Blocks

- Always use fenced code blocks (triple backticks) — never indented code blocks
- Always specify a language identifier after the opening fence (e.g., ` ```json `, ` ```bash `, ` ```dart `)
- Use ` ```text ` or ` ```plaintext ` for output that has no specific language
- For inline code, use single backticks: `example`
- Do not nest code blocks inside list items unless absolutely necessary

---

## Links and References

- Prefer reference-style links `[text][ref]` with a `<!-- Links -->` section at the bottom of the file
- Use inline links `[text](url)` only for single-use short references that won't be reused
- When a file has two or more links, collect all link definitions in a `<!-- Links -->` block at the end:

```md
Paragraph referencing [Setup Guide][setup] and [MCP Config][mcp-setup].

<!-- Links -->
[mcp-setup]: docs/reference/MCP_SETUP.md
[setup]: docs/getting-started/SETUP.md
```

- Sort link definitions alphabetically by reference name inside the `<!-- Links -->` block
- Relative links for internal docs: `docs/getting-started/SETUP.md` — not absolute paths
- Do not use bare URLs in prose — always wrap in `<url>` or `[text](url)`

---

## Whitespace and Spacing

- One blank line between paragraphs
- One blank line before and after code blocks, tables, and horizontal rules
- No trailing whitespace on any line
- Files must end with a single newline character
- Use `---` for horizontal rules — not `***` or `___`

---

## Emphasis

- Use `**bold**` for strong emphasis — not `__bold__`
- Use `*italic*` for emphasis — not `_italic_`
- Do not combine bold and italic unless truly necessary
- Use backticks for code references, file names, commands, and identifiers — not bold or italic
