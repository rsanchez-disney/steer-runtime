<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-26 -->
# Facility Status Publisher — API Contracts

## Overview

Receives real-time facility status updates (wait times, operating status, dining availability, forecasted wait times) from upstream operational systems and publishes to Couchbase Sync Gateway for immediate propagation to Disney park mobile apps.

## Base URL

| Environment | URL |
|-------------|-----|
| Latest | `https://latest.realtime-pub.wdprapps.disney.com/facility-status-publisher` |
| Stage | `https://stage.realtime-pub.wdprapps.disney.com/facility-status-publisher` |
| Load | `https://load.realtime-pub.wdprapps.disney.com/facility-status-publisher` |
| Prod | `https://realtime-pub.wdprapps.disney.com/facility-status-publisher` |

## Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/facility-status/{destination}` | Batch update facility statuses |
| PUT | `/dining-facility-status/{destination}` | Update dining statuses |
| DELETE | `/dining-facility-status/{destination}/{facilityId}` | Delete dining status |
| PUT | `/forecasted-wait-times/{destination}/facility/{facilityId}` | Update forecasted wait times |
| PUT | `/api/v1/trigger-facility-status` | Trigger facility/destination update |

## Supported Destinations

| Destination | Market | Dining Support |
|-------------|--------|----------------|
| `wdw` | Walt Disney World | ✅ |
| `dlr` | Disneyland Resort | ✅ |
| `hkdl` | Hong Kong Disneyland | ❌ (status only) |

## Couchbase Contract

| Bucket | Content |
|--------|---------|
| `park-platform-pub` | Facility status documents (wait times, operating status, dining, forecasts) |

Write strategy: upsert (last-write-wins for real-time status).

## Authentication

- **API**: Token-based auth via service credentials
- **Upstream auth**: OAuth2 via Auth Service (protocol/host/port configurable)
- **Couchbase**: Username/password from Vault

## Content-Type

All endpoints consume and produce `application/json`.
