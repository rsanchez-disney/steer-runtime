# DB Upgrade Analyzer — Reference Config

## Report HTML Template

Generate the report as an HTML file saved to `./db_upgrade_report_{instance}.html`.

After writing the file, inform the user they can open it with:
```
open ./db_upgrade_report_{instance}.html
```

### CSS Variables (dark theme)

```css
:root{--bg:#0f172a;--card:#1e293b;--border:#334155;--text:#e2e8f0;--muted:#94a3b8;--green:#22c55e;--yellow:#eab308;--red:#ef4444;--blue:#3b82f6;--cyan:#06b6d4}
```

### Required Components

- Dark background (`#0f172a`) with card-based layout (`#1e293b`)
- KPI stat cards at the top (grid layout)
- Tables with dark styling and colored badges (`.badge-ok`, `.badge-warn`, `.badge-crit`, `.badge-info`)
- Timeline component for switchover/event sequences
- Summary section with icon+text rows
- Recommendations table with priority badges
- CloudWatch console links for key metrics
- Footer with generation timestamp

---

## AWS CLI Query Reference

### Discover Instances

```bash
aws rds describe-db-instances --profile <profile> --region <region> \
  --query "DBInstances[?starts_with(DBInstanceIdentifier,'<prefix>')].{ID:DBInstanceIdentifier,Created:InstanceCreateTime,Version:EngineVersion,Class:DBInstanceClass,Status:DBInstanceStatus}" \
  --output table
```

### Parameter Group Diff

```bash
aws rds describe-db-parameters --profile <profile> --region <region> \
  --db-parameter-group-name "<group-name>" \
  --query "Parameters[?Source=='user'].{Name:ParameterName,Value:ParameterValue}" --output json
```

### Switchover Events

```bash
aws rds describe-events --profile <profile> --region <region> \
  --source-identifier <new-instance> --source-type db-instance --duration 20160 \
  --query "Events[?contains(Message,'Switchover') || contains(Message,'upgrade')]" --output table
```

### Green Instance Discovery

```bash
# From RDS Events
aws rds describe-events --profile <profile> --region <region> \
  --source-identifier <new-instance> --source-type db-instance --duration 20160 \
  --output json --query "Events[?contains(Message,'green')].Message"

# From CloudWatch Log Groups
aws logs describe-log-groups --profile <profile> --region <region> \
  --log-group-name-prefix "/aws/rds/instance/<name-prefix>-green" \
  --query "logGroups[].logGroupName" --output table
```

### Green Instance Error Logs (pre-switchover)

```bash
aws logs filter-log-events --profile <profile> --region <region> \
  --log-group-name "/aws/rds/instance/<green-instance-name>/error" \
  --start-time <green-creation-epoch-ms> --end-time <switchover-epoch-ms> \
  --filter-pattern "?ERROR ?Warning ?Aborted ?deprecated ?crash ?fatal ?replication ?slave ?denied" \
  --limit 100 --output json --query "events[].message"
```

### Green Instance RDS Events

```bash
aws rds describe-events --profile <profile> --region <region> \
  --source-identifier <green-instance-name> --source-type db-instance --duration 20160 --output table
```

### Blue/Green Deployment Events

```bash
aws rds describe-events --profile <profile> --region <region> \
  --source-type blue-green-deployment --duration 20160 --output table
```

### CloudWatch Metrics

```bash
aws cloudwatch get-metric-statistics --profile <profile> --region <region> \
  --namespace AWS/RDS --metric-name <metric> \
  --dimensions Name=DBInstanceIdentifier,Value=<instance> \
  --start-time <start> --end-time <end> --period 86400 \
  --statistics Average Maximum Minimum --output json
```

Metrics to pull: `CPUUtilization`, `FreeableMemory`, `ReadIOPS`, `WriteIOPS`, `ReadLatency`, `WriteLatency`, `DatabaseConnections`, `FreeStorageSpace`.

### RDS Events (post-upgrade)

```bash
aws rds describe-events --profile <profile> --region <region> \
  --source-identifier <instance> --source-type db-instance --duration 10080 --output table
```

### CloudWatch Error Logs (post-switchover)

```bash
aws logs filter-log-events --profile <profile> --region <region> \
  --log-group-name "/aws/rds/instance/<instance>/error" \
  --start-time <epoch-ms> --end-time <epoch-ms> \
  --filter-pattern "?ERROR ?Warning ?Aborted ?deprecated ?crash ?fatal ?denied ?timeout" \
  --limit 100 --output json --query "events[].message"
```

---

## Splunk Search Patterns (via Compass)

1. `index=<app-index> "<db-endpoint>" ERROR`
2. `index=<app-index> ("MariaDB" OR "MySQL") ("timeout" OR "refused" OR "reset" OR "deprecated" OR "syntax")`
3. `index=<app-index> "SQLException" OR "DataAccessException" OR "CommunicationsException"`
4. `index=<app-index> "lock wait timeout" OR "deadlock" OR "too many connections"`

---

## Regression Thresholds

| Metric | Condition | Severity |
|--------|-----------|----------|
| CPU avg increase | > 50% | ⚠️ Warning |
| Free memory min decrease | > 30% | ⚠️ Warning |
| Free memory min | < 1 GB | 🔴 Critical |
| Read/Write latency avg increase | > 100% | ⚠️ Warning |
| IOPS | Hitting provisioned ceiling | ⚠️ Warning |
