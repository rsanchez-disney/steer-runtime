# Cluster Configurator Development

Develop features for the DXCP Cluster Configurator tool.

## Trigger
User asks to work on cluster_configurator, init addons, vanity DNS provisioning, or blueprint sync tooling.

## Context

Cluster Configurator is a Python tool that:
- **Init Addons**: Reads addon-config.json, ensures namespaces, creates/updates secrets from Vault, optionally updates Rafay cluster labels, triggers blueprint sync
- **Vanity DNS**: Provisions Route53 credential secrets for external-dns addons
- **Pre-blueprint**: Prepares clusters before blueprint changes
- **Post-blueprint**: Updates pending addon settings after blueprint sync

## Key Files

- `addon-config.json` — Addon configuration definitions
- `ADDON_CONFIG.md` — Configuration documentation
- Source code in Python

## Domain Terms

- **Init Addons**: Namespace + secret creation from Vault
- **Vanity DNS addon**: `addon-external-dns-vanity` (parent zone `wdprapps.disney.com`)
- **Vanity shared addon**: `addon-external-dns-vanity-shared` (per-env zones)
- **Vanity URL secrets**: `route53-credentials` and `route53-acct-credentials`

## Development Guidelines

- Python best practices (type hints, docstrings)
- Unit tests with pytest
- Integration tests against sandbox environments
- Secrets never hardcoded — Vault-backed
- Idempotent operations (safe to re-run)
- Structured logging for observability
