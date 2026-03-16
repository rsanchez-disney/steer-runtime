# Ops Profile Guidelines

## Jira Custom Fields Reference

| Field | Custom Field ID | Type | Values |
|---|---|---|---|
| Story Points | customfield_10003 | Number | — |
| AI Assisted Effort | customfield_27200 | Number | — |
| AI Usage Level | customfield_27201 | Select | Low, Medium, High |
| AI Tools Used | customfield_27202 | Text | — |
| Pull Request | customfield_21707 | Text | URL |
| Evidence of Completion | customfield_20800 | Text | — |

## Jira Transitions

| From | To | When |
|---|---|---|
| In Progress | Ready for Review | PR created |
| In Progress | In Review | If "Ready for Review" unavailable |
| In Progress | Peer Review | If "In Review" unavailable |

## AI Labels

- `AI-Peer-Reviewed` — Added when AI reviews the PR

## AWS Defaults

- **Region:** us-west-2
- **Credentials:** ~/.aws/credentials

## Harness Defaults

- **Org:** Commerce
- **Base URL:** https://disney.harness.io/

## SonarQube Defaults

- **URL:** https://sonar.cicd.wdprapps.disney.com
