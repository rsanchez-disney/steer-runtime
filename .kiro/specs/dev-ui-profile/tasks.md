# Implementation Plan: dev-ui Profile

## Overview

Create the `dev-ui` agent profile with 3 specialist agents (ui_legacy, polymer, lambda), their companion prompts and context files, a `workspaces/L2-dev-ui/` workspace, a profile README, and update `AGENTS.md` with the new profile documentation. All artifacts are declarative configuration (JSON, Markdown, directory structure).

## Tasks

- [x] 1. Create profile directory structure and agent JSON configs
  - [x] 1.1 Create `profiles/dev-ui/agents/ui_legacy.json` with Angular 15 specialist config
    - Define name, description, prompt reference, tools (`fs_read`, `fs_write`, `execute_bash`), resources (AGENTS.md, steering, `angular_legacy_patterns.md`), and hooks (preToolUse: `guard-writes.sh`, `secret-scan.sh`; postToolUse: `lint-on-write.sh`)
    - _Requirements: 3.1, 3.3, 3.4_

  - [x] 1.2 Create `profiles/dev-ui/agents/polymer.json` with Polymer 2/3 specialist config
    - Define name, description, prompt reference, tools (`fs_read`, `fs_write`, `execute_bash`), resources (AGENTS.md, steering, `polymer_patterns.md`), and hooks (preToolUse: `guard-writes.sh`, `secret-scan.sh`; postToolUse: `lint-on-write.sh`)
    - _Requirements: 4.1, 4.3, 4.4_

  - [x] 1.3 Create `profiles/dev-ui/agents/lambda.json` with Lambda specialist config
    - Define name, description, prompt reference, tools (`fs_read`, `fs_write`, `execute_bash`), resources (AGENTS.md, steering, `lambda_patterns.md`), and hooks (preToolUse: `guard-writes.sh`, `secret-scan.sh`; no postToolUse lint hook)
    - _Requirements: 5.1, 5.3, 5.4_

- [x] 2. Create companion prompt files
  - [x] 2.1 Create `profiles/dev-ui/prompts/ui_legacy.md`
    - Write system prompt for Angular 15 specialist: NgModule-based architecture, decorator inputs/outputs, Zone.js change detection, Vista design system usage, anti-patterns (no standalone components, no Signals, no zoneless)
    - _Requirements: 3.1, 3.2, 3.5, 3.6_

  - [x] 2.2 Create `profiles/dev-ui/prompts/polymer.md`
    - Write system prompt for Polymer 2/3 specialist: HTML imports vs ES modules, dom-repeat, iron-* elements, data binding, hybrid elements, uplift guidance from Polymer 2→3→Lit
    - _Requirements: 4.1, 4.2, 4.5, 4.6, 4.7_

  - [x] 2.3 Create `profiles/dev-ui/prompts/lambda.md`
    - Write system prompt for Lambda specialist: thin-handler pattern, cold start optimization, structured logging, IAM least-privilege, general-aws and general-node-development rule references
    - _Requirements: 5.1, 5.2, 5.5, 5.6_

- [x] 3. Create context files
  - [x] 3.1 Create `profiles/dev-ui/context/angular_legacy_patterns.md`
    - Document NgModule architecture, decorator-based `@Input`/`@Output`, Zone.js change detection, `ViewChild`/`ContentChild`, routing with `loadChildren`, TestBed with module declarations, anti-patterns section (no standalone, no Signals, no zoneless)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 3.2 Create `profiles/dev-ui/context/polymer_patterns.md`
    - Document Polymer 2 patterns (HTML imports, `<dom-module>`, `Polymer.Element`, `<dom-repeat>`, `<dom-if>`, two-way binding, `iron-*`/`paper-*`), Polymer 3 patterns (ES modules, LitElement compat, `css` tagged templates, `@property`), uplift path (polymer-modulizer, manual migration, Polymer 3→Lit)
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 3.3 Create `profiles/dev-ui/context/lambda_patterns.md`
    - Document thin-handler pattern, cold start optimization, structured JSON logging with correlation IDs, local testing with SAM CLI, error handling, IAM & security
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 4. Checkpoint — Review profile artifacts
  - Ensure all 3 agent JSON configs, 3 prompts, and 3 context files are created and internally consistent. Ask the user if questions arise.

- [x] 5. Create workspace configuration
  - [x] 5.1 Create `workspaces/L2-dev-ui/workspace.json`
    - Define name, description, team, profiles (`dev-core`, `dev-ui`), default_agent (`orchestrator`), rules (`conventional_commit`, `general-angular-development`, `general-aws`, `general-testing-strategies`, `general-node-development`, `general-performance-optimization`, `vista-design-system`), enable_tools
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [x] 5.2 Create `workspaces/L2-dev-ui/context/` directory with placeholder
    - Create the context directory for team-specific context files
    - _Requirements: 2.4_

- [x] 6. Create profile README
  - [x] 6.1 Create `profiles/dev-ui/README.md`
    - Document all 9 agents (6 cherry-picked from dev-core + 3 specialists), their purposes, installation commands (`koda install dev-ui`, `koda install dev-core dev-ui`), example usage with `kiro-cli chat --agent`, and note that dev-core is required as base
    - _Requirements: 1.3, 10.3_

- [x] 7. Update AGENTS.md
  - [x] 7.1 Add `dev-ui` subgraph to the Mermaid agent hierarchy diagram
    - Add `DEV_UI` subgraph with `UI_LEGACY`, `POLYMER`, `LAMBDA` nodes, plus cross-profile delegation arrows from `ORCH` to the 3 specialists. Add `DEV -.-> DEV_UI` alias link.
    - _Requirements: 10.2, 9.4_

  - [x] 7.2 Add `dev-ui` to the installation commands block
    - Add `koda install dev-core dev-ui` line to the existing install block with comment "L2 Studio legacy UI developer (9 agents)"
    - _Requirements: 10.3, 1.4, 1.5_

  - [x] 7.3 Add `### Profile: dev-ui (3 agents)` section
    - Document ui_legacy, polymer, and lambda agents with File, Purpose, Use for, Tools, Hooks fields following existing profile section conventions
    - _Requirements: 10.1, 1.2_

  - [x] 7.4 Add dev-ui rows to MCP Server Coverage table
    - Add 3 rows for ui_legacy, polymer, lambda (no MCP servers)
    - _Requirements: 10.1_

  - [x] 7.5 Add dev-ui context files to Context Files table
    - Add rows for `angular_legacy_patterns.md`, `polymer_patterns.md`, `lambda_patterns.md` with their agent references
    - _Requirements: 10.1_

  - [x] 7.6 Update agent count and dev alias references
    - Update total from 64 to 67, add dev-ui to the `dev` alias install comment, update the "Dev Profiles" header count, add Quick Reference entries for the 3 new agents
    - _Requirements: 10.1, 10.3_

- [x] 8. Final checkpoint — Ensure all artifacts are complete and consistent
  - Verify all files created, cross-references correct (agent JSON → prompt files → context files), AGENTS.md sections consistent with profile contents, workspace.json references valid rules. Ensure all tests pass, ask the user if questions arise.

## Notes

- PBT is not applicable — this feature is declarative configuration (JSON, Markdown, directory structure)
- The 6 dev-core agents are NOT duplicated into dev-ui; they are composed via the workspace's `profiles` array
- Schema validation and smoke tests are handled by the existing koda CLI test suite
- Each task references specific requirement acceptance criteria for traceability
