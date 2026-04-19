# QA Complete Workflows

**End-to-end workflow examples for common QA activities**

---

## Workflow 1: New Feature → Test Ready

**Goal:** Take a new feature from requirements to fully tested

### Step 1: Test Planning (30 min)

```bash
kiro-cli chat --agent test_planner_agent
```

```
Feature DPAY-600 "Saved Payment Methods" needs test coverage.

Create comprehensive test plan:
1. Functional tests (add, edit, delete, select)
2. Validation tests (invalid data, duplicates)
3. Security tests (authorization, data encryption)
4. Integration tests (with payment gateway)
5. UI tests (mobile and desktop)
6. Edge cases (max saved methods, expired cards)

Include test data requirements and priority
```

### Step 2: Test Automation (2-3 hours)

```bash
kiro-cli chat --agent test_automation_agent
```

```
Create automated tests for saved payment methods:

UI Tests (Playwright):
- Add new payment method
- Edit existing method
- Delete method
- Select method during checkout
- Validate error messages

API Tests (REST Assured):
- POST /api/payment-methods
- GET /api/payment-methods
- PUT /api/payment-methods/{id}
- DELETE /api/payment-methods/{id}

Use POM pattern, include test data fixtures
```

### Step 3: Test Execution (1 hour)

```bash
kiro-cli chat --agent test_automation_agent
```

```
Execute test suite and analyze results:
- Run all automated tests
- Capture screenshots for failures
- Generate HTML report
- Identify flaky tests
- Document pass/fail status
```

### Step 4: Bug Reporting (30 min per bug)

```bash
kiro-cli chat --agent defect_analyst_agent
```

```
Create bug reports for test failures:
- Test: "Delete payment method fails"
- Error: 500 Internal Server Error
- Reproduction steps from test
- Logs and screenshots
- Severity and priority assessment
```

**Total Time:** ~4-5 hours  
**Output:** Feature fully tested with automation

---

## Workflow 2: Sprint Regression Testing

**Goal:** Prepare and execute regression tests for sprint

### Day Before Sprint End

```bash
kiro-cli chat --agent test_planner_agent
```

```
Sprint 23 regression prep:

Features in sprint:
- DPAY-520: Payment method management
- DPAY-521: Order history
- DPAY-522: Checkout optimization

Create regression suite:
1. Smoke tests (P0 - critical paths)
2. Feature tests (P1 - new functionality)
3. Regression tests (P2 - existing features)
4. Integration tests (P1 - feature interactions)

Estimate execution time and identify automation gaps
```

### Sprint End Day

```bash
kiro-cli chat --agent test_automation_agent
```

```
Execute regression suite:
- Run automated smoke tests (15 min)
- Run automated regression tests (45 min)
- Execute manual tests for new features (2 hours)
- Document results in test management tool
- Create bug reports for failures
- Generate test summary report
```

**Total Time:** ~3-4 hours  
**Output:** Regression test report, bug list

---

## Workflow 3: API Testing from Scratch

**Goal:** Complete API testing for new endpoint

### Step 1: Test Planning (20 min)

```bash
kiro-cli chat --agent api_tester_agent
```

```
New endpoint: POST /api/subscriptions

Analyze OpenAPI spec and create test plan:
- Functional tests (create subscription)
- Validation tests (required fields, formats)
- Security tests (authentication, authorization)
- Error scenarios (invalid data, duplicates)
- Performance tests (response time < 300ms)
```

### Step 2: Test Implementation (1-2 hours)

```bash
kiro-cli chat --agent api_tester_agent
```

```
Create REST Assured tests for /api/subscriptions:

Positive tests:
- Create subscription with valid data
- Verify response schema
- Check database record created

Negative tests:
- Missing required fields → 400
- Invalid email format → 400
- Duplicate subscription → 409
- Unauthorized access → 401

Performance:
- Response time < 300ms
- Concurrent requests handling
```

### Step 3: Contract Testing (30 min)

```bash
kiro-cli chat --agent api_tester_agent
```

```
Add contract tests:
- Validate against OpenAPI spec
- Check request/response schemas
- Verify all required fields
- Validate data types and formats
- Test enum values

Integrate with CI/CD pipeline
```

### Step 4: Documentation (15 min)

```bash
kiro-cli chat --agent api_tester_agent
```

```
Document API tests in Confluence:
- Test coverage summary
- Test execution instructions
- Known issues/limitations
- CI/CD integration details
```

**Total Time:** ~2-3 hours  
**Output:** Complete API test suite with CI/CD integration

---

## Workflow 4: Performance Baseline Establishment

**Goal:** Establish performance baseline for new feature

### Step 1: Define Performance Goals (15 min)

```bash
kiro-cli chat --agent performance_tester_agent
```

