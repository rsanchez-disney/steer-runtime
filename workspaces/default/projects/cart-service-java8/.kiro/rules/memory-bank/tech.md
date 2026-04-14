# Cart Service - Technology Stack

## Programming Languages and Versions

### Primary Language
- **Java 8** (1.8)
  - Lambda expressions and streams
  - Date/Time API (java.time)
  - Optional class usage
  - Method references

### Build Tool
- **Maven 3.x**
  - Multi-module project structure
  - Parent POM: com.disney.wdpro.platform.parentpom:java-rest-service:7.1.1.8
  - Artifact: cart-service-java8:2.45.0
  - Packaging: WAR

## Core Frameworks and Libraries

### Spring Framework
- **Spring 3.2.14.RELEASE**
  - Spring Core, Beans, Context
  - Spring Web MVC
  - Spring AOP
  - Spring ORM
  - Spring AMQP (1.4.5.RELEASE) for RabbitMQ
  - Spring Test

### Web Services
- **Apache CXF 2.7.1**
  - JAX-RS for REST services
  - JAX-WS for SOAP services
  - HTTP transport
- **JAX-RS API 2.0-m10**

### Persistence
- **JPA 2.0**
  - EclipseLink 2.4.0 (JPA provider)
  - Oracle and MySQL/MariaDB support
- **JDBC**
  - MySQL Connector 5.1.21
  - Oracle JDBC 11.2.0.3
  - Apache Commons DBCP2 2.2.0

### Caching
- **Redis**
  - Lettuce 3.5.0.Final (Redis client)
  - wdpr-ra-java-cache-manager 2.1.0-63.0.0.3
- **EhCache 1.5.0**
  - Local caching support
  - Disney cachemanager 1.0.0131

### Messaging
- **RabbitMQ**
  - AMQP Client 4.8.3
  - Spring Rabbit 1.4.5.RELEASE
  - Event-driven architecture

### HTTP Clients
- **Retrofit 1.9.0**
  - Type-safe HTTP client
  - Jackson converter integration
- **Apache HttpComponents**
  - HttpClient 4.5.2
  - HttpCore 4.4.4

### JSON Processing
- **Jackson 1.9.5** (Codehaus)
  - jackson-core-asl
  - jackson-mapper-asl
  - jackson-jaxrs
- **FasterXML Jackson 2.12.7**
  - jackson-databind
  - jackson-datatype-jsr310
  - jackson-datatype-joda
- **JSON Path 0.8.1**
- **JSON-lib-ext-spring 1.0.2**

### Resilience
- **Hystrix 1.5.9**
  - Circuit breaker pattern
  - Fallback mechanisms
  - Metrics event stream
  - Javanica annotations

### Logging
- **Log4j 2.20.0**
  - Async logging with Disruptor 3.4.4
  - Custom appenders
- **SLF4J** (via dependencies)
- **Commons Logging 1.1.3**

### Security
- **Jasypt 1.9.0**
  - Property encryption
  - Spring 3 integration
  - Custom key encryption
- **wdpr-authz 3.32.0-84.0.0.22**
  - Authorization framework
  - OAuth integration
- **Disney OAuth Engine CE 1.0.3**

### Utilities
- **Apache Commons**
  - commons-lang 2.6
  - commons-lang3 3.13.0
  - commons-collections 3.2.1
  - commons-beanutils 1.8.3
  - commons-io 2.7
  - commons-validator 1.4.0
- **Joda-Time 2.3**
- **Lombok 1.18.0**
  - Annotation processing
  - Boilerplate reduction

### Monitoring and Metrics
- **Dropwizard Metrics 3.1.2**
  - metrics-servlets
  - metrics-jvm
  - metrics-statsd (ReadyTalk 4.1.0)
- **AWS Metrics Publisher 0.0.1-5**
  - CloudWatch integration

### Testing Frameworks
- **JUnit 4.10**
- **EasyMock 3.4**
- **PowerMock 1.6.1**
  - powermock-module-junit4
  - powermock-module-test-easymock-junit4
- **Mockito 1.10.19**
- **Spring Test**
- **Hamcrest 1.1**
- **JBehave 3.1.1** (BDD framework)
- **TestNG 6.8** (for integration tests)

### Code Quality Tools
- **JaCoCo 0.7.2**
  - Code coverage: 65% minimum
  - Unit test coverage reporting
- **PMD 3.7**
  - Static code analysis
  - Custom ruleset: cart_pmd_ruleset.xml
- **Checkstyle**
  - Code style enforcement
  - Suppression file support
- **FindBugs**
  - Bug pattern detection
- **JavaNCSS 2.1**
  - Complexity metrics
  - CCN limit: 10

### Container and Deployment
- **Apache Tomcat 8.5.20**
  - Servlet container
  - JNDI support
