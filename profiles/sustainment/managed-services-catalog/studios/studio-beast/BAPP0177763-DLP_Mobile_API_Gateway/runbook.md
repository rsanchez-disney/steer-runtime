# Runbook — DLP Mobile API Gateway

## Important

> **As support/dev we don't touch the infrastructure.**
> All operational actions on this component are handled by Cloud OPS (ops-frdlp-cloudops).

---

## Restart Procedures

N/A — managed by Cloud OPS.

---

## Scaling

N/A — managed by Cloud OPS (AWS API Gateway auto-scales).

## Failover

N/A — managed by Cloud OPS.

## Rollback

N/A — managed by Cloud OPS.

---

## Monitoring

- AWS CloudWatch API Gateway metrics
- Grafana: DLP Digital - PROD - Mobile Back-End API Gateway Global Dashboard

---

## Contacts

| System | Contact | When to Engage |
|--------|---------|----------------|
| API Gateway (all issues) | ops-frdlp-cloudops | Any gateway-level issue — routing, auth, rate limiting, infrastructure |
