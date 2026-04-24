---
name: format-markdown-tables
description: Format markdown tables so pipe characters align vertically across all rows
---

# Format Markdown Tables

Reformat markdown tables in one or more files so that pipe characters (`|`) align vertically and column widths are consistent.

## When to use

- After editing or creating a markdown table
- When reviewing docs and tables look ragged
- When the user asks to "format tables" or "align tables"

## Rules

1. Pad all table cells so that `|` characters align vertically across every row
2. Use consistent column widths — match the widest cell in each column, padding shorter cells with trailing spaces
3. Keep the header separator row (`|---|`) aligned with the same column widths as the content columns (no wider, no narrower)
4. When adding a row to an existing table, adjust all other rows if the new content is wider than the current column
5. Preserve alignment markers in separator rows (`:---`, `---:`, `:---:`) — do not remove them
6. Separator dashes are flush against the pipes — no spaces between `|` and the dashes (e.g. `|---|` not `| --- |`)
7. Never reformat tables inside fenced code blocks (` ``` `)
8. Treat escaped pipes (`\|`) as literal content, not column separators

## Format

Each row follows this pattern — one space of padding on each side of every cell:

```
| Cell1 content | Cell2 content | Cell3 content |
```

Separator row dashes are flush against the pipes — no spaces between `|` and the dashes:

```
| Header A   | Header B | Header C         |
|------------|----------|------------------|
| short      | value    | a longer value   |
| also short | x        | another long one |
```

Center-aligned column example:

```
| Name  | Count |
|-------|:-----:|
| alpha | 3     |
| beta  | 12    |
```

## Process

### Step 1: Identify scope

- If the user specifies files or directories, use those
- Otherwise, ask which files or directories to format

### Step 2: For each file

1. Read the file
2. Skip any content inside fenced code blocks
3. Identify consecutive lines that form a table (lines starting and ending with `|` with 3+ pipe characters)
4. For each table:
   a. Parse cells from each row (split on `|`, trim whitespace, respect `\|` escapes)
   b. Identify the separator row and its alignment markers
   c. Calculate the max content width per column across all non-separator rows (minimum 3)
   d. Rebuild every data/header row: `| cell padded to width | cell padded to width |`
   e. Rebuild the separator row flush against the pipes with no spaces:
      - Default: `|` + dashes × (width + 2) + next `|` — e.g. `|----------|`
      - Left-aligned: `|:` + dashes × (width + 1) + next `|` — e.g. `|:---------|`
      - Right-aligned: `|` + dashes × (width + 1) + `:` + next `|` — e.g. `|---------:|`
      - Center-aligned: `|:` + dashes × width + `:` + next `|` — e.g. `|:--------:|`
      The total character count between pipes must equal the content column width + 2 (the same padding as data rows)
5. Write the file back only if changes were made

### Step 3: Report

List which files were updated and how many tables were reformatted.
