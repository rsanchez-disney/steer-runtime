# Helm Chart Review Guidelines

## Review Order

1. `Chart.yaml` — metadata and dependencies
2. `values.yaml` — defaults and schema
3. `templates/` — resource definitions
4. `tests/` — test hooks
5. `docs/` — documentation

## Checklist

### Chart.yaml
- [ ] `apiVersion: v2` (Helm 3)
- [ ] Version follows SemVer
- [ ] `kubeVersion` constraint present and appropriate
- [ ] Dependencies pinned to specific versions
- [ ] Description is meaningful

### values.yaml
- [ ] No secrets or credentials in defaults
- [ ] Sensible defaults for all required values
- [ ] Comments explain non-obvious values
- [ ] Resource requests/limits defined
- [ ] Image tags are explicit (no `latest`)

### Templates
- [ ] Uses stable Kubernetes APIs (no deprecated versions)
- [ ] Security contexts defined (runAsNonRoot, readOnlyRootFilesystem)
- [ ] RBAC follows least-privilege
- [ ] Liveness/readiness probes present for deployments
- [ ] Resource requests and limits set
- [ ] Labels follow Kubernetes recommended labels
- [ ] Uses `tpl` for string interpolation, `toYaml` for YAML blocks
- [ ] Uses `required` for mandatory values
- [ ] Helper templates in `_helpers.tpl`

### Helm Mechanics
- [ ] `helm lint` passes
- [ ] `helm template` renders without errors
- [ ] No immutable selector changes between versions
- [ ] Subchart global values properly scoped
- [ ] Hooks have appropriate weights and delete policies

## Common Pitfalls

| Issue | Impact | Fix |
|-------|--------|-----|
| Immutable selector changes | Deployment fails on upgrade | Never change matchLabels after initial release |
| Subchart globals leak | Unexpected value overrides | Scope globals per subchart |
| Missing hook delete policy | Orphaned resources | Add `hook-succeeded,hook-failed` |
| Broad RBAC | Security risk | Scope to specific resources/verbs |
| No image digest | Mutable deployments | Pin to SHA or immutable tag |
| Missing probes | Unhealthy pods stay in service | Add liveness + readiness |

## Rafay-Specific Considerations

- Value files with `{{{ .global.Rafay... }}}` use Rafay template syntax, NOT Helm
- These are **not valid YAML** for `helm -f`; use synthetic test values instead
- Generate `helm-review-test-values.yaml` with mocked Rafay globals for validation:

```yaml
# Synthetic values for helm template validation
# Replaces Rafay {{{ }}} template variables
global:
  Rafay:
    clusterName: "test-cluster"
    projectName: "test-project"
```

## Validation Commands

```bash
helm lint /path/to/chart
helm template release /path/to/chart -f test-values.yaml
kubeconform -strict -kubernetes-version 1.28.0 <(helm template ...)
```