```
Define performance goals for checkout API:

Requirements:
- Response time: p95 < 500ms, p99 < 1s
- Throughput: 100 req/sec minimum
- Error rate: < 0.5%
- Concurrent users: Support 200 users

Create test scenarios for normal, peak, and stress loads
```

### Step 2: Create Load Tests (1 hour)

```bash
kiro-cli chat --agent performance_tester_agent
```

```
Create JMeter load tests:

Scenario 1 - Normal Load:
- 50 concurrent users
- 10 minute duration
- Ramp-up: 2 minutes

Scenario 2 - Peak Load:
- 200 concurrent users
- 15 minute duration
- Ramp-up: 5 minutes

Scenario 3 - Stress Test:
- 500 concurrent users
- 5 minute duration
- Ramp-up: 2 minutes

Include think time and realistic user behavior
```

### Step 3: Execute Tests (2-3 hours)

```bash
kiro-cli chat --agent performance_tester_agent
```

```
Execute performance tests:
1. Run normal load test
2. Analyze results
3. Run peak load test
4. Analyze results
5. Run stress test
6. Identify breaking point
7. Monitor system resources throughout
```

### Step 4: Analysis and Reporting (1 hour)

```bash
kiro-cli chat --agent performance_tester_agent
```

```
Analyze results and create report:
- Response time analysis (avg, p50, p95, p99)
- Throughput analysis
- Error rate analysis
- Resource utilization (CPU, memory, DB)
- Bottleneck identification
- Recommendations for optimization
- Baseline metrics for future comparison
```

**Total Time:** ~4-6 hours  
**Output:** Performance baseline report

---

## Workflow 5: Bug Triage and Analysis

**Goal:** Triage and analyze multiple bugs

### Morning Triage (30 min)

```bash
kiro-cli chat --agent defect_analyst_agent
```

```
Triage new bugs from overnight:

Bugs to analyze:
- DPAY-550: Payment fails intermittently
- DPAY-551: Order confirmation email not sent
- DPAY-552: Cart total calculation wrong
- DPAY-553: UI freezes on checkout

For each bug:
1. Assess severity and priority
2. Attempt reproduction
3. Check for duplicates
4. Assign to appropriate team
5. Add triage notes
```

### Deep Dive Analysis (1-2 hours per critical bug)

```bash
kiro-cli chat --agent defect_analyst_agent
```

```
Deep analysis of DPAY-550 (Critical):

Issue: Payment fails intermittently

Investigate:
1. Review application logs
2. Check database queries
3. Analyze error patterns
4. Review recent code changes
5. Check external service status
6. Identify root cause
7. Assess impact (users affected, revenue)
8. Suggest immediate workaround
9. Recommend permanent fix
10. Update bug with findings
```

**Total Time:** ~2-3 hours  
**Output:** Triaged bugs with analysis

---

## Workflow 6: Test Automation Framework Setup

**Goal:** Set up new automation framework from scratch

### Step 1: Framework Design (1 hour)

```bash
kiro-cli chat --agent test_automation_agent
```

```
Design Playwright automation framework:

Requirements:
- TypeScript
- Page Object Model
- Data-driven testing
- Parallel execution
- Screenshot on failure
- Video recording for failures
- HTML reports
- CI/CD integration (GitHub Actions)

Create:
- Project structure
- Configuration files
- Base classes
- Utilities
- Sample tests
```

### Step 2: Implementation (3-4 hours)

```bash
kiro-cli chat --agent test_automation_agent
```

```
Implement framework:

1. Set up project structure
2. Create base page class
3. Implement page objects (Login, Home, Checkout)
4. Create test utilities (waits, assertions, data)
5. Write sample test cases
6. Configure parallel execution
7. Set up reporting
8. Create CI/CD pipeline
9. Write README with setup instructions
```

### Step 3: Validation (1 hour)

```bash
kiro-cli chat --agent test_automation_agent
```

```
Validate framework:
- Run sample tests locally
- Test parallel execution
- Verify reports generation
- Test CI/CD pipeline
- Review code quality
- Document any issues
```

**Total Time:** ~5-6 hours  
**Output:** Production-ready automation framework

---

## Workflow 7: Security Testing Sprint

**Goal:** Comprehensive security testing

### Step 1: Security Test Planning (30 min)

```bash
kiro-cli chat --agent api_tester_agent
```

```
Create security test plan:

Areas to test:
1. Authentication (bypass, brute force)
2. Authorization (privilege escalation)
3. Input validation (SQL injection, XSS)
4. Session management
5. Data encryption
6. API security
7. CSRF protection
8. Rate limiting

Prioritize by risk level
```

### Step 2: Automated Security Tests (2-3 hours)

```bash
kiro-cli chat --agent api_tester_agent
```

