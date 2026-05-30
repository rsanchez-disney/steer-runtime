# Runbook — WDPR Ant-Man RMQ for Collector

## Health Check

- RabbitMQ Management Console (prod): https://collector-rmq.wdprapps.disney.com/
- RabbitMQ Management Console (prod-stage): https://prod-stage.collector-rmq.wdprapps.disney.com/
- RabbitMQ Management Console (prod-load): https://prod-load.collector-rmq.wdprapps.disney.com/
- RabbitMQ Management Console (prod-latest): https://prod-latest.collector-rmq.wdprapps.disney.com/

## Monitoring

- **Grafana Platform Status:** https://grafana.wdprapps.disney.com/d/ddsycmiacwwe8d/gcx-platform-status-dashboard?orgId=1&from=now-1h&to=now&timezone=browser&refresh=5m
- **Grafana Certificate Expiry:** https://grafana.wdprapps.disney.com/d/cdwb3kwo1fg1sc/gcx-ssl-tls-certificate-expiry?orgId=1&refresh=30m

## Certificate Renewal

- Monitor TLS certificate expiry via Grafana SSL/TLS Certificate Expiry dashboard
- Renew certificates before expiry to prevent connection failures

## Queue Management

- Monitor queue depth via RabbitMQ Management Console
- If queue depth is growing sustained, check Collector (BAPP0159223) health
- Messages persist in queue until consumed — no data loss on consumer restart

## Failover

- Managed RabbitMQ service with built-in HA
- If broker is unreachable, check AWS Amazon MQ service health

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| D-Scribe Collector (BAPP0159223) | Ant-Man Sustainment | Consumer not processing messages |
| SDM Courier | SE (Site Engineering) | Producer not sending messages |
| AWS Amazon MQ | Platform Engineering | Broker infrastructure issues |
| Certificate Renewal | Platform Engineering | TLS cert approaching expiry |
