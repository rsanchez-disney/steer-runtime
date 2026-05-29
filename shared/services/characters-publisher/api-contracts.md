<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-26 -->
# Characters Publisher — API Contracts

## Overview

AWS Lambda that aggregates character data from multiple upstream services (Explorer, OpSheet, Facility), transforms it per market/locale, and publishes to Couchbase for mobile app consumption. Not guest-facing — populates the real-time DB used by park mobile apps.

## Base URL

| Environment | URL |
|-------------|-----|
| Latest | `https://latest.realtime-lambda-pub.wdprapps.disney.com/characters-publisher/{destinationId}` |
| Stage | `https://stage.realtime-lambda-pub.wdprapps.disney.com/characters-publisher/{destinationId}` |
| Load | `https://load.realtime-lambda-pub.wdprapps.disney.com/characters-publisher/{destinationId}` |
| Prod | `https://realtime-lambda-pub.wdprapps.disney.com/characters-publisher/{destinationId}` |

## Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/characters-publisher/{destinationId}` | Trigger full character sync for a destination |

## Couchbase Channel Contract

| Field | Value |
|-------|-------|
| Bucket | `park-platform-pub` |
| Channel pattern | `{destination}.characters.{version}` |
| Document key | `{characterId}:{locale}` |
| Write strategy | Upsert |

### Supported Destinations

| Destination | Market |
|-------------|--------|
| `wdw` | Walt Disney World |
| `dlr` | Disneyland Resort |

## Authentication

- **API Gateway**: Lambda Authorizer (Cookie-based, 300s TTL)
- **Upstream services**: OAuth2 via Vault-managed secrets (Jasypt-encrypted properties)
- **Couchbase**: Username/password from Vault
