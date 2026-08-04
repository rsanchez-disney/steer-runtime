---
inclusion: always
---

# Project Structure

> **Legacy enterprise middleware** deployed on AWS ECS (Dockerized Tomcat). NOT a greenfield project. Changes require understanding the message routing chain and adapter contracts.

## Source Layout

```
wdpr-eai-hub-drp/
├── Source/Code/                     # Main codebase (multi-module Maven)
│   ├── pom.xml                      # Parent POM
│   ├── DRPAdapter/                  # Inbound – DRP (guest-facing) channel
│   ├── SbcAdapter/                  # Inbound – SBC (agent-facing) channel
│   ├── FunctionalBroker/            # Central routing engine
│   ├── TbxAdapter/                  # Outbound – TravelBox (OTA V65 SOAP)
│   ├── RecommenderAdapter/          # Outbound – Offer queries (SOAP WSDL)
│   ├── PaymentAdapter/              # Outbound – Payment (PCI, WorldPay)
│   ├── EnterpriseServiceRules/      # Reusable pre/post transformation rules
│   ├── MessageInterface-web/        # WAR entry point (REST endpoint)
│   ├── EAIUnit/                     # Custom test framework (annotations, base classes)
│   ├── Imitator/                    # Mock backend responses (no live deps)
│   └── DRPHubEAR/                   # Deployment packaging & config
│       └── EarContent/config/       # All externalized configuration
├── EAI_Dom_Msgs_J2/                 # Canonical Data Model (XSD → JAXB)
├── ClientGeneration/                # Generated client stubs (TBX, Recommender)
├── .harness/                        # CI/CD pipeline (Harness)
└── .kiro/steering/                  # AI steering rules
```

## Layered Architecture

```
1. MessageInterface-web  → REST endpoint, channel resolution
2. DRPAdapter / SbcAdapter → Inbound validation & translation
3. FunctionalBroker      → Message dispatch (processor.properties lookup)
4. EnterpriseServiceRules → Pre/post service rule chain
5. TbxAdapter / RecommenderAdapter / PaymentAdapter → Backend invocation
6. Imitator              → Stub responses (dev/test only)
```

## Dependency Flow

```
MessageInterface-web (WAR)
  └─► FunctionalBroker, DRPAdapter, SbcAdapter,
      TbxAdapter, RecommenderAdapter, PaymentAdapter,
      EnterpriseServiceRules

All adapters depend on:
  Foundation2, SharedCore, SharedJaxb2, DomainMessagesAppJAXB2
```

## Module → Package Map

| Module | Key Packages | Packaging |
|--------|-------------|-----------|
| FunctionalBroker | `com.wdw.eai.handler.domain`, `com.wdw.eai.processor.domain`, `com.wdw.eai.msgbean.domain`, `com.wdw.eai.service` | JAR |
| MessageInterface-web | `com.wdw.eai.admin.*`, `com.wdw.eai.foundation.message`, `com.wdpr.*` | WAR |
| DRPAdapter | `com.wdw.eai.processor.drp`, `com.wdw.eai.msgbean.drp` | JAR |
| SbcAdapter | `com.wdw.eai.processor.sbc`, `com.wdw.eai.msgbean.sbc` | JAR |
| TbxAdapter | `com.wdpr.tbx.{processor,transformer,busslogic,facade,model,exception,helper,util}`, `com.wdpr.service.ws` | JAR |
| RecommenderAdapter | `com.wdw.eai.rec.{processor,facade,exception}`, `com.wdw.eai.util`, `com.wdw.service.ws` | JAR |
| PaymentAdapter | `com.wdpr.eai.payment.{processor,buslogic,transformer,security,exception,util}` | JAR |
| EnterpriseServiceRules | Service broker rules (timezone, translation, normalization) | JAR |
| EAIUnit | `com.test.annotation.type`, `com.wdw.eai.junit`, `com.wdw.eai.junit.util` | JAR (test) |

## Naming Conventions

