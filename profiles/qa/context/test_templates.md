# Test Templates

## Test Case Template

```
Test ID: TC-XXX-001
Title: [Feature] - [Scenario]
Priority: [Critical/High/Medium/Low]
Type: [Functional/Integration/Regression/Smoke]

Preconditions:
- User is logged in
- Test data is available

Test Steps:
1. Navigate to [page/endpoint]
2. Enter [data] in [field]
3. Click [button]
4. Verify [expected result]

Expected Result:
- [Specific, measurable outcome]

Test Data:
- Username: testuser@example.com
- Password: Test123!

Notes:
- [Any additional information]
```

## Bug Report Template

```
Summary: [Clear, concise description]

Environment:
- OS: macOS 14.0
- Browser: Chrome 120
- App Version: 2.5.0
- Environment: Staging

Steps to Reproduce:
1. [Detailed step]
2. [Detailed step]
3. [Detailed step]

Expected Result:
[What should happen]

Actual Result:
[What actually happens]

Severity: [Critical/High/Medium/Low]
Priority: [P0/P1/P2/P3]

Attachments:
- Screenshot: error-screenshot.png
- Logs: application.log
- Video: reproduction.mp4

Additional Information:
- Occurs consistently: Yes/No
- Workaround available: Yes/No
- Related tickets: JIRA-XXX
```

## Test Plan Template

```
# Test Plan: [Feature Name]

## Scope
- In scope: [What will be tested]
- Out of scope: [What won't be tested]

## Test Strategy
- Unit tests: [Approach]
- Integration tests: [Approach]
- E2E tests: [Approach]
- Performance tests: [Approach]

## Test Environment
- Environment: Staging
- Test data: [Source/approach]
- Tools: [List of tools]

## Test Schedule
- Test design: [Dates]
- Test execution: [Dates]
- Defect fixing: [Dates]
- Regression: [Dates]

## Entry Criteria
- Code complete
- Unit tests passing
- Environment ready
- Test data available

## Exit Criteria
- All critical tests passed
- No P0/P1 defects open
- 80%+ test coverage
- Performance benchmarks met

## Risks
- [Risk 1]: [Mitigation]
- [Risk 2]: [Mitigation]
```

## API Test Template

```
Test: POST /api/users - Create User

Request:
POST /api/users
Headers:
  Content-Type: application/json
  Authorization: Bearer {token}
Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}

Expected Response:
Status: 201 Created
Body:
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "createdAt": "2026-03-12T20:00:00Z"
}

Validations:
✓ Status code is 201
✓ Response contains id
✓ Email format is valid
✓ createdAt is ISO 8601 format
✓ Response time < 500ms

Negative Tests:
- Missing required fields → 400
- Invalid email format → 400
- Duplicate email → 409
- Unauthorized → 401
```
