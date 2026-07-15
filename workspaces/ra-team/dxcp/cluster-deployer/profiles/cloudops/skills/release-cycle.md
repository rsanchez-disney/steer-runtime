# Bi-Weekly Release Cycle

Execute the DXCP bi-weekly cluster update release cycle.

## Trigger
User asks to perform a release cycle, environment update, blueprint promotion, or mentions "release cycle" / "cluster update".

## Schedule (2-week sprint cadence)

| Environment | When | Window |
|-------------|------|--------|
| Pre-release (sandbox) | First Thu/Fri | Any time |
| Latest | First Monday | 10am–4pm ET |
| Stage | First Wednesday | 10am–4pm ET |
| Load | Second Thursday | 10am–4pm ET |
| Production | Second Tuesday | 23:00–06:00 ET |

## Pre-Release Validation

1. Review blueprint release notes for deployment details
2. Create & merge PR for new blueprint version in Platform repo
3. Update blueprint release notes with PR details
4. Copy base blueprint as release candidate (`<name>-v#.##.#-rc.1`) from Platform to Sandbox
5. (Optional) Create PRs for pre-release cluster updates (labels, addons, nodepools)
6. (Optional) Create PRs for platform sharing updates
7. (Optional) Create PRs for Kubernetes version updates
8. (Optional) Run Cluster Configurator "pre-blueprint"
9. (Optional) Create PRs for blueprint updates to pre-release clusters
10. (Optional) Run Cluster Configurator "post-blueprint"
11. Validate updates

## Environment Deployment (per environment)

1. **ServiceNow Changes**
   - Create change requests using CAPE models (8 total per cycle: AWS + GCP per env)
   - Obtain approvals (post to Teams channel)
   - Post upcoming change notification

2. **PRs & Deployment**
   - Create PRs for cluster updates (CTASK 1: labels, sharing)
   - Create PRs for K8s version updates (CTASK 2: control plane, node groups)
   - Create PRs for blueprint updates (CTASK 3: version bump, node removal)
   - Obtain PR approvals

3. **Execution**
   - Post starting notification
   - Merge CTASK 1 PRs (one at a time)
   - Verify via Rafay (UI, rtcl, kubectl, scripts)
   - Merge CTASK 2 PRs (one at a time)
   - Run Cluster Configurator "pre-blueprint"
   - Merge CTASK 3 PRs (one at a time)
   - Run Cluster Configurator "post-blueprint"
   - Verify all updates applied
   - Verify cluster/addon/app health
   - Close change (success or rollback)
   - Post completed notification

## Communication Template

```
Change Notification
Status: < Upcoming Change | Change Starting | Change Complete >
Change: <change numbers with links>
Environment: <LATEST | STAGE | LOAD | PRODUCTION>
Window: <start time> to <end time>
Summary: Standard Update Cycle
Release Notes Link: <link>
```

## Key Rules
- One PR at a time when merging
- Always verify after each merge step
- Use CAPE models for ServiceNow changes
- Production changes MUST be in 23:00–06:00 ET window
- Post notifications at start and end of each change
