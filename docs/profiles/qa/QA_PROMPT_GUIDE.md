# QA Prompt Guide

**Effective prompts for QA Engineers and Test Automation Engineers**

This guide shows how to use QA agents in your daily testing workflow with real-world examples.

---

## Quick Reference

| Task                  | Agent                      | Example Prompt                                                |
|-----------------------|----------------------------|---------------------------------------------------------------|
| Create test plan      | `test_planner_agent`       | "Create test plan for payment validation feature DPAY-500"    |
| Write automated tests | `test_automation_agent`    | "Create Playwright tests for login flow with POM pattern"     |
| Analyze bug           | `defect_analyst_agent`     | "Analyze bug DPAY-550 and provide root cause analysis"        |
| Test API              | `api_tester_agent`         | "Create API tests for /api/payments with contract validation" |
| Performance test      | `performance_tester_agent` | "Create JMeter load test for checkout, 100 concurrent users"  |
| Complex workflow      | `qa_orchestrator_agent`    | "Complete QA workflow for epic DPAY-500"                      |

---

## Daily Workflows

### 1. Creating Test Plan for New Feature

**Scenario:** New feature needs comprehensive test coverage.

```bash
kiro-cli chat --agent test_planner_agent
```

**Prompt:**
```
Create comprehensive test plan for payment validation feature DPAY-500:

Requirements:
- Validate credit card numbers (Visa, MC, Amex)
- Show inline validation errors
- Support saved payment methods
- Work on mobile and desktop

Include:
- Functional test cases (happy path)
- Edge cases (invalid cards, expired, etc.)
- Error scenarios
- Integration test cases
- Security test cases
- Test data requirements
- Acceptance criteria for each test
```

**Output:**
- 15-20 structured test cases
- Test coverage matrix
- Test data specifications
- Priority and type for each test

---

### 2. Writing UI Automation Tests

**Scenario:** Automate regression tests for critical user flow.

```bash
kiro-cli chat --agent test_automation_agent
```

**Prompt:**
```
Create Playwright automation for checkout flow:

Flow:
1. Login as registered user
2. Add product to cart
3. Proceed to checkout
4. Enter shipping address
5. Select payment method
6. Complete purchase
7. Verify order confirmation

Requirements:
- Use Page Object Model pattern
- Data-driven for multiple users
- Include assertions at each step
- Handle async operations
- Add retry logic for flaky elements
- Create test fixtures for test data
- Add comments for complex logic
```

**Output:**
- Complete test suite with POM
- Page object classes
- Test data fixtures
- Helper utilities
- CI/CD integration

---

### 3. API Testing

**Scenario:** Test new REST API endpoint.

```bash
kiro-cli chat --agent api_tester_agent
```

**Prompt:**
```
Create comprehensive API tests for POST /api/payments:

Endpoint details:
- Creates new payment transaction
- Requires authentication
- Accepts JSON body with amount, method, currency
- Returns transaction ID and status

Test coverage:
- Successful payment creation
- Invalid authentication
- Missing required fields
- Invalid data types
- Boundary values (amount limits)
- Duplicate transaction prevention
- Response schema validation
- Response time < 500ms

Use REST Assured (Java) or Supertest (Node.js)
```

**Output:**
- Complete API test suite
- Positive and negative tests
- Schema validation
- Performance assertions

---

### 4. Bug Investigation and Reporting

**Scenario:** Production bug needs analysis.

```bash
kiro-cli chat --agent defect_analyst_agent
```

**Prompt:**
```
Investigate and analyze production bug:

Issue: Payment processing fails intermittently during peak hours

Available information:
- Error occurs 2-3 times per hour during 12pm-2pm
- Error message: "Transaction timeout"
- Affects approximately 5% of transactions
- No pattern in user accounts or payment methods

Analyze:
1. Review application logs for error patterns
2. Check database query performance
3. Identify potential root causes
4. Assess severity and business impact
5. Create detailed bug report with:
   - Clear reproduction steps
   - Root cause analysis
   - Severity/priority assessment
   - Screenshots/logs
   - Suggested fixes
   - Workaround if available
```

**Output:**
- Detailed bug report
- Root cause analysis
- Severity: High, Priority: P1
- Reproduction steps
- Suggested fixes

---

### 5. Performance Testing

**Scenario:** Establish performance baseline for new feature.

```bash
kiro-cli chat --agent performance_tester_agent
```

