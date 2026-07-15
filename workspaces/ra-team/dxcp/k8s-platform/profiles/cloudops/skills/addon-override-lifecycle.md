# AddonOverride Lifecycle

Create, update, and retire AddonOverride resources in Rafay GitOps.

## Trigger
User asks to create/update/retire an override, promote an addon, or change addon configuration per environment.

## Create New Override

1. **Name the override** using two-segment convention:
   ```
   <addon>-<cloud>-override-vX.X
   ```
   Example: `kube-prometheus-addon-aws-override-v2.3`

2. **Create the YAML structure:**
   ```yaml
   apiVersion: infra.k8smgmt.io/v3
   kind: AddonOverride
   metadata:
     name: <override-name>    # MUST match filename
     project: <rafay-project>
   spec:
     addon: <addon-name>
     versionRegex: "^vX\.Y\..*$"
     valuesPath: "file://<override-name>/values.yaml"
     sharing:
       projects:
         - name: <target-project>
   ```

3. **Create values file** at `<override-name>/values.yaml`

4. **PR to appropriate repo:**
   - New addon validation → sandbox-gitops
   - Fleet deployment → platform-gitops

## Retire Override (Safe Process)

Three separate PRs — never combine steps:

1. **PR 1:** Add new override (vX.Y) → merge
2. **PR 2:** Set `sharing: {}` on old override → merge
3. **PR 3:** Delete old override files → merge

## Validation Checklist
- [ ] metadata.name matches filename exactly
- [ ] versionRegex is valid Go regex
- [ ] valuesPath file:// matches actual directory/file layout
- [ ] sharing.projects uses name-only (no IDs)
- [ ] PR contains only one dependency layer
