# Rafay GitOps Standards

## AddonOverride Naming Convention (DXCP Standard)

| Layer | Convention | Example |
|-------|------------|--------|
| Addon version | Full semver | v2.3.0 |
| Override name/file/dir | Two segments *-vX.X | kube-prometheus-addon-aws-override-v2.3 |
| versionRegex | Match addon family | ^v2\.3\..*$ |

**Critical:** Use two-segment versioning (*-vX.X), NOT three-segment (*-vX.X.X).

## AddonOverride YAML Structure

```yaml
apiVersion: infra.k8smgmt.io/v3
kind: AddonOverride
metadata:
  name: <addon>-<purpose>-override-vX.X    # Must match filename
  project: <rafay-project>
spec:
  addon: <addon-name>
  versionRegex: "^vX\.Y\..*$"
  valuesPath: "file://<addon>-<purpose>-override-vX.X/<values-file>.yaml"
  sharing:
    projects:
      - name: <target-project>
```

## Key Rules

1. **metadata.name MUST match filename** (without .yaml extension)
2. **versionRegex** matches the addon's semver family (e.g., `^v2\.3\..*$` for all v2.3.x)
3. **valuesPath** uses `file://` with directory name matching override name
4. **sharing.projects** uses `name:` only (no project ID)

## Safe Retirement Process

1. Add new override with updated version→ merge PR
2. Set `sharing: {}` on legacy override → merge PR
3. Delete legacy override files → merge PR

**Never delete an override in the same PR that adds its replacement.**

## GitOps Repository Paths

| Kind | Example Path |
|------|--------------|
| Addon | projects/dxcp-infra-sandbox/addons/*.yaml |
| Blueprint | projects/dxcp-infra-sandbox/blueprints/*.yaml |
| Cluster | projects/<bapp-project>/clusters/*.yaml |
| AddonOverride | projects/<project>/addonoverrides/<name>.yaml |

## Rafay Dependency Atomicity

**One dependency layer per PR.** Examples:
- Addon PR cannot include blueprint changes in the same PR
- Override PR cannot include addon definition changes
- Blueprint PR should only modify blueprint resources

## Promotion Flow

```
sandbox-gitops (validate) → platform-gitops (fleet)
```

Override validated in sandbox is promoted to platform-gitops for fleet-wide deployment.

## Rafay REST API (Read-Only)

- **Base URL:** https://console.rafay.dev
- **Auth:** `X-API-KEY` header (key stored in `.rafay/apikey`)
- **URL pattern:** `/apis/{group}/v3/projects/{project}/{resourceType}`

### Key Endpoints

| Resource | Endpoint |
|----------|----------|
| Clusters | /apis/infra.k8smgmt.io/v3/projects/{p}/clusters |
| Blueprints | /apis/infra.k8smgmt.io/v3/projects/{p}/blueprints |
| Addons | /apis/infra.k8smgmt.io/v3/projects/{p}/addons |
| AddonOverrides | /apis/infra.k8smgmt.io/v3/projects/{p}/addonoverrides |
| Namespaces | /apis/infra.k8smgmt.io/v3/projects/{p}/namespaces |
| CloudEvents | /apis/infra.k8smgmt.io/v3/projects/{p}/clusters/{c}/cloudevents |
| GitOps Agents | /apis/gitops.k8smgmt.io/v3/projects/{p}/agents |
| System Projects | /apis/system.k8smgmt.io/v3/projects |

### Rafay Projects (DXCP)

- `d07-latest` — D07 latest environment
- `dxcp-infra-sandbox` — Sandbox validation
- Fleet projects per domain/environment
