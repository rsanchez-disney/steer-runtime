# DPI Team — Project Context

## Jira Data Source

- **Project:** DPI
- **Prefix:** DPI-

## Tech Stack

- **Language:** Java 8+
- **Framework:** Spring Boot 1.5+
- **Build:** Maven
- **Testing:** JUnit 5, Mockito (JUnit 4 for legacy 1.5.x projects)
- **Data:** Spring Data JPA
- **Deployment:** AWS (ECS/EKS), Docker
- **Rule:** Unit tests are mandatory for every code change

## Branch Naming

- Feature: `feat/DPI-{ticket}`
- Bugfix: `fix/DPI-{ticket}`
- Hotfix: `hotfix/DPI-{ticket}`

## Usage Notes

When querying Jira for this team, use:
- **Project filter:** "DPI"
- **Prefix:** DPI-
