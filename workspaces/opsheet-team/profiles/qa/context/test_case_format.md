# Test Case File Format

Each test case must be saved as `{OPS-XXXX}-{short-slug}.md` under `./artifacts/test_cases/` and follow this exact structure:

---

# Metadata

| Field                | Value                                     |
|----------------------|-------------------------------------------|
| Type                 | Test                                      |
| Priority             | 3 - Medium                                |
| Components           | {copied from testable ticket}             |
| Labels               | QA_GB_Internal, QA_GB_Internal-IA         |
| Test Repository Path | Globant TC/{epic id}/{testable ticket id} |
| Assignee             | {logged user}                             |

# Title

{Testable ticket ID} - {slug}

# Description

As an: {role}
I want: {goal derived from the AC or OPP test}

Background:
    Given {precondition 1}
    And {precondition 2}

# Test Details

Type: Cucumber

Scenario: {scenario name}
    Given {context}
    When {action}
    Then {expected outcome}

---

Rules:
- Use Gherkin keywords: Given / When / Then / And / But.
- Each file contains exactly ONE scenario. If a behavior requires multiple scenarios, create a separate file for each one.
- Do not duplicate scenarios. If two ACs or OPP tests cover the same behavior, merge them into a single scenario with the most complete coverage.
- Component/s must be copied from the testable ticket. If the field is empty or not returned by Jira, warn the user: "Components could not be retrieved from the ticket. Please fill it in manually." and leave a visible placeholder `⚠️ MISSING — fill manually`.
