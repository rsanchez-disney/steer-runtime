# Harness CI/CD Pipeline

Work with Harness pipelines for DXCP tool deployments.

## Trigger
User asks about deployments, pipelines, CI/CD, Harness configuration, or build failures.

## Key Concepts

- DXCP tools deploy via Harness pipelines
- Pipeline configurations define build, test, and deploy stages
- Deployments target ECS or EKS depending on the service
- Environment promotion follows: dev → stage → prod

## Common Tasks

### Check pipeline status
- Use Harness MCP or UI to check recent executions
- Look for failed stages and error messages

### Debug pipeline failures
1. Identify which stage failed
2. Read stage logs for error details
3. Check if it's a transient failure (retry) or code issue
4. Common issues: Docker build failures, test failures, auth token expiry

### Update pipeline configuration
- Pipeline YAML lives in repo or Harness UI
- Changes to pipeline config require review
- Test in non-prod pipeline first

## Environment Targets

| Service | Deploy Target | Pipeline |
|---------|--------------|----------|
| cluster_configurator | EKS | Harness |
| eve | EKS | Harness |
| dxcp_spog_api | ECS/EKS | Harness |
| dxcp_spog_ui | S3/CloudFront or ECS | Harness |
