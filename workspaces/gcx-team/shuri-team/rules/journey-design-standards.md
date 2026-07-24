# Journey design standards

Rules for designing and configuring journeys in Adobe Journey Optimizer (AJO) for the Shuri team.

## Journey naming conventions

- Start all journey names with the bracket prefix `[Shuri] -`
- Use lowercase with underscores after the bracket prefix — no spaces or special characters in the base name
- Journeys are created per environment — do not add environment suffixes

```text
[Shuri] - evt_park_entry_welcome_v2
[Shuri] - seg_annual_passholder_renewal_v1
[Shuri] - batch_weekly_dining_offer_v3
```

## Event naming and configuration

- Name events with the pattern: `{domain}_{action}_{detail}`
- Use lowercase snake_case for all event names
- **Required payload fields** for every event:
  - `_wdpro.disneyIds.swid` — unique guest identifier
  - `timestamp` — ISO 8601 event time
  - `eventType` — classification string in camelCase
- Bind events to a versioned XDM schema — never use untyped payloads
- Document schema version in the journey description field

```json
{
  "_wdpro": {
    "disneyIds": {
      "swid": "{4DAF8F04-0838-4EB8-AA9E-F43AF0586268}"
    }
  },
  "timestamp": "2026-07-18T10:00:00Z",
  "eventType": "parkEntryTap"
}
```

## Condition and split standards

- Write PQL conditions with consistent formatting — one predicate per line for complex expressions
- Name every condition branch with a **human-readable label** describing the audience segment
- Always include a fallback/default path — never leave guests stranded in a dead branch
- Avoid negation-only conditions; prefer positive assertions where possible

```text
// Good: readable, one predicate per line
homeEcosystem.passType = "annual"
AND homeEcosystem.renewalEligible = true
AND _experience.ajo.engagementScore > 50

// Bad: dense single line
homeEcosystem.passType="annual" AND homeEcosystem.renewalEligible=true AND _experience.ajo.engagementScore>50
```

- Label branches clearly: "Annual passholder — eligible" not "Condition 1"

## Content personalization rules

- **Always provide fallback values** in Handlebars helpers — never render blank content

```handlebars
{{#if profile.person.name.firstName}}
  Hello, {{profile.person.name.firstName}}!
{{else}}
  Hello, Guest!
{{/if}}
```

- Use the default helper for inline fallbacks:

```handlebars
Hello, {{default profile.person.name.firstName "Guest"}}!
```

- **Test with empty profile attributes** — ensure content renders correctly when fields are null or missing
- **No hardcoded PII** in templates — pull all guest data from profile attributes or event context
- Keep personalization tokens documented in the journey description
- Content delivered via XBS/Hawkeye must follow the same fallback rules

## Testing and activation checklist

Before publishing any journey:

- [ ] Create at least **3 test profiles** covering: happy path, edge case, fallback path
- [ ] Send **proof sends** to internal test recipients for each channel action
- [ ] Verify segment size is within expected bounds — flag if >2x or <0.5x expected
- [ ] Confirm exit criteria trigger correctly with test profiles
- [ ] Validate all personalization renders with empty/null attributes
- [ ] Review condition splits with test profiles entering each branch
- [ ] Verify custom action endpoints return expected responses
- [ ] Check journey duration cap is configured
- [ ] Confirm re-entry rules match requirements
- [ ] Get peer review from a second Shuri team member before activation

## Error handling

- **Custom action failures**: configure a fallback path — never let a failed action silently drop the guest
- Retry configuration:
  - **Max retries**: 3
  - **Retry interval**: 30 seconds with exponential backoff
  - **Timeout**: 10 seconds per call
- On final failure after retries:
  - Route to an error-handling path
  - Log the failure with `swid`, `journeyName`, and `actionName` for observability
  - Do not retry indefinitely — cap total retry window at **5 minutes**
- For XBS/Hawkeye delivery failures, route to the AJO fallback channel if configured
- Document expected error codes and handling behavior in the journey description
