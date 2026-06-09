# Runbook — DLC Navigator iPhone (IOS)

## Release Process

1. Complete regression testing
2. Cut release branch and create RC build
3. Submit RC to DSE-QE for sign-off
4. After DSE-QE sign-off, upload build to **Argon**
5. In Argon, request **Ingestion Testing** and **DIQA** approval
6. Create **Security** ticket for security team testing
7. Once all approvals are obtained, request **Store Submission** in Argon
8. Apple reviews and approves the build
9. Request publication date in Argon
10. Argon team publishes to App Store on the desired date

## Rollback

- **Rollback is not possible** — app store versions cannot be reverted
- A **hotfix** must be created following the same release process
- All approvals can be expedited in urgent situations

## Scaling

- N/A (mobile application — scaling is handled by backend services)

## Failover

- N/A (mobile application)

## Contacts for External Dependencies

| System | Contact | When to Engage |
|--------|---------|----------------|
| Argon / DIQA | Justin.Cruz@disney.com | Build upload issues, ingestion testing, approval delays |
| DSE-QE | Rajeev.Basani@disney.com | Sign-off delays, test environment issues |
| Backend (L3) | ServiceNow INC → AG: app-global-dcl-moblservice | Backend service outages, API issues |
| Security | Clemson.C.Lugtu@disney.com | Security review delays, build rejection |
