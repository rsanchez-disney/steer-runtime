# Redis Architecture & Caching Strategy – SBC-DLP

## Overview

SBC-DLP uses a **dual-cache architecture** combining a distributed Redis Cluster (primary/shared) with a local Caffeine in-memory cache (per-instance). This design optimizes for both consistency across multiple application instances and read performance for frequently accessed reference data.

---

## Technology Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| Spring Data Redis | 2.7.18 | Cache abstraction & Redis integration |
| Jedis | 3.7.1 | Redis Java client |
| Caffeine | 3.1.8 | Local in-memory cache |
| Redis Cluster | 7.0.0 | Distributed shared cache (6 nodes locally) |

---

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                      SBC-DLP Application                           │
│                                                                    │
│  ┌─────────────┐     ┌──────────────────┐     ┌────────────────┐  │
│  │  Service    │────▶│  Caffeine Cache   │────▶│  Redis Cluster │  │
│  │  Layer      │     │  (localCacheManager)    │  (cacheManager)│  │
│  └─────────────┘     └──────────────────┘     └────────────────┘  │
│         │                                             │            │
│         │              ┌──────────────────┐           │            │
│         └─────────────▶│ CacheRefreshFilter│◀──────────┘           │
│                        │ (sync mechanism) │                        │
│                        └──────────────────┘                        │
└────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌──────────────────────────┐
                    │    Redis Cluster          │
                    │  (ports 7000-7005)        │
                    │  Shared across all        │
                    │  application instances    │
                    └──────────────────────────┘
```

---

## Configuration

### Source File
`Config/src/main/resources/common/redis.properties`

### Environment Variables (sourced from Vault)

| Variable | Description |
|----------|-------------|
| `REDIS_CLUSTERS` | Comma-separated list of cluster node addresses (host:port) |
| `REDIS_HOST` | Redis host (legacy, not used in cluster mode) |
| `REDIS_PORT` | Redis port (legacy, not used in cluster mode) |
| `REDIS_MAX_TOTAL` | Maximum total connections in pool |
| `REDIS_MAX_IDLE` | Maximum idle connections |
| `REDIS_MIN_IDLE` | Minimum idle connections |
| `REDIS_MAX_WAIT` | Max wait time for connection (ms) |
| `REDIS_MIN_EVICT` | Min evictable idle time (ms) |
| `REDIS_TIMEOUT` | Connection timeout (ms) |
| `REDIS_DEFAULT_EXPIRATION` | Default TTL for cache entries (seconds) |
| `REDIS_USE_SSL` | Enable SSL for Redis connections (boolean) |

### Caffeine Local Cache

| Variable | Description |
|----------|-------------|
| `caffeine.expiration` | TTL for local cache entries (minutes) |

All values are externalized and injected from HashiCorp Vault at runtime via the application's `.env` / Vault integration.

---

## Core Components

### 1. CacheConfig (`com.dd.redis.CacheConfig`)

The central configuration class that sets up both cache managers.

**Key behaviors:**
- Annotated with `@EnableCaching` and extends `CachingConfigurerSupport`
- Creates `JedisConnectionFactory` configured for Redis Cluster with SSL support
- `cacheManager` bean (Redis) is marked `@Primary` — Spring's default cache manager
- `localCacheManager` bean (Caffeine) is used when explicitly specified in annotations
- Maintains a static `lastRefreshDate` timestamp used for cross-instance cache invalidation
- Serialization: `StringRedisSerializer` for keys, `JdkSerializationRedisSerializer` for values

```java
@Primary
@Bean
public CacheManager cacheManager(JedisConnectionFactory redisConnectionFactory) {
    // Redis as primary distributed cache
}

