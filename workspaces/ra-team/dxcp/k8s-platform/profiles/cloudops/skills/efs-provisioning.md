# EFS Provisioning

Create EFS file systems for teams needing persistent storage on DXCP-managed clusters.

## Trigger
User asks to create EFS, provision storage, or references an EFS-related Jira ticket.

## Repo & Path

- **Config repo:** `wdpr-cso-terraform/wdpr-ra-vpcn`
- **tfvars location:** `dxcp/wdpr-efs-workspaces/`
- **Module source:** `git::ssh://git@github.disney.com/dpep-cloud-terraform/wdpr-efs-workspaces?ref=v5.x`

## tfvars Naming Convention

```
wdpr-{bag}-{BAPP_ID}-{region_short}-{environment}-{purpose}.tfvars
```

Examples:
- `wdpr-d04-B0175022-usw2-latest-gae-jenkins.tfvars`
- `wdpr-d07-B0199576-usw2-prod-jenkins.tfvars`

## Required Information

Before creating tfvars, confirm with the requester:

| Field | Source | Example |
|-------|--------|---------|
| BAPP ID | Requester's app registration | BAPP0175022 |
| Account | Domain + environment | wdpr-d04-lst-1 |
| Region | Deployment target | us-west-2 |
| VPC ID | AWS CLI: `aws ec2 describe-vpcs` | vpc-08e8b3e0e9d37655a |
| VPC name | AWS CLI or existing tfvars | wdpr-d04-usw2-lst-1 |
| Cluster SG (name) | AWS CLI: `aws ec2 describe-security-groups --filters Name=group-name,Values=eks-cluster-sg-*` | eks-cluster-sg-rafay-aws-d04-lst-1-usw2-c1-... |
| Cluster SG (ID) | Same query, GroupId field | sg-037caf1b60f60b8c4 |
| Purpose / short_name | Requester | latest-gae-jenkins |

## Workflow

1. **Gather requirements** from Jira ticket (EFS names, purposes, expected sizes)
2. **Confirm BAPP ID** — must be the requester's app BAPP, NOT DXCP's (BAPP0199576)
3. **Get networking info** via AWS CLI:
   ```bash
   eval "$(./scripts/aws-assume-profile.sh <account-profile>)"
   aws ec2 describe-vpcs --region <region> --query 'Vpcs[*].[VpcId,Tags[?Key==`Name`].Value|[0]]' --output table
   aws ec2 describe-security-groups --region <region> --filters 'Name=group-name,Values=eks-cluster-sg-*' --query 'SecurityGroups[*].[GroupId,GroupName]' --output table
   ```
4. **Create tfvars** following the naming convention and existing patterns in the repo
5. **Create branch:** `IOET-XXXX/create-efs-<purpose>`
6. **Create PR** to `wdpr-cso-terraform/wdpr-ra-vpcn`
7. **Deploy via Atlantis:**
   ```
   atlantis plan -d dxcp/wdpr-efs-workspaces -w <tfvars-name-without-extension>
   atlantis apply -d dxcp/wdpr-efs-workspaces -w <tfvars-name-without-extension>
   ```
8. **Get EFS IDs** from Atlantis apply output or AWS CLI:
   ```bash
   aws efs describe-file-systems --region <region> --query 'FileSystems[*].[FileSystemId,Tags[?Key==`Name`].Value|[0]]' --output table
   ```
9. **Post EFS details to Jira** (file system IDs, DNS names) for the requester
10. **Create RITM** if needed for ServiceNow tracking

## Key Rules

- BAPP ID must belong to the requesting team, not DXCP
- `app_security_group` uses the SG **name** (tag:Name lookup), not the ID
- `custom_security_group_id` uses the raw SG **ID**
- Use `force_destroy = true` for non-prod, `false` for prod
- EFS is elastic — no pre-allocation needed (sizes in tickets are estimates only)
- Always enable backups (`cron(0 5 ? * * *)`, 35-day retention)
- One Atlantis plan+apply per workspace (per tfvars file)

## Validation

```bash
# Confirm EFS exists after apply
aws efs describe-file-systems --region <region> --query 'FileSystems[*].[FileSystemId,Tags[?Key==`Name`].Value|[0],LifeCycleState]' --output table

# Confirm mount targets are available
aws efs describe-mount-targets --file-system-id <fs-id> --region <region> --query 'MountTargets[*].[MountTargetId,SubnetId,IpAddress,LifeCycleState]' --output table
```

## Precedents

- IOET-7900: Sandbox EFS for DXCP Jenkins (PR #2095)
- IOET-12679: Latest EFS for Argon City (PR #2282, RITM10270719)
