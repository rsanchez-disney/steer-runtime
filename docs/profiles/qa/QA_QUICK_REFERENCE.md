# QA Quick Reference Card

**Print this for your desk!**

---

## Agent Selection

| I need to...          | Use this agent             |
|-----------------------|----------------------------|
| Create test plan      | `test_planner_agent`       |
| Write automated tests | `test_automation_agent`    |
| Analyze bugs          | `defect_analyst_agent`     |
| Test APIs             | `api_tester_agent`         |
| Performance test      | `performance_tester_agent` |
| Complex QA workflow   | `qa_orchestrator_agent`    |

---

## Common Commands

### Start a conversation
```bash
kiro-cli chat --agent <agent_name>
```

### List installed agents
```bash
ls ~/.kiro/agents/ | grep -E "(test|defect|api|performance|qa_orchestrator)"
```

---

## 5-Minute Tasks

### Quick smoke test
```
Run smoke tests for checkout flow and report results
```

### Reproduce bug
```
Reproduce bug DPAY-XXX and document exact steps
```

### Quick API test
```
Test POST /api/endpoint with valid and invalid data
```

### Check test coverage
```
Analyze test coverage for feature DPAY-XXX
```

### Create bug report
```
Create bug report for: [describe issue]
Environment: [staging/prod]
Include reproduction steps and logs
```

---

## Prompt Formula

```
[Action] for [Target]:
- Context: [background]
- Requirements: [what's needed]
- Framework: [tool/framework]
- Assertions: [what to verify]
- Format: [output format]
```

**Example:**
```
Create Playwright tests for login flow:
- Context: User authentication feature
- Requirements: Email/password login, remember me, forgot password
- Framework: Playwright with TypeScript
- Assertions: Successful login, error messages, navigation
- Format: Page Object Model pattern
```

---

## Best Practices

✅ **Be specific** - "Create Playwright tests" not "create tests"  
✅ **Specify framework** - Playwright, Selenium, JMeter, etc.  
✅ **Include assertions** - What should be validated  
✅ **Mention patterns** - POM, data-driven, etc.  
✅ **Request documentation** - Comments and README  

❌ **Don't be vague** - "Test the feature" is too broad  
❌ **Don't skip context** - Provide requirements  
❌ **Don't forget edge cases** - Always mention error scenarios  
❌ **Don't ignore performance** - Specify response time expectations  

---

## Test Planning

### Create test plan
```
Create test plan for [feature]:
- Functional tests
- Edge cases
- Integration tests
- Test data requirements
Format: Jira test cases
```

### Regression suite
```
Create regression suite for Sprint XX:
- Smoke tests (P0)
- Feature tests (P1)
- Regression tests (P2)
Estimate execution time
```

---

## Test Automation

### UI Tests
```
Create [Playwright/Selenium/Cypress] tests for [flow]:
- Use Page Object Model
- Include data-driven tests
- Add proper waits
- Screenshot on failure
```

### API Tests
```
Create [REST Assured/Supertest] tests for [endpoint]:
- Positive and negative tests
- Schema validation
- Response time < [X]ms
```

### Framework Setup
```
Set up [framework] automation framework:
- Project structure
- Base classes
- Sample tests
- CI/CD integration
```

---

## Bug Analysis

### Analyze bug
```
Analyze bug [JIRA-XXX]:
- Reproduce issue
- Root cause analysis
- Severity/priority assessment
- Suggest fixes
```

### Create bug report
```
Create bug report for:
Issue: [description]
Environment: [details]
Include: reproduction steps, logs, screenshots
Assess severity and priority
```

---

## API Testing

### Test endpoint
```
Test [METHOD] [endpoint]:
- Request: [parameters]
- Response: [expected]
- Validations: [schema, status, data]
- Scenarios: [positive, negative, edge]
```

### Contract testing
```
Create contract tests for [API]:
- Validate against OpenAPI spec
- Check request/response schemas
- Verify required fields
- Integrate with CI/CD
```

---

## Performance Testing

### Load test
```
Create [JMeter/k6/Gatling] load test:
- Load: [X] concurrent users
- Duration: [X] minutes
- Metrics: response time, throughput, errors
- Generate HTML report
```

### Analyze results
```
Analyze performance test results:
- Identify bottlenecks
- Review slow endpoints
- Check error patterns
- Provide optimization recommendations
```

---

## Jira Integration

### Read from Jira
```
Fetch test cases for epic DPAY-XXX
```

### Create in Jira
```
Create test cases in Jira for feature DPAY-XXX:
[paste test cases]
```

### Update bug
```
Update bug DPAY-XXX with root cause analysis
```

---

## Troubleshooting

**Tests are flaky**  
→ Request explicit waits and retry logic

**Framework setup fails**  
→ Ask for step-by-step setup with dependencies

**Performance test unclear**  
→ Specify exact metrics and thresholds

**Bug can't reproduce**  
→ Request detailed environment and data setup

---

## Time Estimates

| Task            | Time      | Agent                    |
|-----------------|-----------|--------------------------|
| Test plan       | 30 min    | test_planner_agent       |
| UI automation   | 2-3 hrs   | test_automation_agent    |
| API tests       | 1-2 hrs   | api_tester_agent         |
| Bug analysis    | 30-60 min | defect_analyst_agent     |
| Load test       | 1-2 hrs   | performance_tester_agent |
| Framework setup | 4-6 hrs   | test_automation_agent    |

---

## Testing Frameworks

### UI Testing
- Playwright (TypeScript/JavaScript)
- Selenium WebDriver (Java/Python)
- Cypress (JavaScript)
- TestCafe (JavaScript)

### API Testing
- REST Assured (Java)
- Supertest (Node.js)
- Postman/Newman
- Karate

### Performance
- JMeter
- k6
- Gatling
- Artillery
- Locust

---

## Test Types Quick Reference

**Smoke Tests** - Critical paths, quick validation  
**Regression Tests** - Existing functionality  
**Integration Tests** - Component interactions  
**E2E Tests** - Complete user flows  
**Contract Tests** - API schema validation  
**Load Tests** - Expected user load  
**Stress Tests** - Beyond capacity  
**Security Tests** - Vulnerabilities  

---

## Getting Help

📖 **Detailed guide:** `docs/profiles/qa/QA_PROMPT_GUIDE.md`  
📖 **Workflows:** `docs/profiles/qa/QA_WORKFLOWS.md`  
📖 **Overview:** `docs/profiles/qa/QA_PROFILE_OVERVIEW.md`  
📖 **Guidelines:** `.kiro-qa/context/qa_guidelines.md`  
📖 **Templates:** `.kiro-qa/context/test_templates.md`  
📖 **Patterns:** `.kiro-qa/context/automation_patterns.md`  

---

**Version:** 1.0 | **Updated:** March 12, 2026