@Bean
public CacheManager localCacheManager() {
    // Caffeine as local in-memory cache
}
```

### 2. CacheRefreshFilter (`com.dd.filters.CacheRefreshFilter`)

A servlet filter registered in `web.xml` that runs on every request (`*.do`, `*.jsp`).

**Purpose:** Synchronize local Caffeine cache invalidation across multiple application instances.

**How it works:**
1. On each request, reads `lastRefreshDate` from Redis (shared state)
2. Compares with the local static `CacheConfig.lastRefreshDate`
3. If remote timestamp is newer → clears all local Caffeine caches
4. Updates local timestamp to match remote

This ensures that when any instance clears a cache (via admin UI or scheduler), all other instances will detect the change on their next request and refresh their local caches.

### 3. CacheManagementServiceImpl (`com.dd.services.cache.CacheManagementServiceImpl`)

Manages cache metadata and provides cache clearing operations.

**Key operations:**
- `getSbcVersion()` / `setSbcVersion()` — Track application version in Redis
- `clearCacheOnVersionChange()` — Clears all caches when a new version deploys
- `clearCacheOnSchedule()` — Clears all Redis caches on cron trigger
- `getLastRefresh()` / `setLastRefresh()` — Track when caches were last invalidated (stored in Redis, read by CacheRefreshFilter)
- `clearLocalCache()` — Clears only the Caffeine local caches

### 4. CacheScheduler (`com.dd.scheduler.CacheScheduler`)

Spring `@Scheduled` component that refreshes caches on cron schedules.

**Scheduled jobs:**

| Cron Variable | Job | Description |
|---------------|-----|-------------|
| `CRON_MG_PROPERTIES` | `scheduleMGProperties()` | Refreshes MG Properties cache |
| `CRON_RULE_ENGINE` | `scheduleRuleEngine()` | Refreshes Rules Engine cache |
| `CRON_RECOMMENDER_OFFER_TEMPLATE` | `scheduleRecommenderOfferTemplate()` | Refreshes Discovery templates |
| `CRON_REFRESH_PRODUCTS` | `scheduleRefreshProducts()` | Refreshes PVS/Rooms product caches |
| `CRON_REFRESH_PCS` | `scheduleRefreshPCS()` | Refreshes PCS combinability data |
| `CRON_REFRESH_ADMIN` | `refreshAllCaches()` | Full cache purge (all names) |

The scheduler is gated by a feature toggle (`TOG_USE_CACHE_SCHEDULER`) that controls whether individual scheduled jobs execute.

### 5. CacheManagementRestController (`com.dd.rest.cache.CacheManagementRestController`)

REST endpoint for manual cache clearing from the admin UI.

**Endpoint:** `DELETE /v1/cache/{cacheType}`

**Supported cache types:**

| cacheType | Caches Cleared |
|-----------|----------------|
| `properties` | MGProperty |
| `rules` | RulesEngine |
| `template` | DiscoveryData, DiscoveryView |
| `pvs` | PackagingSvcRoom, PVS |
| `pcs` | PCS (Product Combinability) |
| `common` | Affiliation, Calendar, CodedComments, Country, InfoMessage, LanguageMarket, Language, Location, MarketSegment, PackageDiscount, SalesChannel, SalesMarket, SourceOfBusiness |

After clearing, it updates the `lastRefreshDate` in Redis so all instances detect the change.

---

## Cache Names Registry

Defined in `com.dd.services.cache.CacheNames`:

| Constant | Cache Name | Key Prefix | Description |
|----------|-----------|------------|-------------|
| `DISCOVERY_DATA` | DiscoveryData | `dd_` | Offer templates and discovery data |
| `FACILITIES` | Facilities | `f_` | Resort facility information |
| `MG_PROPERTY` | MGProperty | `mg_` | Application configuration properties |
| `ROOM` | PackagingSvcRoom | `psr_` | Room availability data |
| `RULES` | RulesEngine | `re_` | Business rules |
| `DISCOVERY_VIEW` | DiscoveryView | `dv_` | Rendered discovery views |
| `PVS_UTIL` | PVS | `psnr_`, `tv_`, `pvsr_` | Product validation services |
| `AFFILIATION` | Affiliation | `af_` | Affiliation data |
| `MARKET_SEGMENT` | MarketSegment | `ms_` | Market segment lookups |
| `COUNTRY` | Country | `cty_` | Country reference data |
| `SALES_CHANNEL` | SalesChannel | `sc_` | Sales channel reference |
| `SOB` | SourceOfBusiness | `sob_` | Source of business data |
| `LANGUAGE` | Language | `lan_` | Language data |
| `CACHE_MANAGEMENT` | CacheManagement | — | Meta-cache (version, refresh dates) |

---

## Dual-Cache Pattern (How Services Use Caching)

Services implement a **two-layer cache pattern** to maximize performance while keeping data consistent:

### Pattern: Public → Local Cache → Redis Cache → Database

```java
// Layer 1: Local Caffeine cache (per-instance, fast)
@Cacheable(value = "MarketSegment", key = "...", cacheManager = "localCacheManager")
public MarketSegment getByChannelAndSalesMarket(String salesChannel, String salesMarket) {
    // On miss, delegate to internal method (which checks Redis)
    MarketSegmentService service = SpringContextUtil.getBean(BEAN_MARKET_SEGMENT_SERVICE);
    return service.getByChannelAndSalesMarketInternal(salesChannel, salesMarket);
}

