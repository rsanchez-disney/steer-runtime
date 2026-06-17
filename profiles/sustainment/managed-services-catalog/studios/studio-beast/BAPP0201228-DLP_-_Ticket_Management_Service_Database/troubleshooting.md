# Troubleshooting — DLP Ticket Management Service Database

## Common Issues

### Issue: RDS instance unavailable

**Symptoms:** TMS Provider returning database connection errors. All ticket operations failing.

**Root Cause:** RDS MariaDB instance down or unreachable.

**Resolution:** Check RDS instance health in AWS Console for the appropriate environment. Verify security groups and network connectivity. Escalate to Cloud OPS if infrastructure issue.

---

### Issue: Slow query performance

**Symptoms:** TMS responding slowly. AppDynamics showing high DB response times.

**Root Cause:** Database performance degradation — high load, missing indexes, or resource constraints.

**Resolution:** Check AppDynamics dashboard for the environment. Review RDS CloudWatch metrics (CPU, connections, IOPS). Escalate to Luigi Squad for query optimization or Cloud OPS for resource scaling.

---

## Escalation Decision Tree

- If RDS infrastructure issue → Cloud OPS (ops-frdlp-cloudops)
- If query/schema issue → Luigi Squad (app-frdlp-guestprofile)
- If connectivity from TMS → check TMS ECS tasks first, then DB

## Known Quirks

- This is a separate BAPP from TMS (BAPP0201208) but tightly coupled
- Same database instance serves TMS Provider, EPS, and Preloader
