# Skill: Coverage Test Generation Rules — Angular

Activate this skill when generating Angular tests for OPP gaps or coverage improvement. Contains guardrails, mapping rules, and structural conventions. For concrete code patterns (TestBed, spies, fixtures), refer to `context/angular_test_patterns.md` which is always loaded as a resource.

---

## Critical Rules

1. **NEVER delete existing tests.** All existing tests must be preserved.
2. **If a test matches an OPP scenario:** Add the OPP tag to the describe block only. Do NOT rewrite the test.
3. **If a test doesn't match any OPP scenario:** Leave it as-is.
4. **Only modify a test if it is genuinely broken** (fails to compile).
5. **NEVER use XRay REST endpoints** (`xray_get_test_steps`, `xray_get_test_case_full`) — they return 404. ALWAYS use `jira_get_issue` with `customFields: ["customfield_20104"]`.

---

## File Naming

Test files are colocated with source files in Angular:
- Source: `src/app/{feature}/{file-name}.ts` (service, component, pipe, etc.)
- Test: `src/app/{feature}/{file-name}.spec.ts`

**When adding tests:**
1. Identify which SOURCE file implements the functionality.
2. Find or create the corresponding spec file (`{source-file-name}.spec.ts`).
3. If the spec file exists: add missing test cases within existing `describe` structure.
4. If the spec file does NOT exist: create it with the same name + `.spec.ts`.
5. If you can't identify the source file, ask the user.

---

## XRay → TypeScript Mapping

| XRay Element | TypeScript Element |
|--------------|-------------------|
| Story_Summary | Top-level `describe()` |
| TestCase_Summary | Nested `describe()` — **MUST include OPP key** |
| Step action | Individual `it()` |
| Preconditions | Code in `beforeEach()` of the describe |
| Sequential steps | Single `it()` with sequential expectations |

**Every generated describe block MUST include the OPP ticket key:**

```typescript
describe('OPP-4304: No Actual Schedule', () => {
  it('should not display recommender button when no actual schedule', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

---

## describe vs it Decision

- **UI interactions** (click, navigate, render, DOM state, input): use `it` inside component spec with fixture
- **Business logic** (validate, calculate, transform, return): use `it` inside service spec
- **HTTP calls** (request/response, error handling): use `it` with `HttpClientTestingModule`
- When in doubt: match the pattern of existing specs in the same module

---

## Context Budget

To avoid running out of context window:
- Max **3 source files** per ticket (main component/service + 2 dependencies)
- Max **2 existing spec files** per ticket (target + 1 reference)
- If a source file is >300 lines: focus only on the relevant method/component

---

## Angular-Specific Conventions

- Use `createSpyObj` for service mocks, not manual mock classes
- Use `TestBed.configureTestingModule` for component and service setup
- Use `HttpClientTestingModule` for HTTP testing (never real HTTP)
- Use `fakeAsync` + `tick()` for async operations
- Use `fixture.detectChanges()` after state changes in component tests
- Prefer `By.css()` selectors over `nativeElement.querySelector()`