// Layer 2: Redis distributed cache
@Cacheable(value = "MarketSegment", key = "...")
public MarketSegment getByChannelAndSalesMarketInternal(String salesChannel, String salesMarket) {
    // On miss, fetch from database
    return drpDAO.getMarketSegmentBySalesMarket(salesChannel, salesMarket, null);
}
```

### Self-Invocation Pattern

Spring's `@Cacheable` proxy doesn't intercept internal method calls. Services use `SpringContextUtil.getBean()` to retrieve the proxied bean and invoke methods through it:

```java
MarketSegmentService marketSegmentService = SpringContextUtil.getBean(SpringContextUtil.BEAN_MARKET_SEGMENT_SERVICE);
return marketSegmentService.getByChannelAndSalesMarketInternal(key);
```

### Cache Eviction Pattern

Eviction always clears both layers (Redis first, then local):

```java
@CacheEvict(value = {"MarketSegment"}, allEntries = true)
public void clearCache() {
    // Clears Redis via @CacheEvict annotation
    MarketSegmentService service = SpringContextUtil.getBean(BEAN_MARKET_SEGMENT_SERVICE);
    service.clearLocalCache(); // Clears Caffeine
}

@CacheEvict(value = {"MarketSegment"}, allEntries = true, cacheManager = "localCacheManager")
public void clearLocalCache() {
    // no-op body — annotation handles clearing
}
```

---

## Cache Invalidation Strategies

### 1. Automatic (Scheduled)
- Cron-based jobs via `CacheScheduler`
- Configurable per-cache-type cron expressions from environment variables
- Gated by `TOG_USE_CACHE_SCHEDULER` feature toggle

### 2. Manual (Admin UI)
- Admin page at `/destiny/admin/cache_management.jsp`
- AngularJS UI allowing operators to selectively clear caches
- Calls `DELETE /destiny/v1/cache/{cacheType}`

### 3. Version-Based (Deployment)
- On startup, `CacheManagementServiceImpl.clearCacheOnVersionChange()` compares the deployed version with the version stored in Redis
- If different (new deployment), all caches are purged

### 4. Cross-Instance Propagation (Filter)
- `CacheRefreshFilter` runs on every request
- Compares local `lastRefreshDate` with Redis-stored value
- If stale, clears local Caffeine caches automatically

---

## Local Development Setup

### Docker Compose

The `docker-compose.yml` starts a Redis Cluster container alongside the application:

```yaml
services:
  redis-clusters:
    image: grokzen/redis-cluster:7.0.0
    container_name: redis-cluster
    environment:
      - IP=redis-cluster
    ports:
      - "7000-7005:7000-7005"
    healthcheck:
      test: ["CMD", "redis-cli", "-p", "7000", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  sbc-dlp:
    depends_on:
      redis-clusters:
        condition: service_healthy
```

### Starting Locally

Use the `start-compose.sh` script which:
1. Tears down existing containers
2. Builds and starts fresh containers
3. Waits for Redis cluster health check to pass
4. Optionally tails logs

```bash
./start-compose.sh          # start and tail logs
./start-compose.sh --no-tail  # start without log tailing
```

### Required Vault Configuration

Redis connection values must be present in your local Vault instance at `/v1/secret/hello/sbc-ui`. Key values needed:
- `REDIS_CLUSTERS`: `redis-cluster:7000,redis-cluster:7001,redis-cluster:7002,redis-cluster:7003,redis-cluster:7004,redis-cluster:7005`
- `REDIS_MAX_TOTAL`, `REDIS_MAX_IDLE`, `REDIS_MIN_IDLE`, `REDIS_MAX_WAIT`, `REDIS_MIN_EVICT`, `REDIS_TIMEOUT`, `REDIS_DEFAULT_EXPIRATION`
- `REDIS_USE_SSL`: `false` (for local development)

---

## Key Design Decisions

1. **Redis Cluster over standalone** — Provides horizontal scalability and high availability for production deployments
2. **Caffeine as L1 cache** — Reduces Redis network calls for hot data; each instance holds its own copy
3. **JDK serialization for values** — Simplicity over performance; cached objects must implement `Serializable`
4. **Non-locking cache writer** — Uses `RedisCacheWriter.nonLockingRedisCacheWriter()` to avoid distributed locking overhead
5. **Filter-based sync** — `CacheRefreshFilter` ensures eventual consistency across instances without pub/sub complexity
6. **Self-invocation via SpringContextUtil** — Workaround for Spring AOP proxy limitations in same-class method calls

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Stale data after cache clear | Local Caffeine not invalidated | Verify `CacheRefreshFilter` is active; check `lastRefreshDate` in Redis |
| `RedisConnectionException` | Redis cluster unreachable | Verify Redis is healthy: `docker exec redis-cluster redis-cli -p 7000 ping` |
| Serialization errors | Cached class not `Serializable` | Ensure all cached DTOs implement `java.io.Serializable` |
| Cache not working on new method | Self-invocation bypasses proxy | Use `SpringContextUtil.getBean()` pattern for internal calls |
| Scheduler not running | Toggle disabled | Check `TOG_USE_CACHE_SCHEDULER` property value in MG Properties |

### Useful Commands

```bash
# Check Redis cluster health
docker exec redis-cluster redis-cli -p 7000 cluster info

# Check cluster nodes
docker exec redis-cluster redis-cli -p 7000 cluster nodes

# List keys in a specific node
docker exec redis-cluster redis-cli -p 7000 keys '*'

# Flush all data (development only)
docker exec redis-cluster redis-cli -p 7000 flushall

# Monitor real-time Redis commands
docker exec redis-cluster redis-cli -p 7000 monitor
```

---

## File Reference

| File | Purpose |
|------|---------|
| `Config/src/main/resources/common/redis.properties` | Redis property placeholders |
| `MagicalGatheringWeb/.../redis/CacheConfig.java` | Cache configuration (both managers) |
| `MagicalGatheringWeb/.../filters/CacheRefreshFilter.java` | Cross-instance cache sync |
| `MagicalGatheringWeb/.../scheduler/CacheScheduler.java` | Scheduled cache refresh jobs |
| `MagicalGatheringWeb/.../rest/cache/CacheManagementRestController.java` | REST endpoint for cache clearing |
| `MagicalGatheringWeb/.../rest/cache/CacheManagementRestService.java` | Cache clearing orchestration |
| `MagicalGatheringBeans/.../services/cache/CacheManagementServiceImpl.java` | Core cache management logic |
| `MagicalGatheringBeans/.../services/cache/CacheNames.java` | Cache name constants |
| `MagicalGatheringWeb/src/main/webapp/admin/cache_management.jsp` | Admin UI page |
| `docker-compose.yml` | Local Redis Cluster setup |
