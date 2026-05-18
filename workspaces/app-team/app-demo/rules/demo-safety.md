# Demo Environment Safety

## Environment Awareness

- **Default target: `latest`** — never modify `stage` or `load` without explicit confirmation
- Demo apps are shared across teams — changes affect all testers
- Always verify which environment you're targeting before making config changes

## Testing Patterns

- Use `latest.*` endpoints for development and integration testing
- Payment flows require a valid session token — use Demo API's `/establish-session` first
- Identity V5 flows require browser/SDK interaction — cannot be tested via curl alone

## Code Changes

- Demo apps are reference implementations — keep them simple and well-documented
- Don't add production business logic to demo apps
- Config changes (client IDs, endpoints) must work across all brands (WDW, DLR, shopDisney)
- Mobile SDK version bumps require testing on both Android and iOS before merging
