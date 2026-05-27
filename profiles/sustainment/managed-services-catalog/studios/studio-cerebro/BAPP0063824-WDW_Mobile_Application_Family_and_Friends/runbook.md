# Runbook — WDW Mobile Application (Family and Friends)

## Restart Procedures

1. This is a mobile module — no server-side restart applicable
2. For backend issues, check Profile B2C and VAS services

**Validation:** Verify FnF features work in the WDW Android app test builds

---

## Scaling

- **Scale up:** Not applicable — mobile module. Backend scaling handled by Profile B2C/VAS services.
- **Scale down:** Not applicable

## Failover

- Not applicable for mobile module. Backend failover handled by upstream services.

## Rollback

- Rollback requires a new mobile app release or feature flag toggle
- Contact Mark Lewis (Disney POC) for release decisions

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| WDW Android App | Mark Lewis | Mobile release issues |
| Profile B2C | Andrew Southwick | Backend API failures |
| OneID | IDY Team | Authentication failures |
