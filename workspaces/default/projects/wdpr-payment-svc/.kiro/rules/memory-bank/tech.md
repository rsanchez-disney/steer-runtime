# Payment Service - Technology Stack

## Programming Languages
- **Java 8** (1.8) - Primary language
- **JavaScript** - WADL formatter UI
- **Shell Script** - Deployment and initialization scripts

## Build System
- **Maven 3** - Build automation and dependency management
- **Parent POM**: `com.disney.wdpro.platform.parentpom:java-rest-service:7.1.1.8`
- **Artifact**: `payment-service-docker` version 1.17.0
- **Packaging**: WAR (Web Application Archive)

## Core Frameworks

### Spring Framework 3.2.18.RELEASE
- Spring Core, Beans, Context
- Spring AOP (AspectJ integration)
- Spring Web, WebMVC
- Spring ORM (JPA integration)
- Spring Test

### Apache CXF 2.2.7
- JAX-RS (REST services)
- JAX-WS (SOAP services)
- HTTP transports

### Persistence
- **JPA/Hibernate 3.2.1.ga** - ORM framework
- **C3P0 0.9.1.2** - Connection pooling
- **Oracle JDBC 12.1.0.2** (ojdbc7)
- **MariaDB JDBC 1.7.4**

## Key Libraries

### JSON Processing
- Jackson 1.9.5 (Codehaus)
- Jackson 2.12.7 (FasterXML) - for wdpr-authz compatibility
- json-lib-ext-spring 1.0.2
- json-smart 1.0.9
- json-path 0.9.0

### Security & Authentication
- **wdpr-authz 3.32.0-84.0.0.22** - Authorization filter
- **Jasypt 1.9.0** - Encryption
- **OpenSAML 2.6.1** - SAML processing
- **Vault Java Driver 3.1.0** - HashiCorp Vault integration
- **wdpr-ra-java-mpropzapi 1.7.0-109.0.0.12** - Property management

### Logging
- **Log4j 2.17.1** (log4j-api, log4j-core, log4j-jcl, log4j-web)
- **SLF4J 2.17.1** (log4j-slf4j-impl)
- **wdpr-loggingapi 52.4.2-117.0.0.1** - Disney logging framework

### HTTP Clients
- Apache HttpComponents 4.5.4 (httpclient, httpcore)
- Commons HttpClient 3.1

### Utilities
- Apache Commons Lang3 3.10
- Apache Commons Collections4 4.3
- Apache Commons IO 2.7
- Apache Commons BeanUtils 1.7.0
- Apache Commons Pool 1.5.6
- Joda-Time 2.9.9

### Disney Internal Libraries
- **wdpro-service-utilities 18.0.1-17**
- **service-connector-framework 2.0.0.0077**
- **entity-linker 1.1.1-170.0.0.110**
- **exception-mapper 2.0.0.12**
- **errorhandler 1.0.0.0028**
- **cachemanager 1.0.0080**
- **pci 1.2.0.3**
- **wdpr-instance-lookup 0.1.0-41.0.0.0**
- **wdpr-common-logginginterceptor 0.1.0-41.0.0.0**

### APP Integration
- **app-sdk 95.0.0.50**
- **app-common-java7-bindings 500.0.0.154**
- **Jersey 2.15** (Glassfish)

### Testing
- **JUnit 4.11**
- **EasyMock 3.1**
- **PowerMock 1.6.1**
- **Spring Test 3.2.18.RELEASE**
- **automation-framework 0030-main**

### Monitoring & Metrics
- **Dropwizard Metrics 3.1.2** (metrics-servlets, metrics-servlet, metrics-jvm)
- **metrics3-statsd 4.1.0** - StatsD reporter

### Scheduling
- **Quartz Scheduler** - Job scheduling

### Other
- **AspectJ 1.6.2** - AOP runtime
- **CGLib 2.2.2** - Code generation
- **ASM 3.3.1** - Bytecode manipulation
- **DOM4J 1.6.1** - XML processing
- **OpenCSV 2.0** - CSV parsing

## Build Plugins

### Code Generation
- **jaxb2-maven-plugin 1.2/1.3.1** - JAXB class generation from XSD
- **maven-jaxb2-plugin** - Additional JAXB generation

### Code Quality
- **jacoco-maven-plugin 0.7.2** - Code coverage (8% minimum)
- **wdpro-maven-pmd-plugin** - PMD static analysis
- **wdpro-findbugs-maven-plugin** - FindBugs analysis
- **maven-checkstyle-plugin** - Code style checking
- **wdpro-javancss-maven-plugin** - Code metrics

### Testing
- **maven-surefire-plugin** - Unit test execution
- **failsafe-maven-plugin 2.4.3-alpha-1** - Integration tests
- **maven-antrun-plugin 1.7** - JBehave/TestNG execution

### Packaging
- **maven-war-plugin 2.1.1** - WAR packaging
- **maven-assembly-plugin** - Custom assemblies
- **spring-boot-maven-plugin 2.5.15** - Build info generation

### Other
- **maven-compiler-plugin 2.3.2** - Java 8 compilation
- **build-helper-maven-plugin 1.3** - Additional source directories

## Development Commands

### Local Build
```bash
docker build --build-arg NEXUS_USER=<user> --build-arg NEXUS_PASS=<pass> -t payment-service --file=Dockerfile-local .
```

### Run with Vault
```bash
docker-compose -f docker-compose-vault.yml up -d
./vault-config/vault-init.sh
docker-compose -f docker-compose.yml up
```

### Maven Build
```bash
mvn clean install
```

### Run Tests
```bash
mvn test                    # Unit tests
mvn verify -DrunIT=true     # Integration tests
```

### Code Quality
```bash
mvn verify                  # Runs PMD, FindBugs, Checkstyle, Jacoco
```

## Deployment

### Container
- **Tomcat 6.0.35.1** - Servlet container
- **Docker** - Containerization
- **Harness** - CI/CD pipeline

### Environments
- LATEST-AWS-A/B
- STAGE-AWS-A/B
- PRODA/B/C-AWS
- LOAD1-AWS

### Configuration Management
- Environment-specific Tomcat context files
- Vault for secrets management
- Property files per environment

## Repository & CI/CD
- **Source Control**: Git
- **CI/CD**: Harness (pipeline.yaml)
- **Artifact Repository**: Nexus (nexus.disney.com)
- **Jenkins**: https://ecommerce.cicd.wdprapps.disney.com/job/wdpr-payment-svc/

## Health Check Endpoints
- Latest: https://latest.paymentservice.wdprapps.disney.com/payment-service/healthcheck
- Stage: TBD (cutover scheduled)
