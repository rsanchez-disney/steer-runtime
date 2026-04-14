---
name: generate-base-specifications
description: Analyze a codebase and generate base specification documents for AI agent context
---

# Generate Base Specifications

Analyze the repository and generate structured spec documents that give AI agents the context they need to work effectively on the codebase.

## When to Use

- Onboarding a new repo for AI-assisted development
- After significant architecture or stack changes
- When agents lack context about the project

## Process

### Step 1: Read Project Config

Read `project.yaml` or memory bank for: name, stack, specsDir, commands.

### Step 2: Analyze the Codebase

1. Scan directory structure and identify major modules
2. Identify tech stack, frameworks, and dependencies
3. Review entry points, routing, and configuration
4. Identify testing patterns and coverage
5. Review existing documentation

### Step 3: Generate Specs

Create the following files in the specs directory (default: `docs/specs/`):

| File | Content |
|------|---------|
| `_00_overview.md` | Project purpose, key features, target users, high-level architecture |
| `_01_architecture.md` | Component diagram, layers, data flow, integration points |
| `_02_state_management.md` | State patterns, data stores, caching strategy |
| `_03_navigation.md` | Routing, URL structure, navigation patterns (if applicable) |
| `_04_testing.md` | Test strategy, frameworks, patterns, coverage expectations |
| `_05_core_utilities.md` | Shared utilities, helpers, common patterns |
| `_06_coding_standards.md` | Naming conventions, formatting, structural patterns |

### Step 4: Stack-Specific Specs

Based on the detected stack, generate additional specs:

- **Java/Spring Boot**: dependency injection patterns, service layer conventions, JPA/Hibernate patterns
- **Node.js/Express**: middleware chain, error handling, async patterns
- **Angular**: component architecture, service patterns, state management
- **Flutter**: widget tree, BLoC/provider patterns, platform channels
- **Go**: package structure, interface patterns, error handling

### Step 5: Present Results

List all generated files and ask the user to review and commit them.

## Output Format

Each spec file should follow the template structure from `common/templates/specs/`. Include:
- Clear section headers
- Code examples from the actual codebase
- References to specific files and patterns
- Diagrams where helpful (mermaid)
