---
inclusion: on-demand
trigger: "email|notify|send message|teams message|send notification"
description: "Email and notification guidelines — loaded when task involves sending communications"
---

# Email guidelines

Tool: `sre_toolsets_email_send_email` (Compass)

- Always confirm with user before sending (show draft: recipients, subject, body)
- Recipients: @disney.com or @amer.teams.ms only — no external
- Never send in a loop — one email per request unless batch requested
- Subject: concise, prefix with context (`[Sprint Report]`, `[Incident INC123]`)
- No sensitive data (tokens, passwords, PII) in body
- Body is HTML: use `<br>` for newlines, `<b>/<i>` emphasis, `<ul><li>` lists, `<a>` links, `<table>` tables
- Params: `subject` (required), `recipients` (required, comma-sep), `message` (required, HTML), `ccrecipients` (optional)
