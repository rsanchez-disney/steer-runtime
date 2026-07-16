---
inclusion: auto
description: Atlantis Terraform workflow for wdpr-ra-vpcn and EFS provisioning
---

# Atlantis Terraform Workflow

## Overview

The `wdpr-cso-terraform/wdpr-ra-vpcn` repo uses Atlantis for Terraform plan/apply. PRs trigger Atlantis comments with plan output; applies are triggered manually via PR comments.

## Commands

```
atlantis plan -d <directory> -w <workspace-name>
atlantis apply -d <directory> -w <workspace-name>
```

- `-d` = directory within the repo (e.g., `dxcp/wdpr-efs-workspaces`)
- `-w` = workspace name = tfvars filename without `.tfvars` extension

## EFS Workspace Example

```
# Plan
atlantis plan -d dxcp/wdpr-efs-workspaces -w wdpr-d04-B0175022-usw2-latest-argon-media

# Apply (after plan approval)
atlantis apply -d dxcp/wdpr-efs-workspaces -w wdpr-d04-B0175022-usw2-latest-argon-media
```

Run one workspace at a time. Each tfvars file = one Terraform workspace = one EFS file system.

## Terraform Version

- Current: 1.13.0 (from version.properties)
- State backend: S3 (`wdpr-apps-terraform` bucket, `us-east-1`)
- Locking: S3-managed lock file (not DynamoDB since v5.0.0)

## Provider Authentication

- Atlantis uses `WDPR-cross-Atlantis` role to assume into target accounts
- No manual credentials needed for plan/apply
- The `account` field in tfvars determines which AWS account Terraform provisions into

## Repo Structure (wdpr-ra-vpcn)

```
wdpr-ra-vpcn/
├── dxcp/wdpr-efs-workspaces/     ← DXCP EFS configs
├── wdpr-vpc-workspaces/          ← VPC configs (600+)
├── wdpr-s3-workspaces/           ← S3 logging buckets
├── wdpr-kinesis-stream/          ← Kinesis streams
└── wdpr-azure-vnet-workspaces/   ← Azure VNETs
```

## ServiceNow Integration

- EFS provisioning may require a RITM for audit trail
- RITM tracks the request and links to the PR
- Not always mandatory for non-prod environments
