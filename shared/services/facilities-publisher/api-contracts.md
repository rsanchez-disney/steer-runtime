<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-26 -->
# Facilities Publisher — API Contracts

## Overview

Aggregates and publishes facility data (attractions, restaurants, hotels, entertainment venues) from upstream services into Couchbase for mobile app consumption. Part of the Dash real-time content platform.

## Base URL

| Environment | URL |
|-------------|-----|
| Latest | `https://latest.realtime-pub.wdprapps.disney.com/facilities-publisher` |
| Stage | `https://stage.realtime-pub.wdprapps.disney.com/facilities-publisher` |
| Load | `https://load.realtime-pub.wdprapps.disney.com/facilities-publisher` |
| Prod | `https://realtime-pub.wdprapps.disney.com/facilities-publisher` |

## Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/facilities/{destination}` | Full facility sync for a destination |

## Supported Destinations

| Destination | Market |
|-------------|--------|
| `wdw` | Walt Disney World |
| `dlr` | Disneyland Resort |
| `hkdl` | Hong Kong Disneyland |

## Couchbase Contract

| Database | Bucket | Content |
|----------|--------|---------|
| Park Public | `park-platform-pub` | Facility data for mobile apps |
| TXP Public | TXP bucket | Facility data for TXP consumers |

## Authentication

- **API**: API key authorization
- **Upstream services**: OAuth2 client credentials (secret from Vault)
- **Couchbase**: Username/password from Vault

## Content-Type

All endpoints consume and produce `application/json`.
