<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-26 -->
# Schedules Publisher — API Contracts

## Overview

Aggregates and publishes schedule data (operating hours, blockouts, closed restaurants) from the OpSheet service into Couchbase for mobile app consumption. Part of the Dash real-time content platform.

## Base URL

| Environment | URL |
|-------------|-----|
| Latest | `https://latest.realtime-pub.wdprapps.disney.com/schedules-publisher` |
| Stage | `https://stage.realtime-pub.wdprapps.disney.com/schedules-publisher` |
| Load | `https://load.realtime-pub.wdprapps.disney.com/schedules-publisher` |
| Prod | `https://realtime-pub.wdprapps.disney.com/schedules-publisher` |

## Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/sync-all/{destinationId}` | Full schedule sync for a destination |

## Supported Destinations

| Destination | Market |
|-------------|--------|
| `wdw` | Walt Disney World |
| `dlr` | Disneyland Resort |
| `hkdl` | Hong Kong Disneyland |

## Couchbase Contract

| Database | Bucket | Content |
|----------|--------|---------|
| Park Public | `park-platform-pub` | Schedules for mobile apps |
| TXP Public | TXP bucket | Schedules for TXP consumers |

## Authentication

- **API**: API key authorization
- **OpSheet Service**: OAuth2 client credentials (secret from Vault)
- **Couchbase**: Username/password from Vault

## Content-Type

All endpoints consume and produce `application/json`.