- **Docker**
  - Multi-stage builds
  - Environment-specific Dockerfiles
  - Base image: 876496569223.dkr.ecr.us-east-1.amazonaws.com/wdpr-ra/tc8jre8:2.0.12-64.0.0.0

### Disney Platform Libraries
- **wdpro-service-utilities 18.0.1-17**
- **entity-linker 1.1.1-165.1.0.0-hotfix-41**
- **exception-mapper 2.0.0.39**
- **wdpro-configmgr-utility 1.1.1-3.0.0.3**
- **wdpro-shared-content-type 1.0.0-43.0.0.20**
- **errorhandler 1.0.0.0028**
- **wdprologging 1.0.0.0008**
- **generic-utilities 1.0.0.0038**
- **wdpr-convert-currency 0.1.0-145.0.0.0**
- **online-modifications-model 1.0.26-21.0.0.7**

## Development Commands

### Build Commands

#### Clean and Build
```bash
mvn clean install
```

#### Build without Tests
```bash
mvn clean install -DskipTests
```

#### Build WAR only
```bash
mvn clean package
```

#### Run Unit Tests
```bash
mvn test
```

#### Run with Code Coverage
```bash
mvn test -Pcoverage
```
Coverage report: `target/site/jacoco-ut/index.html`

#### Run Integration Tests
```bash
mvn verify -Drun-jbehave=true
```

#### Static Code Analysis
```bash
mvn verify  # Runs PMD, Checkstyle, FindBugs, JavaNCSS
```

### Docker Commands

#### Build Docker Image
```bash
docker build -t cart-service-java8:4.6.0-33 .
```

#### Build for IAAS
```bash
docker build -t cart-service-java8:iaas --file=./Dockerfile-iaas .
```

#### Run Local Container
```bash
docker run --network=isolated_nw -it --rm \
  -v ~/.aws/credentials:/root/.aws/credentials \
  -p 8080:8080 -p 8000:8000 \
  -e JAVA_OPTS="..." \
  cart-service-java8:4.6.0-33
```

#### Docker Compose
```bash
docker-compose up --build
```

### AWS Commands

#### Authenticate with AWS
```bash
aws-saml-auth
# Select role: 141854384972:role/WDPRPCM-DEVELOPER
```

#### ECR Login (us-west-2)
```bash
aws ecr get-login --region us-west-2
# Execute the returned docker login command
```

### Database Commands

#### Run MySQL DDL
```bash
mysql -u pepcartuser -p < src/main/resources/pep_cart_mysql_ddl.sql
```

#### Run Oracle DDL
```bash
sqlplus pepcartuser/password@database < src/main/resources/pep_cart_oracle_ddl.sql
```

### Testing Commands

#### Run JMeter Tests
```bash
jmeter -n -t jmeter/load-test-simulated-wdw.jmx -l results.jtl
```

#### Run Specific Test Class
```bash
mvn test -Dtest=CartServiceTest
```

#### Run Specific Test Method
```bash
mvn test -Dtest=CartServiceTest#testAddItemToCart
```

### Debugging

#### Remote Debug Port
- Port 8000 (configured in JAVA_OPTS)
- IDE connection: localhost:8000

#### JMX Monitoring
- Port 8099 (configured in JAVA_OPTS)
- JConsole/VisualVM connection

### Code Quality Reports

#### Generate All Reports
```bash
mvn site
```
Reports location: `target/site/`

#### View Coverage Report
```bash
open target/site/jacoco-ut/index.html
```

#### View PMD Report
```bash
open target/site/pmd.html
```

## Environment Variables

### Required for Local Development
- `AWS_REGION`: us-west-2
- `deployEnv`: LOCAL
- `spring.profiles.active`: aws

### Database Configuration
- `jdbc.MysqlCartDB.url`: Database connection URL
- `jdbc.MysqlCartDB.username`: Database user
- `jdbc.MysqlCartDB.password`: Encrypted password

### Redis Configuration
- `redis.host`: Redis server hostname
- `redis.port`: Redis port (default: 6379)
- `redis.region`: Cache key prefix

### Metrics Configuration
- `aws.metrics.namespace`: CloudWatch namespace
- `aws.metrics.poll.interval`: Metrics polling interval (seconds)

### Service URLs
- `service.cart.hostname`: Cart service base URL

## CI/CD

### Jenkins
- URL: https://ecommerce.cicd.wdprapps.disney.com/job/cart-service-java8/
- Build pipeline: cart-service-java8-single-repo

### Harness
- Pipeline configuration: `.harness/pipeline.yaml`
- Input sets: `.harness/input-sets/`

## Artifact Repository
- **Nexus**: https://nexus.disney.com/nexus/
  - Releases: WDPRO repository
  - Snapshots: WDPRO-Snapshots repository
