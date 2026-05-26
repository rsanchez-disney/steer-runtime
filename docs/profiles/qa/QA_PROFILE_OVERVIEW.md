# QA Profile Overview

**Complete guide to the Quality Assurance profile**

---

## Profile Summary

**Agents:** 6  
**Focus:** Test planning, automation, defect analysis, API testing, performance testing  
**Target Users:** QA Engineers, Test Automation Engineers, SDET

---

## Agents

### 1. qa_orchestrator_agent
**Role:** Orchestrator  
**Purpose:** Coordinates complex QA workflows across multiple testing agents

**Use for:**
- Multi-step testing workflows
- Coordinating test planning + execution + reporting
- Complex test scenarios requiring multiple agents

**Example:**
```bash
kiro-cli chat --agent qa_orchestrator_agent
> "Complete QA workflow for epic DPAY-500: create test plan, 
   write automated tests, and document in Confluence"
```

---

### 2. test_planner_agent
**Role:** Test Planning Specialist  
**Purpose:** Creates test plans, test cases, and test scenarios

**Use for:**
- Creating test plans from requirements
- Designing test cases with clear steps
- Identifying test scenarios and edge cases
- Defining test coverage strategy
- Creating test data requirements

**Example:**
```bash
kiro-cli chat --agent test_planner_agent
> "Create comprehensive test plan for payment validation feature:
   - Functional test cases
   - Edge cases and error scenarios
   - Integration test scenarios
   - Test data requirements"
```

**Output:**
- Structured test cases ready for Jira
- Test coverage matrix
- Test data specifications
- Risk assessment

---

### 3. test_automation_agent
**Role:** Test Automation Specialist  
**Purpose:** Creates and maintains automated test scripts

**Use for:**
- Writing UI tests (Selenium, Playwright, Cypress)
- Creating API test scripts
- Implementing test frameworks
- Setting up CI/CD test pipelines
- Creating reusable test utilities

**Supported Frameworks:**
- **UI:** Selenium, Playwright, Cypress, TestCafe
- **API:** REST Assured, Supertest, Postman/Newman
- **Unit:** JUnit, Jest, Pytest

**Example:**
```bash
kiro-cli chat --agent test_automation_agent
> "Create Playwright tests for checkout flow:
   - Use Page Object Model pattern
   - Include data-driven tests
   - Add proper waits and assertions
   - Create test fixtures for test data"
```

**Output:**
- Clean, maintainable test code
- Page Object classes
- Test utilities and helpers
- CI/CD integration scripts

---

### 4. defect_analyst_agent
**Role:** Defect Analysis Specialist  
**Purpose:** Analyzes bugs and creates detailed defect reports

**Use for:**
- Analyzing defects and root causes
- Creating detailed bug reports
- Reproducing and documenting issues
- Triaging and prioritizing defects
- Identifying defect patterns

**Example:**
```bash
kiro-cli chat --agent defect_analyst_agent
> "Analyze bug DPAY-550 where payment fails intermittently:
   - Reproduce the issue
   - Identify root cause
   - Assess severity and priority
   - Create detailed bug report with logs
   - Suggest potential fixes"
```

**Output:**
- Detailed bug report with reproduction steps
- Root cause analysis
- Severity/priority assessment
- Screenshots and logs
- Suggested fixes

---

### 5. api_tester_agent
**Role:** API Testing Specialist  
**Purpose:** Tests REST APIs and validates contracts

**Use for:**
- Testing API endpoints
- Validating request/response schemas
- Contract testing (OpenAPI/Swagger)
- Testing authentication/authorization
- API performance testing

**Testing Areas:**
- Functional: HTTP methods, parameters, responses
- Contract: Schema validation, required fields
- Security: Auth, input validation, injection prevention
- Performance: Response times, rate limiting

**Example:**
```bash
kiro-cli chat --agent api_tester_agent
> "Create comprehensive API tests for /api/payments:
   - Test all HTTP methods
   - Validate against OpenAPI spec
   - Test authentication
   - Include negative test cases
   - Validate error responses"
```

**Output:**
- API test suite (Postman/REST Assured)
- Contract validation tests
- Security test cases
- Performance benchmarks

---

### 6. performance_tester_agent
**Role:** Performance Testing Specialist  
**Purpose:** Tests system performance and identifies bottlenecks

**Use for:**
- Load testing
- Stress testing
- Endurance testing
- Spike testing
- Performance benchmarking

**Test Types:**
- **Load:** Expected user load
- **Stress:** Beyond capacity
- **Endurance:** Extended periods
- **Spike:** Sudden load increases

**Key Metrics:**
- Response time (avg, p95, p99)
- Throughput (requests/sec)
- Error rate
- Resource utilization

