# Business Rules — WDPR Ant-Man Collector

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Monthly availability |
| Collection latency | < 10 min | Time from D-Scribe publish to S3 persistence |
| Error rate | < 1% | Failed collections / total attempts |

## Peak Periods

- Bulk content publishes from D-Scribe
- Schedule update campaigns (MealPeriod, Accommodation, etc.)
- Seasonal content changes (park events, holidays)
- Mass republish operations

## Business Logic

- Collector receives messages from D-Scribe via SDM Courier (Local Queue)
- Enriches XML with schedule data by calling D-Scribe Schedule Service
- Persists completed XML to S3 (sdm/Schedule/{DEW|DPMSCampus}/{ContentType}/{EnterpriseID}.xml)
- Sends downstream via sendDownstream() to MMA queue for Composite/FACSVC consumption
- isSendDownstreamFlag() controls whether downstream send occurs — if False, logs "SKIP sendDownstream()"
- Content types: MealPeriod, MenuOffering, Accommodation, ActivityProduct, FoodBeverageFacility, Entertainment, Facility, Character, Policy

## Dependencies

- **Upstream:** D-Scribe (publishes messages), SDM Courier (forwards to Collector)
- **Downstream:** S3 (XML persistence), MMA (Message Management Application), Composite/FACSVC, Watcher (BAPP0142680), Assembler (BAPP0089443)
- **Service calls:** D-Scribe Schedule Service (schedule data enrichment), OneSource (cache)
- **Data stores:** S3 buckets (d-scribe-content-live), Oracle databases (OS_PROD_CAMPUS, OS_PROD_D3)
- **Infrastructure:** AWS ECS EC2 (us-west-2), account 876496569223 (wdpr-apps)

## Impact Classification

- **Full outage:** No new content enters the pipeline; schedules/content become stale; MMA queue empty
- **Degraded:** Collection delays cause temporary staleness; existing S3 content remains accessible
