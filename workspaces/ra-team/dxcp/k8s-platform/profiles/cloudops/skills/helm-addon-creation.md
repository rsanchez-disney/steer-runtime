# Helm Addon Creation

Create and validate Helm-based Kubernetes addons for Rafay-managed clusters.

## Trigger
User asks to create a new addon, chart, or Helm package for the platform.

## Workflow

1. **Identify addon requirements**
   - What platform capability does this addon provide?
   - Which clusters need it (AWS, GCP, or both)?
   - What dependencies does it have (CRDs, namespaces, secrets)?

2. **Create chart structure**
   ```
   <addon-name>/
   ├── Chart.yaml          # apiVersion: v2, semver version
   ├── values.yaml         # Sensible defaults, no secrets
   ├── templates/
   │   ├── _helpers.tpl    # Shared template helpers
   │   ├── deployment.yaml
   │   ├── service.yaml
   │   ├── serviceaccount.yaml
   │   └── rbac.yaml       # Least-privilege RBAC
   └── tests/
   ```

3. **Apply DXCP standards**
   - Security contexts: runAsNonRoot, readOnlyRootFilesystem
   - Resource requests and limits defined
   - Liveness/readiness probes
   - Labels following K8s recommended labels
   - No secrets in values.yaml
   - Image tags are explicit (no `latest`)

4. **Create AddonOverride(s)**
   - Naming: `<addon>-<cloud>-override-vX.X`
   - metadata.name matches filename
   - versionRegex matches addon semver family
   - valuesPath uses file:// URI
   - sharing.projects uses name-only references

5. **Validate**
   ```bash
   helm lint <chart-path>
   helm template release <chart-path> -f test-values.yaml
   kubeconform -strict -kubernetes-version 1.28.0 <(helm template ...)
   ```

6. **Test in sandbox**
   - Create PR to sandbox-gitops
   - Verify Rafay syncs successfully
   - Check pod health, logs, metrics
   - Validate RBAC permissions

## Rules
- One addon per chart
- One dependency layer per PR (addon PR ≠ blueprint PR)
- Rafay `{{{ }}}` syntax is NOT Helm — use synthetic test values for local validation
- Follow ADR naming: two-segment versioning (*-vX.X)
