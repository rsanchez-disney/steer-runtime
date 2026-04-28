# Requirements Document

## Introduction

The L2 studio team handles uplift of legacy front-end tools — Angular 15, Polymer 2, and Polymer 3 — for pre-sales applications (ticketing, NOT cart page or checkout) within the Config Studio product. The full `dev` profile ships 30 agents, most of which are irrelevant to this team's daily work. This feature creates a lean `dev-ui` agent profile (~9 agents) and a companion `L2-dev-ui` workspace that gives the L2 studio team exactly the tooling they need: legacy Angular support, Polymer expertise, lightweight Lambda capability, and the essential dev-core quality/workflow agents — nothing more.

## Glossary

- **Profile**: A named, composable set of agent JSON configurations installed via `koda install <profile>`. Examples: `dev-core`, `dev-web`, `dev-ui`.
- **Workspace**: A directory under `workspaces/` containing a `workspace.json` that binds a team to one or more profiles, rules, and context files.
- **Agent**: A JSON configuration file (`<name>.json`) plus a companion prompt file (`<name>.md`) that defines a specialist's purpose, tools, hooks, and resources.
- **Context_File**: A Markdown document loaded into an agent's context via the `resources` array (e.g., `angular_modern_patterns.md`, `golden_rules.md`).
- **Rule**: A reusable Markdown file under `common/rules/` that encodes coding standards (e.g., `general-angular-development.md`).
- **Orchestrator**: The coordinating agent in `dev-core` that delegates tasks to specialist agents and manages the SDLC workflow.
- **Polymer_Agent**: A new specialist agent for Polymer 2 and Polymer 3 web component development and uplift.
- **Lambda_Agent**: A new lightweight specialist agent for AWS Lambda function development using Node.js runtime.
- **UI_Legacy_Agent**: A reconfigured variant of the existing `ui` agent tuned for Angular 15 instead of Angular 20+.
- **Dev_UI_Profile**: The new `dev-ui` profile containing ~9 agents cherry-picked from `dev-core` and `dev-web`, plus two new agents.
- **L2_Dev_UI_Workspace**: The new `L2-dev-ui` workspace directory binding the L2 studio team to the Dev_UI_Profile.
- **Legacy_Uplift**: The process of modernizing older framework code (Angular 15, Polymer 2/3) toward current standards while maintaining backward compatibility.
- **Config_Studio**: The product context — search/browse clients, compare configurations, export reports, promote changes across environments.
- **Vista_Design_System**: Disney's shared web component library (`<wdpr-*>` components) and design token system.

## Requirements

### Requirement 1: Dev_UI_Profile Creation

**User Story:** As an L2 studio developer, I want a lean `dev-ui` profile with ~9 agents, so that I get only the tooling relevant to legacy UI uplift and Lambda work without the overhead of 30 agents.

#### Acceptance Criteria

1. THE Dev_UI_Profile SHALL be defined as a directory at `profiles/dev-ui/` following the same structure as existing profiles (`agents/`, `context/`, `prompts/`, `skills/`, `steering/`).
2. THE Dev_UI_Profile SHALL contain exactly 9 agents: orchestrator, codebase_explorer, code_review, test_runner, security_scanner, pr_creator (from dev-core), UI_Legacy_Agent (adapted from dev-web ui), Polymer_Agent (new), and Lambda_Agent (new).
3. THE Dev_UI_Profile SHALL include a `README.md` documenting all agents, their purposes, installation commands, and example usage.
4. WHEN a user runs `koda install dev-ui`, THE installation system SHALL install all 9 agents from the Dev_UI_Profile.
5. WHEN a user runs `koda install dev-core dev-ui`, THE installation system SHALL install the 6 cherry-picked dev-core agents plus the 3 specialist agents without duplicating agent configurations.

### Requirement 2: L2_Dev_UI_Workspace Creation

**User Story:** As an L2 studio team lead, I want a dedicated `L2-dev-ui` workspace, so that the team has a pre-configured environment with the correct profile, rules, and context for legacy uplift work.

#### Acceptance Criteria

1. THE L2_Dev_UI_Workspace SHALL be defined as a directory at `workspaces/L2-dev-ui/` containing a `workspace.json` file.
2. THE `workspace.json` SHALL reference the `dev-ui` profile in its `profiles` array.
3. THE `workspace.json` SHALL include the following rules: `conventional_commit`, `general-angular-development`, `general-aws`, `general-testing-strategies`, `general-node-development`, `general-performance-optimization`, and `vista-design-system`.
4. THE L2_Dev_UI_Workspace SHALL contain a `context/` directory with workspace-specific context files.
5. THE `workspace.json` SHALL set `default_agent` to `orchestrator`.

