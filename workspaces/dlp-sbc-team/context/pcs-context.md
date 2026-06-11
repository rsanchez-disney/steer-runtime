# DLP PCS-UI (Product Combinability System)

## Business Purpose

DLP PCS-UI is an internal admin web application for **Disneyland Paris (DLP)** that manages **product combinability rules** — business rules defining which Disney products (tickets, hotel stays, packages, transportation) can be combined together into vacation packages. It is part of the **SBC-DLP (Sales & Booking Commerce - Disneyland Paris)** ecosystem.

The application allows business users to:
- Create and manage combinability rules that govern product packaging
- Define product groups and their valid combinations
- Look up existing packages by various criteria
- Manage travel plan segments (accommodation, transportation, etc.)
- Audit rule changes for compliance

---

## Technology Stack

| Layer         | Technology                                                             |
| ---------------| ------------------------------------------------------------------------|
| Language      | Java 11                                                                |
| Build         | Maven (multi-module)                                                   |
| Web Framework | Apache Struts 1.3.x + Spring 5.3.x (spring-struts bridge)              |
| ORM           | Hibernate 5.6 + Spring Data JPA 2.6                                    |
| Database      | MariaDB 10.5                                                           |
| Caching       | Caffeine (in-memory) + Redis (Spring Data Redis / Jedis)               |
| HTTP Client   | Retrofit 2 + OkHttp3                                                   |
| App Server    | Apache Tomcat 9 (JRE 11)                                               |
| View Layer    | JSP + JSTL + custom Ajax tag libraries                                 |
| Security      | Disney Keystone SecurityClient2 (SAML), wdpr-authz, SiteMinder filters |
| Configuration | HashiCorp Vault + Consul                                               |
| Logging       | Log4j2 + Disney wdpr-loggingapi                                        |
| CI/CD         | Harness pipelines                                                      |
| Containers    | Docker + Docker Compose                                                |
| Cloud         | AWS (ECR, us-east-1)                                                   |
| Testing       | JUnit 5, Mockito 4, AssertJ, JaCoCo, SonarQube                         |
| Serialization | Jackson 2.14, Gson (Retrofit)                                          |
| Utilities     | Lombok, Commons Lang3                                                  |

---

## Key Concepts

- **Combinability Rules** — Core business rules defining valid product combinations for packages.
- **Product Groups** — Logical groupings of Disney products (tickets, hotels, transport) referenced by rules.
- **Package Lookup** — Search functionality to query existing packages by various criteria.
- **Travel Plan Segments** — Components of a travel plan (accommodation, transportation, entertainment).
- **Operands / ArgRefs** — Rule expression building blocks used in the combinability engine.
- **Action Types** — Categories of actions that a combinability rule can trigger.
- **Roles** — User authorization roles controlling access to admin UI features.
- **Audit** — Change tracking and history for all rule modifications.
- **PVS (Product Validation Service)** — External service providing product data, consumed via Retrofit.

---

## Product Groups — How They Work

A **Product Group** (`PROD_GRP`) is a dynamic set of Disney products defined by **query clauses**, not by explicit product lists. Instead of enumerating every product, a group is defined by conditions that products must satisfy.

### Product Group Structure

```
ProductGroup
├── code (unique business identifier)
├── description
├── startDate / endDate (validity window)
└── productGroupQueryClauses[] ──→ QueryClause
                                       └── queryClauseConditions[] ──→ QueryClauseCondition
                                                                           └── QueryCondition
                                                                                 ├── queryAttributeOperation (attribute + operation)
                                                                                 └── attributeValue
```

- **QueryClause** — A logical grouping of conditions (description-based, e.g., "Hotel rooms in DLP").
- **QueryCondition** — A single condition: attribute + operation + value (e.g., `productType = HOTEL`).
- **QueryAttributeOperation** — Combines a `QueryConditionAttribute` (what to check, e.g., "productType", "resortCode") with an `OperationType` (how to compare, e.g., "=", "IN", "LIKE").

A product belongs to a group if it satisfies all conditions in at least one of the group's query clauses.

### Example

A product group "DLP Hotel Standard Rooms" might be defined as:
- Clause 1: `productType = ACCOMMODATION` AND `resortCode = DLP` AND `roomCategory = STANDARD`