**Prompt:**
```
Create performance test for checkout API:

Scenarios:
1. Normal load: 50 concurrent users, 10 min
2. Peak load: 200 concurrent users, 15 min
3. Stress test: 500 concurrent users, 5 min

Endpoints to test:
- POST /api/cart/add
- GET /api/cart
- POST /api/checkout
- POST /api/payment

Measure:
- Response times (avg, p50, p95, p99)
- Throughput (requests/sec)
- Error rate (should be < 1%)
- Resource utilization

Use JMeter and generate HTML report
```

**Output:**
- JMeter test script
- Test execution results
- Performance report
- Bottleneck analysis
- Recommendations

---

### 6. Test Automation Framework Setup

**Scenario:** Set up new test automation framework.

```bash
kiro-cli chat --agent test_automation_agent
```

**Prompt:**
```
Set up Playwright test automation framework:

Requirements:
- TypeScript
- Page Object Model structure
- Test data management
- Screenshot on failure
- Parallel execution
- HTML report generation
- CI/CD integration (GitHub Actions)

Create:
- Project structure
- Base page class
- Sample page objects (Login, Home)
- Sample test cases
- Test utilities (waits, assertions)
- Configuration files
- README with setup instructions
```

**Output:**
- Complete framework structure
- Sample tests
- Configuration
- CI/CD pipeline
- Documentation

---

### 7. Regression Test Suite

**Scenario:** Create regression test suite for sprint.

```bash
kiro-cli chat --agent test_planner_agent
```

**Prompt:**
```
Create regression test suite for Sprint 23:

Features in sprint:
- Payment method management (DPAY-520)
- Order history improvements (DPAY-521)
- Checkout flow optimization (DPAY-522)

Create:
- Smoke tests (critical paths)
- Regression tests (existing functionality)
- Integration tests (feature interactions)
- Priority for each test (P0, P1, P2)
- Estimated execution time
- Automation candidates

Format: Ready for import to Jira/TestRail
```

**Output:**
- Categorized test suite
- 30-40 test cases
- Priority and estimates
- Automation recommendations

---

### 8. API Contract Testing

**Scenario:** Validate API against OpenAPI specification.

```bash
kiro-cli chat --agent api_tester_agent
```

**Prompt:**
```
Create contract tests for Payment API:

OpenAPI spec: api/openapi.yaml

Validate:
- All endpoints defined in spec exist
- Request schemas match spec
- Response schemas match spec
- Required fields are enforced
- Data types are correct
- Enum values are validated
- Error responses match spec

Create automated tests that:
- Run in CI/CD pipeline
- Fail build if contract violations found
- Generate contract validation report

Use Pact or OpenAPI validator
```

**Output:**
- Contract test suite
- CI/CD integration
- Validation report

---

### 9. Exploratory Testing Session

**Scenario:** Document exploratory testing findings.

```bash
kiro-cli chat --agent defect_analyst_agent
```

**Prompt:**
```
Document exploratory testing session:

Feature: New payment method selector
Time: 2 hours
Focus areas: Usability, edge cases, error handling

Findings:
1. Dropdown doesn't close when clicking outside
2. Saved cards show expired ones
3. No loading indicator during validation
4. Error messages not accessible (no ARIA labels)
5. Mobile view cuts off card numbers

For each finding:
- Create bug report if defect
- Assess severity and priority
- Suggest improvements
- Document in Confluence

Create summary report for team
```

**Output:**
- 5 bug reports in Jira
- Improvement suggestions
- Session summary
- Confluence documentation

---

### 10. Load Test Analysis

**Scenario:** Analyze load test results and identify issues.

```bash
kiro-cli chat --agent performance_tester_agent
```

**Prompt:**
```
Analyze load test results:

Test: Checkout flow, 200 concurrent users
Duration: 30 minutes

Results:
- Average response time: 850ms (target: 500ms)
- P95 response time: 2.1s
- P99 response time: 4.5s
- Error rate: 3.2% (target: <1%)
- Throughput: 45 req/sec

Analyze:
1. Identify bottlenecks
2. Review slow endpoints
3. Check error patterns
4. Assess database performance
5. Review resource utilization
6. Provide optimization recommendations
7. Suggest next steps

Create detailed analysis report
```

**Output:**
- Bottleneck analysis
- Optimization recommendations
- Action items
- Detailed report

---

### 11. Test Data Management

**Scenario:** Create test data strategy.

```bash
kiro-cli chat --agent test_planner_agent
```

