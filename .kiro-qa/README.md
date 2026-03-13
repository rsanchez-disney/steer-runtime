# QA Profile

**Quality Assurance and Test Automation agents for comprehensive testing**

---

## Agents (6)

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

---

## Structure

```
.kiro-qa/
├── agents/              # 6 agent configurations
│   ├── qa_orchestrator_agent.json
│   ├── test_planner_agent.json
│   ├── test_automation_agent.json
│   ├── defect_analyst_agent.json
│   ├── api_tester_agent.json
│   └── performance_tester_agent.json
├── prompts/             # Agent prompts
├── context/             # QA guidelines and templates
│   ├── qa_guidelines.md
│   ├── test_templates.md
│   └── automation_patterns.md
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
**Agents:** 6  
**Last Updated:** March 12, 2026