**Example:**
```bash
kiro-cli chat --agent performance_tester_agent
> "Create JMeter load test for checkout API:
   - 100 concurrent users
   - 5-minute ramp-up
   - 30-minute duration
   - Monitor response times and errors
   - Generate performance report"
```

**Output:**
- JMeter/k6 test scripts
- Performance test results
- Bottleneck analysis
- Optimization recommendations

---

## Daily Workflows

### Workflow 1: Test Planning for New Feature

**Goal:** Create comprehensive test plan from user story

```bash
kiro-cli chat --agent test_planner_agent
> "Create test plan for user story DPAY-523:
   
   Story: As a user, I want to save payment methods for future use
   
   Include:
   - Functional test cases (save, retrieve, delete)
   - Edge cases (invalid data, duplicates)
   - Security tests (authorization, data encryption)
   - Integration tests (with payment gateway)
   - Test data requirements"
```

**Time:** 20-30 minutes  
**Output:** Complete test plan with 15-20 test cases

---

### Workflow 2: Automate Regression Tests

**Goal:** Create automated tests for critical user flow

```bash
kiro-cli chat --agent test_automation_agent
> "Create Playwright automation for payment flow:
   
   Flow:
   1. Login
   2. Add item to cart
   3. Proceed to checkout
   4. Enter payment details
   5. Complete purchase
   
   Requirements:
   - Use Page Object Model
   - Data-driven for multiple payment methods
   - Include assertions at each step
   - Handle async operations properly
   - Add retry logic for flaky elements"
```

**Time:** 1-2 hours  
**Output:** Complete test suite with POM structure

---

### Workflow 3: Bug Investigation

**Goal:** Analyze production bug and create detailed report

```bash
kiro-cli chat --agent defect_analyst_agent
> "Investigate production bug:
   
   Issue: Users report payment failures during peak hours
   
   Analyze:
   - Review application logs
   - Check error patterns
   - Identify affected users/transactions
   - Determine root cause
   - Assess impact
   - Create detailed bug report
   - Suggest immediate workaround
   - Recommend permanent fix"
```

**Time:** 30-45 minutes  
**Output:** Detailed bug report with root cause analysis

---

### Workflow 4: API Contract Testing

**Goal:** Validate API against OpenAPI specification

```bash
kiro-cli chat --agent api_tester_agent
> "Create contract tests for Payment API:
   
   Spec: openapi.yaml
   
   Validate:
   - All endpoints match spec
   - Request/response schemas
   - Required fields
   - Data types and formats
   - Error responses
   - Authentication requirements
   
   Create automated tests that run in CI/CD"
```

**Time:** 45-60 minutes  
**Output:** Contract test suite integrated with CI/CD

---

### Workflow 5: Performance Baseline

**Goal:** Establish performance baseline for new feature

```bash
kiro-cli chat --agent performance_tester_agent
> "Create performance baseline for checkout API:
   
   Scenarios:
   - Normal load: 50 users
   - Peak load: 200 users
   - Stress: 500 users
   
   Measure:
   - Response times (p50, p95, p99)
   - Throughput
   - Error rate
   - Resource utilization
   
   Generate report with recommendations"
```

**Time:** 2-3 hours (including test execution)  
**Output:** Performance baseline report

---

## Best Practices

### Test Planning
✅ Start with requirements analysis  
✅ Cover happy path and edge cases  
✅ Include security and performance tests  
✅ Define clear acceptance criteria  
✅ Document test data needs  

### Test Automation
✅ Follow Page Object Model  
✅ Make tests independent  
✅ Use meaningful test names  
✅ Add proper waits and assertions  
✅ Implement retry logic for flaky tests  
✅ Keep test code clean and maintainable  

### Defect Management
✅ Provide clear reproduction steps  
✅ Include logs and screenshots  
✅ Assess severity and priority correctly  
✅ Document workarounds  
✅ Link to related issues  

### API Testing
✅ Test all HTTP methods  
✅ Validate schemas  
✅ Include negative tests  
✅ Test authentication  
✅ Verify error handling  

### Performance Testing
✅ Define clear performance goals  
✅ Test in production-like environment  
✅ Ramp up load gradually  
✅ Monitor all system components  
✅ Document findings and recommendations  

---

## Installation

```bash
# Install QA profile
koda install qa

# Install to project (for Kiro UI)
koda install qa --project ~/my-project

# Install with other profiles
koda install dev qa
```

---

## See Also

- **Setup Guide:** `../index.md`
- **Agent Reference:** `../AGENTS.md`
- **QA Guidelines:** `.kiro-qa/context/qa_guidelines.md`
- **Test Templates:** `.kiro-qa/context/test_templates.md`
- **Automation Patterns:** `.kiro-qa/context/automation_patterns.md`

---

**Version:** 1.0  
**Last Updated:** March 12, 2026  
**Agents:** 6  
**Target Users:** QA Engineers, Test Automation Engineers, SDET
