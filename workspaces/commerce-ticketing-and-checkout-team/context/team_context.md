# Commerce Ticketing & Checkout — Team Context

## ServiceNow
- **Assignment Groups:** app-global-cme, web-global-salescart, web-global-salestickets
- **CTASK Close Code Field:** `u_close_code` (Disney custom, not standard `close_code`)
- **Close Codes:** successful, unsuccessful, issues, supplier, disney
- **ACL Requirement:** Service account must be member of CTASK assignment group to change state

## Splunk Indexes
- `wdpr_booking_service` — Booking service logs (us-west-2)
- `wdpr_payment` — Adaptive payment platform logs (us-east-1 + us-west-2)

## AppDynamics Applications
- `prod_wdpr-lexvas-wdw_int_ext_aws` (ID: 1230) — Lexicon View Assembler

## AWS Accounts
- **876496569223** — wdpr-apps (WDPRPCM-DEVELOPER / WDPRPCM-PCI-APPS_DEVELOPER)
- **820987038150** — wdpr-ecommerce-prod (cross-account: `arn:aws:iam::820987038150:role/WDPR-DEVELOPER`)

## Escalation Path
1. L1 Support (this team) — triage, validate, close CTASKs
2. L2 Engineering — code-level investigation
3. Service Owner — architecture decisions, production changes
