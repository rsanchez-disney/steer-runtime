---
inclusion: fileMatch
fileMatchPattern: ["**/*.java", "**/*.xml", "pom.xml"]
---

# Java conventions — DCL Travel Service

## Architecture

This project uses **Apache CXF JAX-RS** (NOT Spring MVC). Do not generate `@RestController`, `@GetMapping`, or Spring MVC annotations.

### Endpoint pattern

```java
// Resource interface (JAX-RS annotations)
@Path("/travel-details")
public interface TravelDetailsResource {
    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    Response getTravelDetails(@PathParam("id") Long id);
}

// Resource implementation
public class TravelDetailsResourceImpl implements TravelDetailsResource {
    private final TravelDetailsService travelDetailsService;

    public TravelDetailsResourceImpl(TravelDetailsService travelDetailsService) {
        this.travelDetailsService = travelDetailsService;
    }

    @Override
    public Response getTravelDetails(Long id) {
        // ...
    }
}
```

### Layers

```text
resources/         → JAX-RS interface + impl (REST endpoints)
service/           → Business logic interface + impl
repository/        → DAO interface + impl (Spring JDBC)
repository/mapper/ → RowMapper classes
entity/            → DB entity POJOs
model/             → API DTOs
```

## Data access

- **Spring JDBC** only — no JPA, no Hibernate, no `@Entity`
- Use `JdbcTemplate` and `NamedParameterJdbcTemplate`
- All SQL lives in `TravelSQLQueries` utility class (raw SQL strings)
- RowMapper per entity in `repository/mapper/`

```java
// DAO pattern
public class TravelDetailsRepositoryImpl implements TravelDetailsRepository {
    private final JdbcTemplate jdbcTemplate;

    public TravelDetailsRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public TravelDetails findById(Long id) {
        return jdbcTemplate.queryForObject(
            TravelSQLQueries.GET_TRAVEL_DETAILS_BY_ID,
            new TravelDetailsRowMapper(),
            id
        );
    }
}
```

## Dependency injection

- **Constructor injection** only (no `@Autowired` on fields)
- `@Configuration` classes wire beans explicitly in `config/`

## Build

- Maven, packaging: **WAR** (`travel.war`)
- Java 21
- Parent: `com.wdpr:wdpr-parent`
- Run tests: `mvn test`
- Build: `mvn clean package -DskipTests`

## Headers

All files must include Disney copyright header:

```java
/*
 * Copyright (c) Disney. All rights reserved.
 */
```

## Do not

- Do not use Spring MVC annotations (`@RestController`, `@RequestMapping`, etc.)
- Do not use JPA/Hibernate (`@Entity`, `@Repository` with JPA)
- Do not use field injection (`@Autowired` on fields)
- Do not add SQL inline — put it in `TravelSQLQueries`
- Do not create new utility classes for SQL — extend the existing one
