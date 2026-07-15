# AWS Account Structure (DXCP)

## Account Map

Three domains (d01, d04, d07) × four environments (latest, stage, load, prod) plus 3 sandbox accounts.

### Sandbox Accounts

| Profile | Account ID | IAM Role | Purpose |
|---------|-----------|----------|--------|
| c2-ra-sandbox | 471112546681 | WDPR-RAI_ENGINEER | D07 sandbox EKS clusters |
| ra-sandbox | 633112549318 | WDPR-RAI_ENGINEER | Cross-account S3, dxcp-xa-s3-* roles |
| wdpr-ipe-sandbox | 923675928517 | WDPR-DATABASE_ENGINEER | IPE/DB workloads |

### Domain 01 (d01)

| Profile | Account ID | IAM Role |
|---------|-----------|----------|
| wdpr-d01-lst-1 | 381439973067 | WDPR-RAI_ENGINEER |
| wdpr-d01-stg-1 | 230035819236 | WDPR-RAI_ENGINEER |
| wdpr-d01-lod-1 | 103002841625 | WDPR-RAI_ENGINEER |
| wdpr-d01-prd-1 | 598428563496 | WDPR-RAI_ENGINEER |

### Domain 04 (d04)

| Profile | Account ID | IAM Role |
|---------|-----------|----------|
| wdpr-d04-lst-1 | 663278310625 | WDPR-RAI_ENGINEER |
| wdpr-d04-stg-1 | 928012279026 | WDPR-RAI_ENGINEER |
| wdpr-d04-lod-1 | 238508923037 | WDPR-RAI_ENGINEER |
| wdpr-d04-prd-1 | 059221680817 | WDPR-RAI_ENGINEER |

### Domain 07 (d07)

| Profile | Account ID | IAM Role |
|---------|-----------|----------|
| wdpr-d07-lst-1 | 486939104331 | WDPR-RAI_ENGINEER |
| wdpr-d07-stg-1 | 840033526853 | WDPR-RAI_ENGINEER |
| wdpr-d07-lod-1 | 619048610660 | WDPR-RAI_ENGINEER |
| wdpr-d07-prd-1 | 349897074289 | WDPR-RAI_ENGINEER |

## Profile Chain

```
default (SSO) → wdpr-apps (role_arn) → named-profile (source_profile=wdpr-apps)
```

All use `WDPR-RAI_ENGINEER` role except IPE sandbox which uses `WDPR-DATABASE_ENGINEER`.

## Cross-Account S3 Pattern

```
Pod Identity (cluster account) → dxcp-xa-s3-* cross-account role → S3 bucket (ra-sandbox)
```

## Usage Rules

1. **Always use named profiles** — never hardcode credentials
2. **Read-only by default** — write operations require explicit approval
3. **Never log keys** to terminal or files
4. **Use the helper script:** `scripts/aws-assume-profile.sh <profile>`

## Helper Script

```bash
# Get temporary credentials
eval "$(./scripts/aws-assume-profile.sh ra-sandbox)"

# Run a command directly
./scripts/aws-assume-profile.sh wdpr-d07-lst-1 -- aws eks list-clusters
```
