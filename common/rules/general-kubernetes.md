# Kubernetes Standards

## Resource Definitions
- Always set resource requests AND limits for CPU and memory
- Use namespaces to isolate environments
- Label all resources with: `app`, `version`, `environment`, `team`
- Use `readinessProbe` and `livenessProbe` on all containers

## Security
- Never run containers as root — set `runAsNonRoot: true`
- Use `securityContext` with `readOnlyRootFilesystem: true` where possible
- Store secrets in Kubernetes Secrets or external secret managers — never in ConfigMaps
- Use NetworkPolicies to restrict pod-to-pod traffic
- Use RBAC with least-privilege service accounts

## Deployments
- Use rolling update strategy with `maxSurge` and `maxUnavailable`
- Set `terminationGracePeriodSeconds` appropriate to your app's shutdown time
- Use PodDisruptionBudgets for critical services
- Pin image tags — never use `:latest`

## Configuration
- Use ConfigMaps for non-sensitive config
- Use environment variables or mounted volumes, not hardcoded values
- Separate config per environment (dev, stage, prod)

## Observability
- Export metrics in Prometheus format
- Use structured JSON logging
- Include correlation IDs in all log entries
- Set up alerts for pod restarts, OOM kills, and high error rates
