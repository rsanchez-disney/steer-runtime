---
agent: test_planner_agent
name: api-endpoint
description: Plan tests for a new API endpoint — tests plan completeness and coverage strategy
timeout: 300
tags: [qa, standard]
---

Create a test plan for a new POST /api/v1/refunds/validate endpoint in a Java Spring Boot service.

The endpoint:
- Accepts JSON body with chargeId (string) and amount (double)
- Validates that the refund amount does not exceed the original charge
- Returns 200 with {"valid": true/false, "chargeId": "..."}
- Returns 400 for missing/invalid fields
- Writes an audit log entry for each request

The service uses JUnit 5, Mockito, and Spring MockMvc for testing. Target coverage is ≥90%.

Include: unit tests, integration tests, edge cases, error scenarios, and any performance considerations.
