# Environment Promotion

Promote blueprint and addon versions through environments.

## Trigger
User asks to promote changes, move to next environment, or update an environment's blueprint.

## Promotion Path

```
Pre-release (sandbox) → Latest → Stage → Load → Production
```

## Steps for Each Promotion

1. **Verify source environment is healthy**
   ```bash
   ./rafay-cluster-info.sh -e <source-env> -s
   ```
   Check: Blueprint Sync Status = Success, Health = HEALTHY

2. **Identify changes to promote**
   - Blueprint version being promoted
   - Addon versions included
   - Any sharing changes
   - Any K8s version updates

3. **Create PRs in target environment repo**
   - wdpr-cp-rafay-latest-gitops (for latest)
   - wdpr-cp-rafay-stage-gitops (for stage)
   - wdpr-cp-rafay-load-gitops (for load)
   - wdpr-cp-rafay-prod-gitops (for prod)

4. **ServiceNow change required** for latest/stage/load/prod
   - Use CAPE models for pre-populated data
   - 2 changes per environment (AWS + GCP)

5. **Execute in change window**
   - Follow release-cycle skill for full execution steps

## Validation After Promotion

- [ ] Blueprint sync status is Success
- [ ] All cluster pods are Running/Ready
- [ ] No CrashLoopBackOff pods
- [ ] Monitoring dashboards show healthy metrics
- [ ] Application health checks passing
- [ ] rafay-cluster-info.sh shows correct blueprint version

## Rollback

If promotion fails:
1. Revert the PR (create revert PR)
2. Merge revert PR
3. Wait for Rafay to sync back
4. Verify rollback successful
5. Update ServiceNow change as failed/rolled back
6. Document issue in Jira ticket
