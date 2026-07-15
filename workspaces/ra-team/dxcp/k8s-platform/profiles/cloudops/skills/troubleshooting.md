# Platform Troubleshooting

Diagnose and resolve issues on Rafay-managed K8s clusters.

## Trigger
User reports cluster issues, addon failures, sync problems, or asks to investigate incidents.

## Investigation Workflow

1. **Gather context**
   - Which cluster? Which environment? (latest/stage/load/prod)
   - Which addon or component is affected?
   - When did the issue start?
   - Any recent changes (blueprint update, addon promotion)?

2. **Check Rafay state**
   - Use Rafay API to check cluster health, blueprint sync status
   - Check CloudEvents for recent sync errors
   - Verify addon status via Rafay console/API

3. **Check Kubernetes state**
   ```bash
   kubectl get pods -n <namespace> --sort-by=.status.startTime
   kubectl describe pod <pod-name> -n <namespace>
   kubectl logs <pod-name> -n <namespace> --tail=100
   kubectl get events -n <namespace> --sort-by=.lastTimestamp
   ```

4. **Check monitoring**
   - Splunk logs for the affected service/namespace
   - Prometheus metrics if observability addon is healthy
   - ServiceNow for related incidents

5. **Common failure patterns**

   | Symptom | Likely Cause | Fix |
   |---------|-------------|-----|
   | Blueprint sync failed | Invalid override YAML | Check metadata.name matches filename |
   | Addon CrashLoopBackOff | Missing secrets/config | Run Cluster Configurator init-addons |
   | RBAC permission denied | Service account missing | Check IRSA annotation + IAM role |
   | Rafay 403 on API | RBAC regression | Use rafay-v3-readonly-audit.sh |
   | DNS not resolving | External-DNS addon unhealthy | Check route53-credentials secret |

6. **Escalation**
   - Create ServiceNow incident if customer-impacting
   - Document findings in DXCP_tickets/ folder
   - Link to Jira ticket

## Tools Available
- kubectl (via AWS assume-role)
- Rafay REST API (read-only)
- Splunk (via MCP)
- ServiceNow (via MCP)
- scripts/rafay-v3-inspect.sh
- scripts/rafay-v3-readonly-audit.sh
