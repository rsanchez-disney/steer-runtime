# Skill: Bug Triage & Spec Writing

Use this skill when a bug is reported (by QA, support, or a cast member) and needs to be triaged into a well-defined spec that developers can act on.

## Goal

Produce a bug spec with four mandatory sections. If any section cannot be fully completed from the available information, explicitly call out what is missing and needs follow-up.

## Required Spec Sections

### 1. Reproduction Steps
Describe the exact conditions that trigger the bug:
- Environment (latest / stage / prod)
- Platform (iOS, Android, Web) and version if known
- User role and permissions context
- Numbered step-by-step flow to reproduce
- Any prerequisite data or state (e.g., entity must be open, schedule must exist)

### 2. Current Behavior
What the system does now (the defect):
- Observable outcome when following the reproduction steps
- Include error messages, incorrect values, or broken UI states verbatim
- Note frequency: always reproducible, intermittent, or environment-specific
- Attach or reference screenshots/recordings when available

### 3. Expected Behavior
What the system should do instead:
- Reference the original story or acceptance criteria if available
- Describe the correct outcome in concrete, testable terms
- If no prior spec exists, state the expected behavior based on product intent and flag it for product confirmation

### 4. Constraints
Any code or behavior that must not change:
- Existing workflows or screens that must remain unaffected
- API contracts or data formats that must stay backward compatible
- Permission boundaries that must be preserved
- Performance thresholds that must not regress

## Workflow

1. Gather all available information: JIRA ticket, reporter conversation, screenshots, logs.
2. Draft each of the four sections above.
3. For each section, assess completeness:
   - If a section is fully covered → mark it ✅
   - If a section has gaps → mark it ⚠️ and list what is missing or assumed
4. Classify severity using the project scale:
   - **Critical** — blocks operations, data loss, or security issue
   - **High** — major feature broken, no workaround
   - **Medium** — feature partially broken, workaround exists
   - **Low** — cosmetic or minor inconvenience
5. Identify the affected module and map to the OpSheet summary format: `<Module>: <Screen/Functionality> - <Action>`
6. Output the final spec.

## Spec Output Template

```
## Bug Spec: <Module>: <Screen/Functionality> - <Short Description>

**Severity:** <Critical / High / Medium / Low>
**Platform:** <iOS / Android / Web / All>
**Environment:** <latest / stage / prod>
**Reporter:** <name or team>
**Related JIRA:** <ticket ID if available>

---

### Reproduction Steps <✅ or ⚠️>
1. ...
2. ...
3. ...

> ⚠️ Missing: <describe what is unknown, if applicable>

---

### Current Behavior <✅ or ⚠️>
<description>

> ⚠️ Missing: <describe what is unknown, if applicable>

---

### Expected Behavior <✅ or ⚠️>
<description>

> ⚠️ Missing: <describe what is unknown, if applicable>

---

### Constraints <✅ or ⚠️>
- <constraint 1>
- <constraint 2>

> ⚠️ Missing: <describe what is unknown, if applicable>

---

### Gaps & Follow-ups
<List any open questions or information that must be gathered before development can begin. Remove this section if all four sections above are ✅.>
```

## Output

Save the generated spec to `profiles/ba/specs/{TICKET-ID}.md` (e.g., `profiles/ba/specs/OPS-38206.md`). One file per ticket, named by JIRA ID.

## Checklist

- [ ] All four mandatory sections are present in the spec
- [ ] Each section is marked ✅ (complete) or ⚠️ (gaps identified)
- [ ] Severity is classified
- [ ] Module and summary follow the OpSheet naming convention
- [ ] Reproduction steps are numbered and environment-specific
- [ ] Expected behavior references original acceptance criteria when available
- [ ] Constraints explicitly protect existing behavior and contracts
- [ ] Any gaps are listed with clear follow-up actions
- [ ] Spec is ready to hand off to a developer without ambiguity (or gaps are clearly flagged)
