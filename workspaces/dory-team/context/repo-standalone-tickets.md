# standalone_tickets — Architecture Guide

## Overview

**Repository:** `wdpro-automation/standalone_tickets`
**Host:** github.disney.com
**Stack:** Python 3.12 · Behave 1.3.3 · Selenium 4.41 · Appium 5.1.1
**Package Manager:** UV (uv.lock + pyproject.toml)
**Pre-commit:** ggshield, black (120 chars), isort, flake8, mypy, interrogate (80%), stui-docstring-lint

## Directory Structure

```
standalone_tickets/
├── common/                          # Shared code across all features
│   ├── general_common_steps/        # 99 step files, 4000+ step definitions
│   │   ├── unified_checkout_steps.py        (665 steps — largest)
│   │   ├── general_common_steps.py          (249 steps)
│   │   ├── common_tickets_config_steps.py   (201 steps)
│   │   ├── common_cart_steps.py             (184 steps)
│   │   ├── login_steps.py
│   │   ├── dine/                    # Dine-specific steps
│   │   ├── ap_upgrades/             # Annual Pass upgrade steps
│   │   ├── uce_lodging/             # UCE lodging steps
│   │   └── e2e_reservation_flow/    # E2E reservation steps
│   ├── general_common_steps_mobile/ # Mobile-specific step definitions
│   ├── services/                    # Service layer helpers (API calls)
│   ├── core/                        # Core framework utilities
│   ├── utils.py                     # 129KB — main utility module
│   ├── guest_helper.py              # Guest account management
│   ├── authentication.py            # Auth flows (OneID)
│   ├── booking_tickets.py           # Booking orchestration
│   ├── date_formatter.py            # Date handling utilities
│   ├── offers_helper.py             # Offer/promotion helpers
│   ├── allure_to_xray_json_formatter.py  # Xray results export
│   └── enums/                       # Shared enumerations
├── brand/                           # Page objects per brand
│   ├── wdw_pages.py                 # Walt Disney World pages
│   ├── dlr_pages.py                 # Disneyland Resort pages
│   ├── dta_pages.py                 # Disney Travel Agent pages
│   ├── cast_pages.py                # Cast Member pages
│   └── {brand}_pages.py             # Pattern: one file per brand
├── frontend/                        # UI page objects and modals
│   ├── pages/                       # Page object classes
│   └── modals/                      # Modal dialog classes
├── api/                             # API testing layer
│   ├── service/                     # Raw API clients
│   ├── workflow/                    # Multi-step API workflows
│   ├── assertions/                  # Business rule validators
│   └── helpers/                     # API test utilities
├── datasources/                     # Test data (JSON, CSV, XML)
│   ├── ldv/                         # LDV product data
│   ├── remy/                        # Remy/Dine data
│   ├── services/                    # Service test data
│   └── *.json / *.csv              # Shared test data files
├── *_features/                      # Feature directories per area
│   ├── dlr_features/features/       # DLR scenarios
│   ├── wdw_features/features/       # WDW scenarios
│   ├── ldv_features/                # LDV (validation) scenarios
│   ├── services_features/           # Service API scenarios
│   ├── remy_features/               # Dine/Remy scenarios
│   ├── gam_features/                # GAM scenarios
│   └── wdw_e2e_features/           # E2E flow scenarios
├── scripts/                         # Utility scripts
├── docs/ai/                         # AI context and step catalog
│   ├── step_catalog.json            # 400KB — full step index
│   ├── step_catalog_index.json      # Step catalog summary
│   ├── steps/                       # Step docs by category
│   └── dory/                        # Dory team AI docs
├── .github/
│   ├── pull_request_template.md     # PR template
│   ├── CODEOWNERS                   # Review requirements
│   └── instructions/                # GitHub instructions
├── .kiro/                           # Kiro/Koda config
│   ├── rules/                       # Agent rules
│   └── prompts/                     # Agent prompts
├── behave_config.py                 # Behave hooks & configuration
├── settings.ini                     # Test environment settings
├── behave.ini                       # Behave runner config
├── pyproject.toml                   # UV/Python project config
├── .pre-commit-config.yaml          # Pre-commit hook definitions
└── STUI_DocStrings_Standards.md     # Docstring conventions
```

