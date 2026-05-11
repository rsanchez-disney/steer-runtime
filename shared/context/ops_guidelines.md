# Ops guidelines

## Jira custom fields

| Field                  | ID                 | Type   |
|------------------------|--------------------|--------|
| Story Points           | customfield_10003  | Number |
| AI Assisted Effort     | customfield_27200  | Number |
| AI Usage Level         | customfield_27201  | Select |
| AI Tools Used          | customfield_27202  | Text   |
| Pull Request           | customfield_21707  | Text   |
| Evidence of Completion | customfield_20800  | Text   |

## Jira transitions

In Progress → Ready for Review (PR created). Fallbacks: In Review, Peer Review.
AI label: `AI-Peer-Reviewed` on AI-reviewed PRs.

## Infra defaults

- AWS: us-west-2, ~/.aws/credentials
- Harness: Org=Commerce, https://disney.harness.io/
- SonarQube: https://sonar.cicd.wdprapps.disney.com