---

## Combinability Rules — How They Are Created and Evaluated

A **Combinability Rule** (`COMB_RULE`) defines whether specific product groups can be combined together in a package, and what action to take when the combination is attempted.

### Rule Structure

```
CombRule
├── name (human-readable rule name)
├── typeName ──→ CombRuleType (rule category)
├── referenceNumber (business-facing rule ID)
├── versionNumber (supports rule versioning)
├── startDate / thruDate (validity window)
└── combRuleSteps[] ──→ CombRuleStp (ordered execution steps)
                            ├── stepSn (sequence number, 1-6)
                            ├── ruleOper ──→ RuleOperand (function/operator name)
                            └── combRuleArgRefs[] ──→ CombRuleArgRef
                                                        └── ArgRef (argument reference)
                                                              ├── argRefType ──→ ArgRefType (type: ProductGroup, ActionType, String, Int, Date, Reference)
                                                              ├── productGroup ──→ ProductGroup (if type is ProductGroup)
                                                              ├── actionType ──→ ActionType (if type is ActionType)
                                                              └── argTX (literal value if type is String/Int/Date)
```

### Rule Evaluation Flow

1. **Rule Selection** — Rules are grouped into **Combinability Sets** (`COMB_SET`) associated with an **Organization** (`OrgAlias`) and a **Path** (`Pth` — client app + communication channel). The many-to-many relationship `COMB_RULE_SET` links rules to sets.

2. **Step-by-Step Execution** — Each rule has up to 6 ordered steps (`CombRuleStp`). Steps execute sequentially by `stepSn`.

3. **Function + Operands Pattern** — Each step has:
   - A **function name** (the `RuleOperand` value, e.g., a comparison or business logic function)
   - Up to 6 **arguments** (`ArgRef`) which can be:
     - A **Product Group** reference (points to a `ProductGroup`)
     - An **Action Type** reference (points to an `ActionType`)
     - A literal value (String, Int, Date stored in `argTX`)
     - A **Reference** to another step's result

4. **Date Windows** — Rules have booking date ranges and travel date ranges that control when the rule applies. Rules are versioned so new versions can supersede old ones.

5. **Action Outcome** — When a rule matches, it triggers an **ActionType** which has:
   - A severity level (`ACTN_TYP_SEV_NB`) — determines priority/blocking behavior
   - A spiel code (`ACTN_TYP_SPIEL_CD`) — for guest-facing messages
   - Localized messages (`ActionList`) — per language (FR, EN, etc.)
   - Associated **Sales Process Events** — specific booking events where the action applies

### Rule Creation (UI Flow)

1. User navigates to the Combinability Rules view via Struts action (`CombinabilityRuleAction.listRules`)
2. User creates/edits a rule filling in:
   - Rule name, type, reference number
   - Booking and travel date validity windows
   - Steps (1–6), each with a function and operands
3. Operands are typed — the UI presents different selectors based on `ArgRefType`:
   - **Product Group** → dropdown of existing groups
   - **Action Type** → dropdown of configured actions
   - **String/Int/Date** → free text input
   - **Reference** → reference to another step's output
4. The rule is persisted via `CombinabilityRuleDelegator` → Service → DAO/Repository layer
5. All changes are audited (`AuditDao`)

### Combinability Sets and Scoping

Rules don't apply globally. They are scoped via:
- **CombSet** (Combinability Set) — Groups rules together for a specific context
- **OrgAlias** — The organization/brand (e.g., Disneyland Paris)
- **Pth** (Path) — The sales channel (client app + communication channel + path name)
- **SalesProcEvent** — Specific sales process events where action types are triggered (e.g., "ADD_TO_CART", "CHECKOUT")

This scoping ensures rules only fire for the correct brand, sales channel, and booking event.

---

## Module Structure

```
dlp-pcs-ui/                          (parent POM — aggregator)
├── config/                          Externalized config files (zipped & deployed)
├── ProductCombinabilityCommon/      Shared domain model, JPA entities
├── ProductCombinabilityService/     Business logic, DAOs, caching, PVS client
├── ProductCombinabilityWeb/         WAR — Struts actions, forms, JSPs, security filters, health endpoints
├── database_sql/                    Database schema (latest.sql) and grants
├── docker/                          Docker support scripts (setenv.sh, app.sh)
├── .harness/                        CI/CD pipeline definitions
└── .version/                        Version management backups
```

