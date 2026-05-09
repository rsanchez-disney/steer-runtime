# QA Profile

**Quality Assurance and Test Automation agents for comprehensive testing**

---

## Agents (16)

### qa_orchestrator_agent
Coordinates QA tasks and delegates to specialized testing agents.

**Use when:** Complex testing workflows requiring multiple agents

### test_planner_agent
Creates test plans, test cases, and test scenarios from requirements.

**Use when:** 
- Planning test coverage
- Creating test cases
- Defining test strategies
- Identifying test scenarios

### test_automation_agent
Creates and maintains automated test scripts (UI, API, integration).

**Use when:**
- Writing automated tests
- Creating test frameworks
- Implementing test patterns
- Setting up CI/CD tests

### defect_analyst_agent
Analyzes defects, performs root cause analysis, creates bug reports.

**Use when:**
- Analyzing bugs
- Root cause analysis
- Creating detailed bug reports
- Triaging defects

### api_tester_agent
Tests REST APIs, validates contracts, creates API test suites.

**Use when:**
- Testing API endpoints
- Contract testing
- API validation
- Creating API test suites

### performance_tester_agent
Creates and executes performance tests, analyzes results.

**Use when:**
- Load testing
- Stress testing
- Performance benchmarking
- Identifying bottlenecks

### qe_strategy_agent
Creates test strategy documents with scope, approach, and risk assessment.

**Use when:** Defining testing approach, risk-based prioritization

### e2e_test_generator_agent
Generates Gherkin E2E test scenarios from user stories.

**Use when:** Happy path, edge case, and negative test scenarios

### web_discovery_agent
Discovers testable elements and page objects from web app source.

**Use when:** Test automation prep, selector mapping, user flow discovery

### test_framework_agent
Generates test automation scaffolding per tech stack.

**Use when:** Test config, base helpers, CI pipeline snippets

### test_coverage_analyzer_agent
Analyzes test coverage for epics against Jira/Xray and discovers reusable tests.

**Use when:**
- Coverage gap analysis for epics
- Discovering reusable tests across projects
- Building coverage matrix reports
- Identifying orphan tests and missing ACs

---

### flaky_test_fixer_agent
Diagnoses intermittently failing tests, experiments with fixes, verifies 0/N failure rate.

**Use when:** Tests pass sometimes and fail others (timing, selectors, race conditions)

### bruno_collection_agent
Converts Gherkin, OpenAPI specs, or test cases into organized Bruno collections.

**Use when:** Creating API test collections with environment configs and assertions

### test_recorder_agent
Records browser interactions via Playwright codegen, captures selectors, produces TypeScript specs.

**Use when:** Generating page objects and test specs from manual browser interactions

### web_scraping_validator_agent
Validates web pages by scraping DOM content, checking structure, accessibility, and correctness.

**Use when:** Validating rendered page content against expected structure

### time_machine_agent
Simulates accessing a website at a given date/time by overriding the browser clock.

**Use when:** Testing date-dependent content (promotions, schedules, countdowns)

---

## Capabilities

All agents have access to:
- ✅ **Jira** - Read/write test cases, defects
- ✅ **Confluence** - Read/write test documentation
- ✅ **Code Tools** - Read/write test code
- ✅ **Execution** - Run tests, analyze results
- ✅ **File Operations** - Manage test artifacts

---

## Quick Start

```bash
# Install QA profile
./setup.sh install qa

# Use an agent
kiro-cli chat --agent test_planner_agent
```

---

## Example Usage

### Create Test Plan
```bash
kiro-cli chat --agent test_planner_agent
> "Create test plan for payment validation feature DPAY-500"
```

### Write Automated Tests
```bash
kiro-cli chat --agent test_automation_agent
> "Create Playwright tests for login flow with POM pattern"
```

### Analyze Defect
```bash
kiro-cli chat --agent defect_analyst_agent
> "Analyze bug DPAY-550 and provide root cause analysis"
```

### Test API
```bash
kiro-cli chat --agent api_tester_agent
> "Create API tests for /api/payments endpoint with contract validation"
```

### Performance Test
```bash
kiro-cli chat --agent performance_tester_agent
> "Create JMeter load test for checkout flow, 100 concurrent users"
```

### Coverage Analysis
```bash
kiro-cli chat --agent test_coverage_analyzer_agent
> "Analyze test coverage for epic DPAY-600 and find reusable tests"
```

---

## Structure

```
.kiro-qa/
├── agents/              # 11 agent configurations
│   ├── qa_orchestrator_agent.json
│   ├── test_planner_agent.json
│   ├── test_automation_agent.json
│   ├── defect_analyst_agent.json
│   ├── api_tester_agent.json
│   ├── performance_tester_agent.json
│   ├── qe_strategy_agent.json
│   ├── e2e_test_generator_agent.json
│   ├── web_discovery_agent.json
│   ├── test_framework_agent.json
│   └── test_coverage_analyzer_agent.json
├── prompts/             # Agent prompts
├── context/             # QA guidelines and templates
│   ├── qa_guidelines.md
│   ├── test_templates.md
│   ├── automation_patterns.md
│   └── coverage_matrix_template.md
└── README.md            # This file
```

---

## Testing Frameworks Supported

### UI Testing
- Selenium WebDriver
- Playwright
- Cypress
- TestCafe

### API Testing
- REST Assured (Java)
- Supertest (Node.js)
- Postman/Newman
- Karate

### Performance Testing
- JMeter
- Gatling
- k6
- Artillery
- Locust

### Unit/Integration
- JUnit/TestNG (Java)
- Jest/Mocha (JavaScript)
- Pytest (Python)

---

## See Also

- Main README: `../README.md`
- Setup guide: `../setup.sh`
- Full documentation: `../docs/`

---

**Profile Version:** 1.0  
**Agents:** 11  
**Last Updated:** April 2, 2026
