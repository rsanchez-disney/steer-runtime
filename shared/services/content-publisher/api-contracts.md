<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-26 -->
# Content Publisher (ARTU) — API Contracts

## Overview

Generic content write/read service for the Dash real-time platform. Receives content from upstream services, validates and writes to Couchbase Sync Gateway for propagation to Disney park mobile apps. Supports public, guest-private, and anonymous-guest content scopes.

## Base URL

| Environment | URL |
|-------------|-----|
| Local | `http://localhost:8080/content-publisher` |
| Latest | `https://latest.realtime-pub.wdprapps.disney.com/content-publisher` |
| Stage | `https://stage.realtime-pub.wdprapps.disney.com/content-publisher` |
| Load | `https://load.realtime-pub.wdprapps.disney.com/content-publisher` |
| Prod | `https://realtime-pub.wdprapps.disney.com/content-publisher` |

## Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| PUT | `/content/{type}/{destination}/{entityId}` | Upsert public content |
| GET | `/content/{type}/{destination}/{entityId}` | Retrieve public content |
| POST | `/content/{type}/{destination}/bulk/get` | Bulk retrieve |
| DELETE | `/content/{type}/{destination}/{entityId}` | Delete public content |
| PUT | `/content/SWID/{swid}/{type}/{destination}/{entityId}` | Upsert guest content |
| GET | `/content/SWID/{swid}/{type}/{destination}/{entity-id}` | Get guest content |
| PUT | `/content/app-instance-id/{id}/{type}/{destination}/{entityId}` | Upsert anonymous content |
| PUT | `/content/areq/{swid}` | Upsert access request |

## Couchbase Contract

| Scope | Bucket | Access |
|-------|--------|--------|
| Public | `park-platform-pub` | All mobile app users |
| Private (SWID) | Private bucket | Per-guest |
| Semi-private | Semi-private bucket | Per-device |
| Sandbox | `priv-mbl` | Dev/test only |

## Authentication

- **Service-to-service**: OAuth2 token
- **Sandbox/Swagger UI**: MyID with clientId `WDPR-MYID-CONTENT.PUBLISHER-LOCAL` and role `sandboxDev:crud`
- **API Gateway path**: IAM / resource policy

## Content-Type

All endpoints consume and produce `application/json`.