### Requirement 3: UI_Legacy_Agent for Angular 15

**User Story:** As an L2 studio developer, I want an Angular specialist agent configured for Angular 15, so that I get accurate guidance for legacy Angular patterns instead of Angular 20+ standalone/signal patterns.

#### Acceptance Criteria

1. THE UI_Legacy_Agent SHALL be defined as `profiles/dev-ui/agents/ui_legacy.json` with a companion prompt at `profiles/dev-ui/prompts/ui_legacy.md`.
2. THE UI_Legacy_Agent SHALL reference an `angular_legacy_patterns.md` context file that documents Angular 15 patterns (NgModules, decorators-based `@Input`/`@Output`, Zone.js change detection, `ViewChild`/`ContentChild`).
3. THE UI_Legacy_Agent SHALL include `fs_read`, `fs_write`, and `execute_bash` in its tools array.
4. THE UI_Legacy_Agent SHALL include `preToolUse` hooks for `guard-writes.sh` and `secret-scan.sh`, and a `postToolUse` hook for `lint-on-write.sh`.
5. THE UI_Legacy_Agent SHALL include the `vista-design-system` rule reference in its resources for Vista Web Component usage in pre-sales UIs.
6. WHEN the UI_Legacy_Agent generates code, THE UI_Legacy_Agent SHALL produce NgModule-based Angular 15 compatible code, not standalone component patterns.

### Requirement 4: Polymer_Agent for Polymer 2 and Polymer 3

**User Story:** As an L2 studio developer, I want a Polymer specialist agent, so that I can get expert guidance on Polymer 2/3 web component development and uplift since no Polymer agent exists today.

#### Acceptance Criteria

1. THE Polymer_Agent SHALL be defined as `profiles/dev-ui/agents/polymer.json` with a companion prompt at `profiles/dev-ui/prompts/polymer.md`.
2. THE Polymer_Agent SHALL reference a `polymer_patterns.md` context file documenting Polymer 2 and Polymer 3 patterns (HTML imports vs ES modules, `dom-repeat`, `iron-*` elements, data binding, lifecycle callbacks, hybrid elements).
3. THE Polymer_Agent SHALL include `fs_read`, `fs_write`, and `execute_bash` in its tools array.
4. THE Polymer_Agent SHALL include `preToolUse` hooks for `guard-writes.sh` and `secret-scan.sh`, and a `postToolUse` hook for `lint-on-write.sh`.
5. WHEN the Polymer_Agent generates Polymer 2 code, THE Polymer_Agent SHALL use HTML imports and the Polymer 2 class-based element syntax.
6. WHEN the Polymer_Agent generates Polymer 3 code, THE Polymer_Agent SHALL use ES module imports and LitElement-compatible patterns.
7. THE Polymer_Agent SHALL provide guidance on uplift paths from Polymer 2 to Polymer 3 and from Polymer 3 to Lit.

### Requirement 5: Lambda_Agent for AWS Lambda Development

**User Story:** As an L2 studio developer, I want a lightweight Lambda specialist agent, so that I can develop and maintain AWS Lambda functions without needing the full `dev-infra` Terraform agent.

#### Acceptance Criteria

1. THE Lambda_Agent SHALL be defined as `profiles/dev-ui/agents/lambda.json` with a companion prompt at `profiles/dev-ui/prompts/lambda.md`.
2. THE Lambda_Agent SHALL reference a `lambda_patterns.md` context file documenting Lambda handler patterns, Node.js runtime conventions, cold start optimization, and structured logging.
3. THE Lambda_Agent SHALL include `fs_read`, `fs_write`, and `execute_bash` in its tools array.
4. THE Lambda_Agent SHALL include `preToolUse` hooks for `guard-writes.sh` and `secret-scan.sh`.
5. WHEN the Lambda_Agent generates handler code, THE Lambda_Agent SHALL follow the thin-handler pattern with business logic separated into service modules.
6. THE Lambda_Agent SHALL apply the `general-aws` and `general-node-development` rules for IAM least-privilege, structured logging, and TypeScript strict mode.

### Requirement 6: Angular Legacy Patterns Context File

**User Story:** As an L2 studio developer, I want an `angular_legacy_patterns.md` context file, so that the UI_Legacy_Agent has accurate reference material for Angular 15 conventions distinct from the modern Angular 20+ patterns.

