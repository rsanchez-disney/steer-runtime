<!-- owner: @disney-payments-core -->
<!-- last-updated: 2026-04-08 -->
# Config Studio — Channel Contracts

## Channel Identifier
- Channel code: `CONFIG_STUDIO`
- Source system: `wdpr-payment-controls-client`

## Required Headers
| Header | Value | Description |
|---|---|---|
| `Authorization` | `Bearer {sso_token}` | Disney SSO OAuth2 token |
| `X-Channel` | `CONFIG_STUDIO` | Channel identifier |
| `X-Request-Id` | UUID | Request correlation ID |

## Channel-Specific Fields
- `auditUser` — SSO username of the cast member making changes
- `auditReason` — Required text field for change justification
- `environment` — Target environment for configuration (dev/stage/prod)