## Step Definition Organization

Steps are the core of the framework. They live in two main locations:

### Global Steps (`common/general_common_steps/`)
- Shared across ALL features/brands
- 99 Python files, 4000+ `@step(...)` decorators
- Organized by page/feature area (checkout, cart, login, dine, etc.)
- **Critical:** Modifying a step regex here can break dozens of features

### Feature-Specific Steps
- Some feature directories have their own `steps/` subdirectory
- These are scoped to that feature area only
- Examples: `services_features/steps/`, `ldv_features/steps/`

### Mobile Steps (`common/general_common_steps_mobile/`)
- Mobile-specific step implementations (Appium)
- Separate from web steps to avoid conflicts

## Conventions

### BDD/Behave
- All new scenarios MUST be **Scenario Outline** with **Examples**
- Tags: filtering tags (web/mobile/brand/regression) at **Examples** level; Jira/Xray at **Scenario** level
- Steps must be business-oriented (not atomic UI actions)
- One brand and one platform per scenario
- Use `context.brand`, `context.platform`, `context.browser`

### Python Code
- **Thin steps:** No business logic in step definitions — orchestration only
- **Page objects:** UI logic lives in `frontend/pages/` and `brand/`; register in `{brand}_pages.py`
- **Workflows:** Execute service calls; methods that perform requests MUST use `@allure.step`
- **Assertions:** In `api/assertions/`; validate business rules, not raw JSON
- **Data:** Use `datasources/` and `JsonParser.get_json_test_data_from_directory`
- **No sleep:** Use explicit waits (WebDriverWait, custom wait helpers)
- **No shared state:** No `context.shared_data`; no cross-scenario shared state
- **No hardcoded IDs:** No hardcoded product_id, component_id, revenue_id
- **Naming:** `snake_case` everywhere
- **Methods:** Keep small and focused; ≤20 lines per method
- **Exceptions:** No generic `except Exception:`; catch specific exceptions

### Docstrings (Sphinx Style)
- Step definitions: NEVER have `:return:` tag
- POM methods: ALWAYS have `:return:` tag (except `__init__`)
- Native types: Use inline `:param str name:` (NOT separate `:type:` tag)
- Format: Triple double quotes, describe WHAT not HOW

### Pre-commit Hooks
| Hook | Purpose | Config |
|------|---------|--------|
| ggshield | GitGuardian secret detection | — |
| black | Code formatting | --line-length=120 |
| isort | Import sorting | profile=black |
| flake8 | Style checks | --extend-ignore=E722,E203 |
| mypy | Type checking | config from mypy.ini |
| interrogate | Docstring coverage | --fail-under=80 |
| stui-docstring-lint | Custom Sphinx rules | via lint_docstrings.py |

## PR Template Checklist

Every PR must satisfy:
- [ ] PR labeled with correct project label (MAIN for sustainment only)
- [ ] Total lines < 250 (or justified exception)
- [ ] Does not group unrelated test cases or tasks
- [ ] Does not duplicate existing steps, methods, or variables
- [ ] Names are representative and follow conventions
- [ ] Method docstrings present and correct (Sphinx style)
- [ ] BDD scenarios follow Gherkin best practices
- [ ] Methods contain fewer than 20 lines
- [ ] Step methods do NOT interact with Web Elements directly

## Key Files to Watch

| File | Impact | Why |
|------|--------|-----|
| `common/utils.py` | CRITICAL | 129KB utility module — imported everywhere |
| `common/guest_helper.py` | HIGH | Guest management — affects auth flows |
| `common/authentication.py` | HIGH | OneID auth — all scenarios depend on it |
| `behave_config.py` | CRITICAL | Behave hooks — affects ALL scenario execution |
| `settings.ini` | HIGH | Environment config — affects all test runs |
| `brand/*_pages.py` | MEDIUM | Page objects — brand-specific UI flows |
| `frontend/pages/*` | MEDIUM | Shared page objects across brands |