#### Acceptance Criteria

1. THE Dev_UI_Profile SHALL include a context file at `profiles/dev-ui/context/angular_legacy_patterns.md`.
2. THE `angular_legacy_patterns.md` SHALL document NgModule-based architecture, decorator-based inputs/outputs (`@Input()`, `@Output()`), Zone.js change detection, `ViewChild`/`ContentChild` queries, and `ngOnInit`/`ngOnDestroy` lifecycle hooks.
3. THE `angular_legacy_patterns.md` SHALL document the Angular 15 routing pattern using `loadChildren` with NgModule-based lazy loading.
4. THE `angular_legacy_patterns.md` SHALL document testing patterns using TestBed with module declarations (not standalone imports).
5. THE `angular_legacy_patterns.md` SHALL NOT reference standalone components, Signals, or zoneless change detection.

### Requirement 7: Polymer Patterns Context File

**User Story:** As an L2 studio developer, I want a `polymer_patterns.md` context file, so that the Polymer_Agent has accurate reference material for both Polymer 2 and Polymer 3 development.

#### Acceptance Criteria

1. THE Dev_UI_Profile SHALL include a context file at `profiles/dev-ui/context/polymer_patterns.md`.
2. THE `polymer_patterns.md` SHALL document Polymer 2 patterns: HTML imports, `<dom-module>`, `Polymer.Element` base class, `<dom-repeat>`, `<dom-if>`, two-way data binding with `{{}}` and `[[]]` notation, and `iron-*`/`paper-*` element usage.
3. THE `polymer_patterns.md` SHALL document Polymer 3 patterns: ES module imports, `LitElement` compatibility, `css` tagged template literals, and `@property` decorators.
4. THE `polymer_patterns.md` SHALL document the uplift path from Polymer 2 to Polymer 3 including the `polymer-modulizer` tool and manual migration steps.

### Requirement 8: Lambda Patterns Context File

**User Story:** As an L2 studio developer, I want a `lambda_patterns.md` context file, so that the Lambda_Agent has accurate reference material for AWS Lambda Node.js development.

#### Acceptance Criteria

1. THE Dev_UI_Profile SHALL include a context file at `profiles/dev-ui/context/lambda_patterns.md`.
2. THE `lambda_patterns.md` SHALL document the thin-handler pattern separating the Lambda entry point from business logic service modules.
3. THE `lambda_patterns.md` SHALL document cold start optimization techniques: minimizing package size, lazy-loading dependencies, and connection reuse.
4. THE `lambda_patterns.md` SHALL document structured JSON logging with correlation IDs for CloudWatch.
5. THE `lambda_patterns.md` SHALL document local testing patterns using AWS SAM CLI or equivalent tooling.

### Requirement 9: Orchestrator Delegation Configuration

**User Story:** As an L2 studio developer, I want the orchestrator to know about and delegate to the three specialist agents (UI_Legacy_Agent, Polymer_Agent, Lambda_Agent), so that the SDLC workflow routes tasks to the correct specialist.

#### Acceptance Criteria

1. WHEN the Orchestrator receives a task involving Angular 15 code, THE Orchestrator SHALL delegate to the UI_Legacy_Agent.
2. WHEN the Orchestrator receives a task involving Polymer 2 or Polymer 3 code, THE Orchestrator SHALL delegate to the Polymer_Agent.
3. WHEN the Orchestrator receives a task involving AWS Lambda functions, THE Orchestrator SHALL delegate to the Lambda_Agent.
4. THE Dev_UI_Profile SHALL include an updated `AGENTS.md` resource reference or equivalent agent registry so the Orchestrator can discover the three specialist agents.

### Requirement 10: Profile Documentation and Installation

**User Story:** As a platform engineer, I want the `dev-ui` profile to be documented in `AGENTS.md` and installable via `koda install`, so that it follows the same conventions as all other profiles.

#### Acceptance Criteria

1. THE `AGENTS.md` file SHALL include a new section for `dev-ui` documenting all 9 agents with their files, purposes, tools, and MCP servers.
2. THE `AGENTS.md` agent hierarchy diagram SHALL include a `dev-ui` subgraph showing the orchestrator delegating to ui_legacy, polymer, and lambda agents.
3. THE installation commands section in `AGENTS.md` SHALL include `koda install dev-ui` and `koda install dev-core dev-ui` as documented options.
4. WHEN `koda install dev-ui` is executed, THE installation system SHALL copy agent configs, prompts, context files, and steering files to the target `.kiro/` directory.
