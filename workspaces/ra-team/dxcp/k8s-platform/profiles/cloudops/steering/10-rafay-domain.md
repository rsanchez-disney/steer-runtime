---
inclusion: always
---

# Rafay Domain Knowledge

## Key Terms

- **Addon**: Rafay-managed Helm deployment defined in GitOps (Addon CR)
- **AddonOverride**: Environment/cloud-specific Helm values per cluster labels
- **Blueprint**: Cluster template listing customAddons and dependsOn order. Always bump version on changes.
- **Sandbox cluster**: Non-production cluster for validation before promotion
- **Platform GitOps**: Fleet-wide blueprint and sharing configuration
- **Environment GitOps**: Per-environment cluster specs (latest, stage, load, prod)

## Istio Gateway Terms

- **External Gateway**: Internet-facing (`external-gateway` in `istio-ingress`)
- **Internal Gateway**: Private subnet (`internal-gateway` in `istio-ingress`)
- **Platform TLS mode**: Wildcard certs on Gateway (default)
- **Per-app TLS mode**: XListenerSet per app namespace
- **istio-gateway-crds addon**: Must deploy BEFORE istio-gateway addon
- **XListenerSet**: Experimental CRD for per-app HTTPS listeners

## Observability Terms

- **kube-prometheus-addon**: Prometheus Operator + stack (Disney Prometheus)
- **RemoteWrite**: Prometheus pushing metrics to Splunk OTel on port 19291
- **Splunk OTel gateway**: Collector in gateway mode on port 19291
- **ServiceMonitor release label**: `release: kube-prometheus-addon`
- **dxcp-monitoring namespace**: Production namespace for kube-prometheus

## Override Naming Standard

| Layer | Convention | Example |
|-------|------------|--------|
| Addon version | Full semver | v2.3.0 |
| Override name | Two segments | kube-prometheus-addon-aws-override-v2.3 |
| versionRegex | Semver family | ^v2\.3\..*$ |

## Cluster Naming

- AWS: `rafay-aws-{domain}-{env}-{region}-c{n}` (e.g., `rafay-aws-d07-lst-1-usw2-c1`)
- GCP: `rafay-gcp-{domain}-{env}-{region}-c{n}` (e.g., `rafay-gcp-d07-prd-1-usc1-c1`)
