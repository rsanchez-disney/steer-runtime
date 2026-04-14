# Jira Commit Format

Commit messages must include the Jira ticket number as a prefix:

```
[JIRA-XXXX] <type>(<scope>): <message>
```

Where:
- `JIRA-XXXX` is the Jira ticket number (e.g., `DPAY-1234`, `OPS-567`)
- `<type>` is one of: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
- `<scope>` is optional — any noun describing the section
- `<message>` is a short description of the change

Examples:
```
[DPAY-1234] feat(auth): add JWT authentication
[OPS-567] fix(ui): resolve button alignment issue
[DPAY-890] chore(tests): update test dependencies
```

If no Jira ticket is available, ask the user for it. Only use `JIRA-0000` as a last resort placeholder.