```
Create automated security tests:

Authentication tests:
- Login with invalid credentials
- Session timeout validation
- Password complexity enforcement

Authorization tests:
- Access other users' data
- Privilege escalation attempts
- Role-based access control

Input validation:
- SQL injection in all inputs
- XSS in text fields
- Path traversal attempts
```

### Step 3: Manual Security Testing (2-3 hours)

Perform manual security testing for complex scenarios

### Step 4: Security Report (1 hour)

```bash
kiro-cli chat --agent defect_analyst_agent
```

```
Create security test report:
- Vulnerabilities found (with severity)
- Risk assessment
- Remediation recommendations
- Compliance status
- Retest requirements
```

**Total Time:** ~6-8 hours  
**Output:** Security test report with findings

---

## Workflow 8: Exploratory Testing Session

**Goal:** Structured exploratory testing

### Pre-Session (15 min)

```bash
kiro-cli chat --agent test_planner_agent
```

```
Plan exploratory testing session:

Feature: Payment method selector
Duration: 2 hours
Focus: Usability, edge cases, error handling

Create charter:
- Areas to explore
- Risks to investigate
- Questions to answer
- Success criteria
```

### During Session (2 hours)

Document findings in real-time

### Post-Session (30 min)

```bash
kiro-cli chat --agent defect_analyst_agent
```

```
Document exploratory testing findings:

Session: Payment method selector
Duration: 2 hours

Findings:
1. [Issue description]
2. [Issue description]
3. [Issue description]

For each finding:
- Create bug report if defect
- Document improvement suggestion
- Assess priority

Create session summary for team
```

**Total Time:** ~2.5 hours  
**Output:** Bug reports and session summary

---

## Workflow 9: CI/CD Test Integration

**Goal:** Integrate tests into CI/CD pipeline

### Step 1: Pipeline Design (30 min)

```bash
kiro-cli chat --agent test_automation_agent
```

```
Design CI/CD test pipeline:

Stages:
1. Unit tests (on every commit)
2. Integration tests (on PR)
3. Smoke tests (on merge to main)
4. Regression tests (nightly)
5. Performance tests (weekly)

Define:
- Trigger conditions
- Failure criteria
- Notification strategy
- Artifact retention
```

### Step 2: Implementation (2-3 hours)

```bash
kiro-cli chat --agent test_automation_agent
```

```
Implement GitHub Actions pipeline:

Create workflows for:
- PR validation (unit + integration)
- Main branch (smoke + regression)
- Scheduled (nightly regression, weekly performance)

Include:
- Test execution
- Report generation
- Artifact upload
- Slack notifications
- Failure analysis
```

### Step 3: Validation (1 hour)

Test pipeline with various scenarios

**Total Time:** ~3-4 hours  
**Output:** Fully integrated CI/CD test pipeline

---

## Workflow 10: Test Data Management

**Goal:** Implement test data strategy

### Step 1: Strategy Definition (1 hour)

```bash
kiro-cli chat --agent test_planner_agent
```

```
Define test data management strategy:

Requirements:
- User accounts (various roles)
- Products (different categories)
- Orders (various states)
- Payment methods
- Addresses

Strategy:
- Data generation approach
- Environment-specific data
- Data refresh frequency
- Cleanup procedures
- Sensitive data handling
```

### Step 2: Implementation (2-3 hours)

```bash
kiro-cli chat --agent test_automation_agent
```

```
Implement test data management:

Create:
- Data generation scripts
- Data factories/builders
- Database seeding scripts
- Cleanup utilities
- Environment configuration
- Documentation
```

**Total Time:** ~3-4 hours  
**Output:** Test data management system

---

## Quick Workflow Patterns

### Pattern: Quick Smoke Test
```bash
kiro-cli chat --agent test_automation_agent
> "Run smoke tests and report results"
```

### Pattern: Bug Reproduction
```bash
kiro-cli chat --agent defect_analyst_agent
> "Reproduce bug DPAY-XXX and document steps"
```

### Pattern: API Quick Test
```bash
kiro-cli chat --agent api_tester_agent
> "Quick test POST /api/endpoint with sample data"
```

### Pattern: Performance Check
```bash
kiro-cli chat --agent performance_tester_agent
> "Quick load test with 50 users for 5 minutes"
```

---

## Time-Saving Tips

⚡ **Use orchestrator for multi-step workflows**  
⚡ **Batch similar tests together**  
⚡ **Create reusable test utilities**  
⚡ **Automate repetitive tasks**  
⚡ **Use data-driven approaches**  

---

**See Also:**
- `QA_PROMPT_GUIDE.md` - Detailed prompt examples
- `QA_QUICK_REFERENCE.md` - Quick commands
- `.kiro-qa/context/qa_guidelines.md` - Best practices
