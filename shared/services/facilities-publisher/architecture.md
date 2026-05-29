<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-26 -->
# Facilities Publisher — Architecture

## Repository
`wdpro-development/facilities-publisher`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 17 |
| Framework | Spring Boot |
| Packaging | WAR on Tomcat / Docker |
| Data Store | Couchbase (park-platform-pub + txp public) |
| Feature Flags | LaunchDarkly |
| Secrets | Vault + Jasypt |
| Scheduling | Spring TaskScheduler |
| API Docs | Swagger UI |
| CI/CD | Harness |

## Modules

| Module | Purpose |
|--------|---------|
| `facilities-publisher-core` | Business logic — facility fetching, transformation, category mapping |
| `facilities-publisher-rest-app` | REST controller, scheduled triggers, configuration |

## Role

Aggregates facility data (attractions, restaurants, hotels, entertainment, etc.) from upstream services and publishes to Couchbase for mobile app consumption. Handles facility metadata, categories, CTA mappings, avatar taxonomy, and locale-specific content.

## Dependencies

| Service | Purpose |
|---------|---------|
| Watcher | Extended categories and content-populated facility lists |
| Explorer Service | Facility entity data |
| LaunchDarkly | Feature flag evaluation |
| Profile VAS | Avatar taxonomy data |
| Vault | Secret management |

## Data Flow

```
Watcher + Explorer Service + Launch Darkly + Profile VAS
    │
    ▼  (OAuth2 authenticated)
┌─────────────────────────────────┐
│   Facilities Publisher           │
│                                  │
│  1. Fetch facilities per dest    │
│  2. Apply category mappings      │
│  3. Apply CTA/avatar taxonomy   │
│  4. Transform per locale         │
│  5. Write to Couchbase           │
└─────────────────────────────────┘
    │
    ▼
  Couchbase Server
  (park-platform-pub + txp public)
```

## Deployment

- **Packaging**: Docker image (WAR on Tomcat)
- **CI/CD**: Harness pipeline + LaunchDarkly pipeline
- **Environments**: latest, stage, load, production
- **Context path**: `/facilities-publisher`
