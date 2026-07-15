# GitHub Workflow (DXCP)

## Host & MCP

- **Host:** github.disney.com
- **MCP:** github-disney-mcp with dynamic toolsets
- **PAT location:** ~/.config/mcp-servers/github-disney-mcp.env

### MCP Toolset Activation

At session start, enable required toolsets:
```
enable_toolset("pull_requests")
enable_toolset("repos")
```

Prefer MCP over curl/gh CLI for PRs, diffs, files, and comments.

## Branch Naming

```
IOET-XXXX/short-description-in-kebab-case
```

Examples:
- `IOET-12275/addon-override-retirement`
- `IOET-8512/cross-account-s3-irsa`

## Commit Convention

```
type(scope): [IOET-XXXX] short description
```

Types: feat, fix, docs, chore, refactor, test, ci

Examples:
- `feat(addons): [IOET-12275] add kube-prometheus override v2.3`
- `fix(blueprint): [IOET-8297] correct versionRegex for external-dns`
- `docs(runbook): [IOET-8512] add cross-account S3 setup guide`

## PR Conventions

- **Title:** `[IOET-XXXX] Short description`
- **Body:** Use org template from `wdpr-cloud-paas-rafay/.github`
- **No AI attribution footers**
- **One dependency layer per PR** (Rafay atomicity rule)

## Main Branch Protection

- Never push directly to main/master
- All changes via PR
- PR requires at least 1 approval
- CI checks must pass

## Repository Organization Map

| Directory | GHE Org/Repo |
|-----------|-------------|
| wdpr-cloud-paas-rafay/wdpr-cp-rafay-addons | wdpr-cloud-paas-rafay/wdpr-cp-rafay-addons |
| wdpr-cloud-paas-rafay/wdpr-cp-rafay-sandbox-gitops | wdpr-cloud-paas-rafay/wdpr-cp-rafay-sandbox-gitops |
| wdpr-cloud-paas-rafay/wdpr-cp-rafay-platform-gitops | wdpr-cloud-paas-rafay/wdpr-cp-rafay-platform-gitops |
| wd-cp/manifesto | wd-cp/manifesto |
| wdpr-cso-terraform/wdpr-ra-vpcn | wdpr-cso-terraform/wdpr-ra-vpcn |

## PR Review Focus Areas (DXCP-specific)

1. **Jira AC fulfillment** — Does the PR satisfy acceptance criteria?
2. **Scope leaks** — Does the PR include unrelated changes?
3. **IAM/IRSA least privilege** — Are permissions minimally scoped?
4. **Helm template drift** — Do templates match expected patterns?
5. **Rafay dependency atomicity** — One layer per PR?
6. **Override naming** — Follows *-vX.X convention?