### Module Responsibilities

| Module | Role |
|--------|------|
| `ProductCombinabilityCommon` | JPA entities, shared DTOs, constants |
| `ProductCombinabilityService` | Spring services, repositories, Caffeine/Redis caching, Retrofit PVS client |
| `ProductCombinabilityWeb` | Struts Action classes, ActionForms, JSP views, security filter chain, REST health endpoints |
| `config` | Environment-specific property files (packaged as ZIP) |

---

## Infrastructure

- **Deployment**: AWS (us-east-1) on Docker containers, images stored in ECR
- **Base Image**: `wdpr-ra-docker-base-tomcat-tc9jre11` (Disney custom Tomcat 9 + JRE 11)
- **Configuration Delivery**: Vault (secrets) + Consul (service config), injected via environment variables
- **Database**: MariaDB 10.5 (production on AWS, local via Docker)
- **Registries**: Disney internal Nexus (Maven artifacts), ECR (Docker images)
- **CI/CD**: Harness pipelines (`.harness/pipeline.yaml`)
- **Exposed Ports**: 8080 (HTTP in container → 8083 locally), 7043 (debug)
- **External Integrations**: PVS (Product Validation Service) via Retrofit/OkHttp

---

## Development Setup

### Prerequisites
- Java 11 (JDK)
- Maven 3.x
- Docker & Docker Compose
- Access to Disney internal Nexus repository (Maven settings.xml)
- HashiCorp Vault & Consul (running locally or via Docker)

### Local Environment

1. **Copy environment config:**
   ```bash
   cp .env_EXAMPLE .env
   # Edit .env with your Vault token and local settings
   ```

2. **Start infrastructure (DB + app):**
   ```bash
   docker-compose up -d --build
   ```
   This starts:
   - `local-pcs-db`: MariaDB 10.5 on port 3306 (user: `PCS`, password: `PCSUI_Admin`, db: `mydb`)
   - `pcs-dlp`: Application on port 8083

3. **Access the application:** `http://localhost:8083/ProductCombinabilityWeb/`

### Key Environment Variables

| Variable          | Purpose                                                           |
| -------------------| -------------------------------------------------------------------|
| `VAULT_URL`       | Vault server endpoint (local: `http://host.docker.internal:8200`) |
| `VAULT_BASE_PATH` | Vault secrets path (`/v1/secret/hello/pcs-ui`)                    |
| `VAULT_TOKEN`     | Authentication token for Vault                                    |
| `CONSUL_HOST`     | Consul server endpoint                                            |
| `CONSUL_PORT`     | Consul port (default: 8500)                                       |
| `APP_ENV`         | Environment name (`LOCAL`, `STAGE`, `PRODUCTION`)                 |
| `IS_LOCAL`        | Flag for local development mode                                   |

### Secrets (configured in Vault)
- `JDBC_PCS_URL` — MariaDB connection URL
- `JDBC_PCS_USERNAME` — Database username
- `JDBC_PCS_PASSWORD` — Database password (encrypted)

### Build Commands
```bash
mvn clean install              # Full build with WAR
mvn clean package -DskipTests  # Skip tests for faster iteration
mvn test                       # Run unit tests only
mvn verify                     # Run tests + JaCoCo coverage
```

---

## Conventions

- **Architecture Pattern**: MVC via Struts 1 (Action → Form → JSP) with Spring-managed services
- **Package Naming**: `com.disney.pcsui.*`
- **Entity Pattern**: JPA entities in Common module, Spring Data repositories in Service module
- **Caching Strategy**: Two-tier — Caffeine (local, fast) + Redis (shared, distributed)
- **Security**: All requests pass through SiteMinder → Keystone SAML → wdpr-authz role checks
- **Config Pattern**: No hardcoded secrets; all sensitive values from Vault, all config from Consul
- **Logging**: Use `wdpr-loggingapi` wrappers (structured logging compatible with Disney log aggregation)