| Type | Pattern | Examples |
|------|---------|----------|
| Processor | `{MessageType}Processor` or `{MessageType}{Adapter}Proc` | `SessionMessageProcessor`, `MiscAvailTbxProc` |
| Transformer | `{Domain}Transformer` | Organized by domain subfolder |
| Handler | `{Domain}Handler`, `{Domain}HandlerFactory` | `SystemMsgHandler` |
| Business Rule | `{Domain}Rule`, `{Domain}Defaults` | `BrandRule`, `PosRule`, `SegmentRule` |
| Facade | `{System}ServiceFacade` | `TbxServiceFacade`, `PvsServiceFacade` |
| Exception | `{Domain}Exception` | `TbxAdapterException`, `PvsException` |
| Utility | `{Domain}Util`, `{Domain}Helper`, `{Domain}PropertyReader` | `DateUtil`, `DomUtil`, `TbxPropertyReader` |
| Model | Plain Java objects | `Package`, `DateRange`, `SalesChannelDetails` |
| Test | `{ClassName}Test` in `src/test/java` mirroring main packages | |

## Configuration Locations

| Path | Content |
|------|---------|
| `DRPHubEAR/EarContent/config/ENV/Common/` | Shared property files |
| `DRPHubEAR/EarContent/config/ENV/DLP/{ENV}/` | Per-environment overrides (DEV, LT1, STG, SHD, PRD) |
| `DRPHubEAR/EarContent/config/ENV/Docker/` | Tomcat server.xml, setenv.sh, catalina.properties |
| `DRPHubEAR/EarContent/config/Services/` | Service broker pipeline definitions |
| `DRPHubEAR/EarContent/config/Services/common/dataTranslation/` | Domain code mappings |
| `DRPHubEAR/EarContent/config/Services/common/keys/` | JKS keystores (PCI) |
| `DRPHubEAR/EarContent/config/DefaultMessages/` | Fallback XML responses |
| `DRPHubEAR/EarContent/config/Imitator/` | Mock XML responses |
| `DRPHubEAR/EarContent/config/TestMessages/` | Sample request XMLs |
| `DRPHubEAR/EarContent/config/xslt/` | XSL transformation files |

## Key Property Files

| File | Purpose |
|------|---------|
| `processor.properties` | Maps XML root element → processor class |
| `servicebroker.properties` | Defines pre/post service rule chains |
| `handler.properties` | Handler configuration |
| `eaihub.properties` | Core hub settings |
| `timeouts.properties` | Connection and read timeouts |
| `session.properties` | Session management |
| `imitator.properties` | Imitator mode toggle |
| `external-service-travelbox.properties` | TBX connection settings |
| `external-service-recommender.properties` | Recommender connection settings |
| `PaymentAdapter.properties` | Payment adapter settings |
| `creditcardmask.properties` | PCI masking rules |
| `ErrorCodes.properties` | Error code definitions |
| `log4j2.xml` | Logging configuration |

## Architectural Rules

- Processors are **registered by XML root element name** in `processor.properties` — new message types require a mapping entry.
- Service rules are **chained** via `servicebroker.properties` — ordering matters.
- Outbound adapters communicate through **Facades** that encapsulate HTTP/SOAP client calls.
- Transformers **mirror** the processor domain structure — keep them in sync.
- Message Beans carry state through the pipeline — channel-scoped (`msgbean/drp/`, `msgbean/sbc/`) or domain-scoped (`msgbean/domain/`).
- Configuration is **fully externalized** — never hardcode URLs, timeouts, or credentials in code.
- The Canonical Data Model (`DomainMessagesAppJAXB2`) defines all internal XML types — changes there propagate to all modules.

## Testing Structure

- **Framework**: JUnit 4 + custom `@UnitTest` / `@IntegrationTest` annotations (EAIUnit)
- **Mocking**: Mockito 5 (primary), JMockit 1.34 (static/final class stubbing)
- **Base classes**: `EAITestCase`, `EAITest`, `EAIMessageBeanTestCase`
- **Coverage**: JaCoCo → `target/site/jacoco/`
- **Test resources** in `src/test/resources/`:
  - `config/` — test property files
  - `MockRequests/` — sample XML requests
  - `MockResponses/` — expected XML responses
  - `TestMessages/` — integration test payloads
- **Surefire** runs `@UnitTest` group by default
- **No live backends** in unit tests — use Imitator or Mockito exclusively

## Container Paths (Runtime)

| Path | Purpose |
|------|---------|
| `/opt/middleware/application/tomcatA{1..2}/config/` | Runtime config |
| `/var/opt/apps/WDPRApps/sbc/logs` | Application logs |
| `/var/opt/apps/WDPRApps/sbc/sentxml` | XML message audit logs |