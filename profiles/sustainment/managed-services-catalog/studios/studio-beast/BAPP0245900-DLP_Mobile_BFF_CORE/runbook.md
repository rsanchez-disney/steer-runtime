# Runbook — DLP Mobile BFF CORE

## Restart Procedures

### ECS Service

1. Navigate to AWS ECS Console → eu-west-1 → Cluster `dlp-apps-B0245900-euw1-prd`
2. Select the BFF core service → Update → Force new deployment
3. Monitor new tasks reaching RUNNING state

**Validation:**
- Verify health check endpoint returns 200
- Check Splunk dashboard "wdpr-dlp-is-mobile-bff-core-service" for new logs
- Confirm GraphQL endpoint responds: send a test query to `/graphql`

---

## Scaling

- **Scale up:** Update desired count in ECS service definition. BFF is stateless (Redis for cache) and can scale horizontally.
- **Scale down:** Reduce desired count. Ensure at least 2 tasks remain for availability.
- **Redis cache:** Managed by AWS ElastiCache — scaling requires infrastructure change.

## Failover

- ECS service runs across multiple AZs in eu-west-1 — automatic failover on task failure
- API Gateway (z0luy5a6wc) routes traffic to healthy ECS tasks
- Redis cache: if cache is unavailable, BFF falls back to direct downstream calls (degraded performance but functional)

## Rollback

- **Harness:** Use Harness pipeline rollback to redeploy previous artifact version
- **ECS:** Update task definition to previous revision, force new deployment
- **Rundeck:** Alternative deployment mechanism available

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| ARS (Arrival Reservation System) | ARS team | Registration/booking retrieval failures |
| Book Dine | Book Dine team | Dining reservation data failures |
| Digital Key | Digital Key team | Digital key retrieval issues |
| Magic Mobile | Magic Mobile team | Magic mobile pass failures |
| Content API (Tridion) | Content team | Content retrieval failures |
| Lineberty | Lineberty team | Virtual queue provider issues |
| DLP Vault | Infrastructure team | Secret/config retrieval failures |
| Alexandre Bessa | Dev SME | Architecture decisions, complex debugging |
