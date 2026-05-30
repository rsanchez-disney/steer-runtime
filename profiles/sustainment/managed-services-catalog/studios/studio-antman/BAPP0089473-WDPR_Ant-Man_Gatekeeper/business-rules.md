# Business Rules — WDPR Ant-Man Gatekeeper

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Monthly availability |
| Response time (p95) | < 500ms | Splunk latency_spl |
| Error rate | < 1% | Non-validation errors / total requests |

## Peak Periods

- Content publishing campaigns (park events, seasonal updates)
- Bulk content migrations or republishes
- SDL Connect sync cycles
- Product Mapper updates

## Business Logic

- Gatekeeper manages the content publication lifecycle for D-Scribe/ECM platform
- Integrates with SDL Connect for content translation/localization workflows
- Provides Product Mapper functionality for content-to-product mapping
- Controls which content gets published and manages publication refresh cycles
- Publications can be refreshed and listed via dedicated endpoints

## Dependencies

- **Upstream:** CMS/Tridion (content source), SDL Connect (translation)
- **Downstream:** Assembler (BAPP0089443), Transformer (BAPP0089458), content consumers
- **Data stores:** MongoDB (publication state), S3 buckets (d-scribe-content-*)
- **Infrastructure:** AWS ECS Fargate (us-west-2)

## Impact Classification

- **Full outage:** Content publications cannot be managed; new content cannot flow through the pipeline
- **Degraded:** Publication refresh delays; SDL Connect sync issues cause translation lag
