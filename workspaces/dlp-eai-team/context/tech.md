---
inclusion: always
---

# Technology Stack

## Build & Runtime

- Java 17 (source and target)
- Maven multi-module with parent POM
- Apache Tomcat (Dockerized on AWS ECS)
- CI/CD via Harness pipelines

## Core Frameworks & Versions

| Library | Version | Purpose |
|---------|---------|---------|
| Spring Framework | 5.3 | Beans, Context, Web, WebMVC, Integration, ORM |
| Apache CXF | 3.6 | REST and SOAP services |
| Apache HttpClient | 4.5 | Outbound HTTP calls |
| JAXB | 2.3 | XML binding (canonical data model) |
| Jackson | 2.15 | JSON serialization/deserialization |
| Lombok | — | Boilerplate code generation |
| Apache Commons | — | Collections, Lang, IO utilities |
| Log4j2 | 2.17 | Logging (API and Core) |

## Integration Protocols

- SOAP/HTTPS (OTA V65) → TravelBox
- SOAP/WSDL → Recommender Adapter (offer queries)
- REST/HTTPS → PVaaS (package validation)
- Spring Integration → JMS and XML message routing

## Security Rules

- PCI encryption uses Jasypt + BouncyCastle with JKS keystores
- Secrets come from HashiCorp Vault (`csm.wdprapps.disney.com`)
- Payment authorization via WorldPay (MOTO) over HTTPS
- Never log unmasked credit card numbers; use `creditcardmask.properties` rules
- PaymentRQ requires auth token validation before processing

## Testing

| Tool | Version | Role |
|------|---------|------|
| JUnit | 4 | Unit testing framework |
| Mockito | 5 | Primary mocking |
| JMockit | 1.34 | Static/final class stubbing |
| JaCoCo | — | Code coverage reports |
| EAIUnit | — | Custom `@UnitTest` / `@IntegrationTest` annotations, base classes |
| Imitator | — | Mock backend responses (no live dependencies in unit tests) |

### Testing Conventions

- Unit tests live in `src/test/java` mirroring main source packages
- Use Imitator or Mockito — never call live backends in unit tests
- Surefire runs `@UnitTest` group by default
- Test resources go in `src/test/resources/` (config/, MockRequests/, MockResponses/, TestMessages/)
- Cover message transformation, routing, error paths, and adapter behavior

## Logging

- Use WDPR Logging API for structured logging
- Log aggregation: Splunk (index `wdpr_eai_dlp`) and CloudWatch
- Never log PCI-sensitive data; mask credit card numbers in all output

## Common Maven Commands

```bash
# Full build
mvn clean install

# Build without tests
mvn clean install -DskipTest=true -Dmaven.test.skip=true -Dcobertura.skip

# Run tests only
mvn test

# Build a single module
mvn clean install -pl <module-name>

# Coverage report
mvn clean test jacoco:report
```

## Local Development

- URL: `http://localhost:8080/WDPR-MessageInterface-web/`
- Vault required at `http://localhost:8200`
- Set `APP_ENV=LOCAL`
- Environment configs: DEV, LOCAL, LT1, PRD folders under Config module
- Feature flags: `FeatureToggles.properties`