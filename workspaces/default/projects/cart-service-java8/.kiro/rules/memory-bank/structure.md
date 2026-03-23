# Cart Service - Project Structure

## Directory Organization

### Root Level
```
cart-service-java8/
├── src/                          # Source code
├── target/                       # Build output
├── scripts/                      # Deployment and utility scripts
├── sql/                          # Database schemas and migrations
├── json/                         # JSON test data and configurations
├── jmeter/                       # Performance test scripts
├── tools/                        # Development tools
├── image-scripts/                # Docker image scripts
├── .harness/                     # Harness CI/CD pipeline configuration
├── .amazonq/                     # Amazon Q rules and memory bank
├── pom.xml                       # Maven build configuration
├── Dockerfile*                   # Docker configurations for various environments
└── docker-compose.yml            # Local development orchestration
```

### Source Structure (src/)

#### Main Application (src/main/)
```
src/main/
├── java/com/disney/wdpro/service/cart/
│   ├── webservice/              # REST API layer
│   │   ├── resource/            # Resource representations (DTOs)
│   │   ├── input/               # Input validation and binding
│   │   ├── impl/                # Service implementations
│   │   └── RestCartService.java # Main REST interface
│   ├── service/                 # Business logic layer
│   │   ├── impl/                # Service implementations
│   │   ├── router/              # Request routing logic
│   │   ├── validator/           # Business validation
│   │   └── CartService.java     # Core service interface
│   ├── dao/                     # Data access layer
│   │   ├── impl/                # DAO implementations
│   │   │   ├── jpa/             # JPA-based persistence
│   │   │   ├── jdbc/            # JDBC-based operations
│   │   │   ├── mapper/          # Entity-to-model mappers
│   │   │   └── model/           # External service models
│   │   ├── connector/           # External service connectors
│   │   ├── stubs/               # Stub implementations for testing
│   │   └── queue/               # Queue message models
│   ├── conversion/              # Cart conversion logic
│   │   ├── mapper/              # Conversion mappers
│   │   ├── model/               # Conversion models
│   │   └── validator/           # Conversion validators
│   ├── model/                   # Domain models
│   ├── util/                    # Utility classes
│   ├── retrofit/                # Retrofit HTTP client configurations
│   └── log4j/                   # Custom logging components
├── resources/
│   ├── environment/             # Environment-specific configurations
│   │   ├── LOCAL/               # Local development
│   │   ├── IAAS/                # Infrastructure as a Service
│   │   ├── LATEST/              # Latest environment
│   │   ├── STAGE/               # Staging
│   │   └── PROD/                # Production
│   ├── stubs/                   # Stub data for testing
│   ├── *.xml                    # Spring context configurations
│   ├── *.properties             # Application properties
│   └── *.sql                    # Database scripts
└── webapp/
    └── WEB-INF/
        └── web.xml              # Web application descriptor
```

#### Integration Tests (src/it/)
```
src/it/
├── java/com/disney/wdpro/service/cart/it/
│   ├── dining/                  # Dining-specific integration tests
│   ├── ticket/                  # Ticket-specific integration tests
│   └── common/                  # Common test utilities
└── resources/
    ├── environment/LOCAL/       # Local test configurations
    └── IntegrationTestCartDAOContext.xml
```

#### Unit Tests (src/test/)
```
src/test/
├── java/com/disney/wdpro/service/cart/
│   ├── dao/                     # DAO layer tests
│   ├── service/                 # Service layer tests
│   ├── webservice/              # REST API tests
│   ├── conversion/              # Conversion logic tests
│   └── util/                    # Utility tests
├── resources/
│   ├── environment/             # Test environment configs
│   ├── data/                    # Test data files
│   ├── simulators/              # Mock service responses
│   └── jmeter/                  # JMeter test scripts
└── *-simulator/                 # Service simulators for load testing
```

## Core Components and Relationships

### Layered Architecture

```
┌─────────────────────────────────────────┐
│         REST API Layer                  │
│  (RestCartService, Resources)           │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       Business Logic Layer              │
│  (CartService, Validators, Routers)     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Data Access Layer                  │
│  (DAOs, Connectors, Mappers)            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    Persistence & External Services      │
│  (JPA, Redis, RabbitMQ, HTTP Clients)   │
└─────────────────────────────────────────┘
```

### Key Component Interactions

#### REST to Service Flow
- **RestCartServiceImpl** receives HTTP requests
- Validates input using **InputResource** classes
- Delegates to **CartService** for business logic
- Returns **Resource** representations to clients

#### Service to DAO Flow
- **DefaultCartService** orchestrates business operations
- Uses **Validators** for business rule enforcement
- Calls **DAOs** for data persistence and retrieval
- Applies **Mappers** for data transformation

#### DAO to External Systems
- **JpaCartDAO** handles database operations via JPA
- **Connector** classes communicate with external services
- **Retrofit** clients for HTTP-based service calls
- **RabbitMQ** publishers for event messaging

### Spring Context Organization

#### Main Contexts
- **RestServiceContext.xml**: REST API beans and CXF configuration
- **CartDAOContext.xml**: DAO layer beans and data sources
- **DAOContext.xml**: External service connectors
- **ApplicationQueueContext.xml**: RabbitMQ messaging configuration
- **ApplicationMetricsContext.xml**: Metrics and monitoring
- **CartServiceProfileContext.xml**: Spring profiles configuration

#### Extended Contexts
- **ExtendedCartDAOContext.xml**: Extended DAO implementations
- **StubbedCartDAOContext.xml**: Stub implementations for testing
- **ConnectorContext.xml**: Service connector configurations

## Architectural Patterns

### Design Patterns in Use

#### Repository Pattern
- DAO interfaces abstract data access
- Multiple implementations (JPA, JDBC, Stub)
- Separation of persistence logic from business logic

#### Service Layer Pattern
- Business logic encapsulated in service classes
- Transaction management at service boundaries
- Clear separation from presentation layer

#### Data Transfer Object (DTO)
- Resource classes for API representations
- Model classes for internal domain objects
- Mappers for transformation between layers

#### Dependency Injection
- Spring Framework for IoC container
- Constructor and setter injection
- Profile-based bean configuration

#### Circuit Breaker
- Hystrix integration for fault tolerance
- Fallback mechanisms for external service failures
- Metrics collection for monitoring

#### Facade Pattern
- Service facades simplify complex subsystem interactions
- Unified interface for cart operations
- Abstraction of multiple DAO and connector calls

### Persistence Strategy

#### JPA with EclipseLink
- Entity classes in dao/impl/jpa/model/
- JPA controllers for CRUD operations
- Custom platform for Tomcat integration

#### Caching Strategy
- Redis for distributed caching
- EhCache for local caching
- Cache-aside pattern implementation

#### Database Support
- Primary: MariaDB 10.1 (AWS migration)
- Legacy: Oracle (on-premises)
- Dual support during migration phase

### Integration Patterns

#### Synchronous HTTP
- Retrofit for REST client calls
- Apache CXF for SOAP services
- Connection pooling and timeout management

#### Asynchronous Messaging
- RabbitMQ for event publishing
- Spring AMQP for message handling
- Queue-based decoupling of systems

#### Service Discovery
- Configuration-based service endpoints
- Environment-specific property files
- Dynamic property resolution