**Prompt:**
```
Create test data management strategy:

Application: E-commerce payment system

Data needs:
- User accounts (various roles)
- Products (different categories, prices)
- Payment methods (cards, saved methods)
- Orders (various states)
- Addresses (domestic, international)

Strategy should include:
- Data generation approach
- Data refresh strategy
- Environment-specific data
- Sensitive data handling
- Data cleanup approach
- Automation of data setup

Document in Confluence
```

**Output:**
- Test data strategy
- Data generation scripts
- Cleanup procedures
- Documentation

---

### 12. Security Testing

**Scenario:** Perform security testing on API.

```bash
kiro-cli chat --agent api_tester_agent
```

**Prompt:**
```
Perform security testing on Payment API:

Test areas:
1. Authentication bypass attempts
2. Authorization checks (access other users' data)
3. SQL injection in all parameters
4. XSS in input fields
5. CSRF protection
6. Rate limiting
7. Sensitive data exposure
8. Input validation

For each area:
- Create test cases
- Execute tests
- Document findings
- Assess risk level
- Provide remediation suggestions

Create security test report
```

**Output:**
- Security test cases
- Vulnerability findings
- Risk assessment
- Remediation plan

---

## Advanced Techniques

### Chaining Agents

For complex workflows, use orchestrator:

```bash
kiro-cli chat --agent qa_orchestrator_agent
```

**Prompt:**
```
Complete QA workflow for feature DPAY-500:
1. Create test plan
2. Write automated tests (UI + API)
3. Execute tests and document results
4. Create bug reports for failures
5. Document test coverage in Confluence
```

### Data-Driven Testing

```
Create data-driven tests for login:

Test data:
- Valid credentials
- Invalid email format
- Wrong password
- Locked account
- Expired password

Generate test for each scenario with clear assertions
```

### Parallel Test Execution

```
Set up parallel test execution:
- Configure for 4 parallel threads
- Implement thread-safe test data
- Handle shared resources
- Generate consolidated report
```

---

## Best Practices

### ✅ Do

- **Be specific:** "Create Playwright tests for login" vs "Create tests"
- **Provide context:** Include requirements, acceptance criteria
- **Specify framework:** "Use Playwright" vs "Use automation tool"
- **Define assertions:** What should be validated
- **Include test data:** Provide sample data or requirements

### ❌ Don't

- **Be vague:** "Test the feature" (too broad)
- **Skip requirements:** Agents need context
- **Forget edge cases:** Always mention error scenarios
- **Ignore performance:** Specify response time expectations
- **Skip documentation:** Request comments and documentation

---

## Prompt Templates

### Test Planning
```
Create test plan for [feature]:
- Requirements: [list requirements]
- Test types: [functional, integration, etc.]
- Coverage: [areas to cover]
- Priority: [critical paths]
- Format: [Jira/TestRail/Excel]
```

### Test Automation
```
Create [framework] tests for [feature]:
- Flow: [step by step]
- Pattern: [POM/other]
- Assertions: [what to verify]
- Test data: [data requirements]
- Framework: [Playwright/Selenium/etc.]
```

### Bug Report
```
Analyze and report bug:
- Issue: [description]
- Environment: [details]
- Impact: [user/business impact]
- Include: [logs, screenshots, reproduction]
- Suggest: [potential fixes]
```

### API Testing
```
Test API endpoint [method] [path]:
- Request: [parameters, body]
- Response: [expected response]
- Validations: [schema, status, data]
- Scenarios: [positive, negative, edge cases]
- Tool: [REST Assured/Supertest/etc.]
```

### Performance Testing
```
Create performance test for [feature]:
- Load: [concurrent users]
- Duration: [time]
- Metrics: [response time, throughput, errors]
- Tool: [JMeter/k6/Gatling]
- Report: [format and details]
```

---

## Troubleshooting

### Tests are flaky
**Solution:** Request explicit waits, retry logic, and stable selectors

### Unclear test results
**Solution:** Ask for detailed assertions and error messages

### Framework setup issues
**Solution:** Request step-by-step setup guide with dependencies

### Performance test unclear
**Solution:** Specify exact metrics and thresholds

---

## Quick Tips

💡 **Start with test plan** before automation  
💡 **Use specific frameworks** (Playwright, not "automation tool")  
💡 **Request POM pattern** for maintainable tests  
💡 **Include negative tests** always  
💡 **Specify assertions** clearly  
💡 **Request documentation** in test code  

---

## Next Steps

- See `QA_WORKFLOWS.md` for complete workflow examples
- See `QA_QUICK_REFERENCE.md` for quick commands
- See `.kiro-qa/context/qa_guidelines.md` for best practices

---

**Version:** 1.0  
**Last Updated:** March 12, 2026
