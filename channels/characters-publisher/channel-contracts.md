# Characters Publisher — Channel Contracts

## Couchbase Channel Pattern

```
{destination}.characters.{version}
```

| Segment | Description | Examples |
|---------|-------------|----------|
| `{destination}` | Target market/environment identifier | `wdw`, `dlr` |
| `characters` | Fixed — entity type | — |
| `{version}` | Schema/API version | `v1`, `v2` |

**Bucket:** `park-platform-pub`  
**SDK:** Couchbase SDK 3.10.1

### Example Channels

| Channel | Market |
|---------|--------|
| `wdw.characters.v1` | Walt Disney World |
| `dlr.characters.v1` | Disneyland Resort |

## Document Contract

Each document in the channel represents a single character entity keyed by character ID and locale.

### Document Key Pattern

```
{characterId}:{locale}
```

### Supported Destinations

| Destination | Market | Description |
|-------------|--------|-------------|
| `wdw` | Walt Disney World | Florida parks |
| `dlr` | Disneyland Resort | California parks |

### Supported Locales

Locale support is market-dependent. Documents are published per locale variant for each market.

| Market | Locales |
|--------|---------|
| WDW | `en_US` + additional configured locales |
| DLR | `en_US` + additional configured locales |

## API Gateway Contract

### Endpoint

```
GET /characters-publisher
```

### Purpose

On-demand trigger for a full sync cycle (same logic as the scheduled CloudWatch cron).

### Request

No required query parameters or request body. The GET invocation triggers a complete market sync.

### Response

| Status | Meaning |
|--------|---------|
| `200 OK` | Sync completed (check body for per-market results) |
| `500 Internal Server Error` | Unrecoverable failure |

### Response Body

Returns a summary of per-market sync results (see `MarketSyncResult` in `error-handling.md`).

### Authentication

Secured via standard API Gateway authorization (IAM / resource policy). No public access.

## Upstream Service Contracts

| Service | Protocol | Client |
|---------|----------|--------|
| Explorer Service | HTTP/REST | OpenFeign (`realtime-content-wrapper 7.6.0`) |
| OpSheet Service | HTTP/REST | OpenFeign |
| Facility Service | HTTP/REST | OpenFeign |

All service credentials managed via Vault with Jasypt-encrypted property references.
