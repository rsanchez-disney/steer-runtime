# Payment Service - Project Structure

## Directory Organization

### `/src/main/java/com/disney/wdpro/service/payment/`
Core application source code organized by functional layers:

- **`webservice/`** - REST API endpoints and resources
  - `impl/` - REST service implementations
  - `resource/` - JAX-RS resource models (request/response DTOs)
  - `dvic/postback/` - DVIC postback endpoint handlers

- **`service/`** - Business logic layer
  - `impl/` - Service implementations for payment operations
  - Payment orchestration and workflow management

- **`dao/`** - Data Access Objects for external integrations
  - `impl/` - DAO implementations
  - `firstdata/` - First Data payment gateway integration
    - `svdot/` - Stored Value DOT protocol implementations
    - `model/` - First Data domain models
  - `dvic/` - Disney Visa Integrated Card integration
    - `impl/` - DVIC DAO implementations
    - `model/` - DVIC domain models
    - `jpa/` - JPA entities for DVIC
  - `accertify/` - Fraud detection integration
  - `dossier/` - User profile integration
  - `jpa/` - JPA repositories and entities
  - `stub/` - Stubbed implementations for testing
  - `mapper/` - Data transformation mappers

- **`model/`** - Domain models and business entities
  - Core payment domain objects (CreditCard, GiftCard, PaymentCard)
  - Enumerations (PaymentTypeEnum, CardSubType, StoreTypeEnum)

- **`mappers/`** - Resource-to-domain object mappers
  - MapStruct-based mapping implementations

- **`util/`** - Utility classes and helpers
  - `dvic/` - DVIC-specific utilities (SAML, crypto, password)
  - `adaptivepayment/` - Adaptive payment utilities
  - `ws/` - Web service utilities and interceptors
  - Encryption, validation, parsing utilities

- **`conf/`** - Configuration classes
  - Spring configuration
  - JWT token configuration
  - Application configuration

- **`filter/`** - Servlet filters
  - Conversation ID filter
  - HTTP headers filter

- **`aop/`** - Aspect-oriented programming
  - Service availability interceptors

- **`encrypt/`** - Encryption implementations
  - First Data encryption
  - DESede encryption

- **`socketpool/`** - Socket connection pooling
  - SVdot socket pool management

### `/src/main/resources/`
Configuration files and resources:

- Spring context XML files (PaymentDAOContext.xml, RestServiceContext.xml, etc.)
- Properties files (paymentservicesconfig.properties, dvicconfig.properties)
- Keystores and truststores for SSL/TLS
- Log masking patterns
- XSD schemas for JAXB generation
- Quartz scheduler configuration
- JPA persistence configuration

### `/src/main/webapp/`
Web application resources:

- `WEB-INF/web.xml` - Servlet configuration
- WADL formatter JavaScript and CSS

### `/src/test/`
Test code mirroring main structure:

- Unit tests for all layers
- Integration tests
- Test resources and configurations
- Stubbed implementations

### `/src/tomcat/`
Environment-specific Tomcat configurations:

- GLOBAL, LATEST-AWS-A/B, PRODA/B/C-AWS, STAGE-AWS-A/B
- Environment-specific context.xml and properties

### `/scripts/`
Deployment and operational scripts:

- `app.sh` - Application startup script

### `/vault-config/`
Vault secret management:

- `vault-init.sh` - Vault initialization script
- `kv-v1-config.json` - Key-value configuration

### `/.harness/`
Harness CI/CD pipeline configuration:

- `pipeline.yaml` - Main pipeline definition
- `input-sets/` - CI, PR, and manual input sets

### Root Configuration Files
- `pom.xml` - Maven build configuration
- `Dockerfile`, `Dockerfile-local` - Docker image definitions
- `docker-compose.yml`, `docker-compose-vault.yml` - Docker Compose configurations
- `assembly.xml` - Maven assembly descriptor

## Core Components and Relationships

### Layered Architecture
```
REST API Layer (webservice)
    ↓
Business Logic Layer (service)
    ↓
Data Access Layer (dao)
    ↓
External Systems (First Data, DVIC, Accertify, Dossier)
```

### Key Integration Points
- **First Data**: SVdot socket protocol for stored value transactions
- **DVIC**: SOAP/SAML-based integration for Disney Visa cards
- **Accertify**: REST-based fraud detection
- **Dossier**: User profile management
- **Vault**: Secrets and configuration management

## Architectural Patterns

### Design Patterns
- **DAO Pattern**: Abstraction of data access logic
- **Service Layer Pattern**: Business logic encapsulation
- **Factory Pattern**: Socket pool creation, encryption implementations
- **Strategy Pattern**: Multiple payment provider implementations
- **Adapter Pattern**: Type adapters for First Data protocol
- **Interceptor Pattern**: Logging, security, service availability

### Spring Framework Integration
- Dependency injection for loose coupling
- AOP for cross-cutting concerns
- Transaction management with JPA
- RESTful services with Apache CXF

### Data Persistence
- JPA/Hibernate for database operations
- C3P0 connection pooling
- Oracle and MariaDB support
- Transaction management via Spring

### Security Architecture
- OAuth 2.0 token validation
- JWT token processing
- SAML assertion handling for DVIC
- PCI-compliant data encryption
- Vault-based secrets management
