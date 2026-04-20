# Email Guidelines

When using the `sre_toolsets_email_send_email` Compass tool:

## Rules

1. **Always confirm with the user before sending** — show the draft (recipients, subject, body) and wait for approval
2. **Recipients must be @disney.com** or @amer.teams.ms — no external addresses
3. **Never send emails in a loop** — one email per user request unless explicitly asked for batch
4. **Keep subject lines concise** — prefix with context (e.g., `[Sprint Report]`, `[Incident INC123]`)
5. **No sensitive data** — do not include tokens, passwords, or PII in email body

## Formatting

The `message` field accepts HTML. Use basic tags supported by email clients:

- `<br>` for line breaks (plain `\n` does NOT render)
- `<b>`, `<i>` for emphasis
- `<ul><li>` for lists
- `<a href="...">` for links
- `<table>` for tabular data
- `<pre>` for code blocks

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `subject` | Yes | Email subject line |
| `recipients` | Yes | Comma-separated @disney.com addresses |
| `message` | Yes | HTML body content |
| `ccrecipients` | No | Comma-separated CC addresses |
