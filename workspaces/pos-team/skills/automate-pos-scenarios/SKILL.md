---
name: automate-pos-scenarios
description: Workflow for automating POS test scenarios — writing features, step definitions, selectors, and page objects.
knowledge: KNOWLEDGE.md
---

# POS test automation — workflow

## Quick context

- **Stack**: WebDriverIO v9 + Cucumber + Appium (UiAutomator2) + JavaScript ES Modules
- **Pattern**: Page Object Model (composition, NOT inheritance)
- **Selectors**: Decoupled dictionaries in `src/selectors/` with `getSelector(locator)` lookup
- **State sharing**: Global mutable `dataHelperDictionary` object between steps

## Automation workflow (Jira → code)

1. Fetch Jira ticket (summary, description, acceptance criteria)
2. If XRay test case → `jira_xray_get_test_steps`; otherwise parse AC for scenarios
3. Map to Gherkin following project conventions (tags, indentation, naming)
4. Search existing step definitions for reusable steps — check `DSP.js`, `when.js`, `then.js` first
5. Search existing page objects and selectors for matching elements
6. Create `.feature` file in `src/features/components/{component}/`
7. Add new step definitions only if no existing step covers the action
8. Add new validation functions to `printerHelper.js` for receipt checks
9. Add selectors only if new screens/elements are involved
10. Validate: run `gherkin-lint` on feature files, `eslint` on JS files

## Feature file conventions

- Start with `Feature: DSP_GO`
- Tags: `@US:POS-XXXX` (user story), `@TC:POS-XXXX` (test case), `@TASK:POS-XXXX` (task)
- Suite tags: `@DSP_GO_regression`, `@DSP_GO_smoke`, `@QA_regression`, `@multiremote`, `@connect_regression`
- Indentation: Feature at col 0, Scenario at col 2, Steps at col 4
- Scenario name max: 150 chars; Step max: 160 chars; Max steps per scenario: 74
- Feature files go in `src/features/components/{component}/` or `regression/` subfolder

## Code quality rules

- Functions max 30 lines (skip blanks/comments)
- Cyclomatic complexity max 10
- All WebDriverIO wrapper commands must use `async/await` (enforced by `local/require-await-wdio`)
- Naming: selectors use camelCase with suffix — `Btn`, `Txt`, `Lbl`, `Icn`

## Key files to read first

| File                             | Purpose                            |
|----------------------------------|------------------------------------|
| `src/step-definitions/DSP.js`    | All DSP mobile steps (714+ lines)  |
| `src/support/helpers.js`         | findSelector, dataHelperDictionary |
| `src/support/printerHelper.js`   | Receipt validation engine          |
| `src/support/parameterType.js`   | All Cucumber parameter types       |
| `data/regex/regex.js`            | Regex patterns for receipt parsing |
| `src/pageobjects/commons/base.page.js` | Shared utility functions     |
| `.gherkin-lintrc`                | Gherkin lint rules                 |
| `eslint.config.js`              | ESLint flat config                 |

## Selector strategies

- **Mobile**: `'android=new UiSelector().resourceIdMatches(".*pattern.*")'`
- **Web**: XPath (`'//element[@attr="value"]'`) or CSS (`'#id'`, `'.class'`)
- Each selector file exports `getSelector(locator)` returning a dictionary lookup
- File naming: `{context}.page.selectors.js`

## New test checklist

- [ ] Feature file has required tags (`@TC`, `@TASK`, suite tag)
- [ ] Scenario name follows `[Park] | [Component] | [Descriptive name]` pattern
- [ ] Steps reuse existing definitions where possible
- [ ] New selectors follow naming convention (camelCase + suffix)
- [ ] `gherkin-lint` passes
- [ ] `eslint` passes on modified JS files

## New selector checklist

- [ ] No duplicate of existing selector (check other selector files)
- [ ] Uses resource-id regex for mobile (preferred over text-based)
- [ ] Follows naming suffix convention (`Btn`, `Txt`, `Lbl`, `Icn`)
- [ ] Only one `new` keyword (avoid the double-new bug)
- [ ] Selector file name follows `{context}.page.selectors.js` format

## When to load KNOWLEDGE.md

Load the deep knowledge reference when:

- Debugging receipt validation or virtual printer issues
- Working with DDP, split tender, or room charge payment flows
- Adding new venue fields to menu profile
- Understanding the multi-remote architecture
- Reviewing refactoring history or planned improvements
- Working with parallel execution or environment configuration
