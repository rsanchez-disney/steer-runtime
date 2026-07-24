# Shuri team context

## Team overview

Shuri is the project that interacts with multiple SORs (GAM, Park Pass, etc.) and delivers that data to Adobe Experience Platform (AEP). AEP is then able to use Journey Orchestrations to push messaging via AJO or content via XBS/Hawkeye to Guests.

Shuri powers real-time, individualized digital experiences which seamlessly guide our Guests, increasing satisfaction and engagement throughout the Guest Journey.

**Jira Prefix**: GCX-
**Space**: Guest Content Experiencies

## Tech stack

### Adobe Experience Platform (AEP)

- **Languages**: Spark SQL
- **Key services**: Real-Time Customer Profile, Segmentation Service, Identity Service, Query Service
- **Data**: XDM schemas, datasets, Source Connectors for SOR ingestion
- **Purpose**: Central data platform — ingests SOR data (GAM, Park Pass, etc.), builds unified guest profiles, creates audience segments

### Adobe Journey Optimizer (AJO)

- **Languages**: PQL (Profile Query Language), Handlebars JS
- **Channels**: Email, Push, SMS, In-App
- **Key features**: Journey orchestrations, Offer Decisioning, event-triggered and segment-based journeys
- **Purpose**: Delivers personalized messaging to Guests based on real-time events and profile attributes

### Adobe Data Collection

- **Formats**: JSON, XDM
- **Components**: Tags, Web SDK (alloy.js), Mobile SDK, Event Forwarding, Datastreams
- **Purpose**: Captures guest interactions and routes events to AEP via Edge Network

### XBS / Hawkeye

- **Purpose**: Content delivery platform — serves personalized content experiences to Guests based on AEP segments and AJO decisions

### Splunk

- **Language**: SPL
- **Monitors**: Pipeline health, journey failures, SOR ingestion errors, data flow observability
- **Purpose**: Operational monitoring and troubleshooting across the Shuri data pipeline
