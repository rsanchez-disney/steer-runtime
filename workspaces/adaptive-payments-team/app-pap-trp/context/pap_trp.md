# PAP & TRP Context

## Payment Admin Portal (PAP)
Batch payment processing — submitters create batches (refund, settlement, auth), approvers review, Automic processes.

## Transaction Research Portal (TRP)
Transaction lookup, research, and inquiry for support teams.

## Repos & Layers
| Layer | Repo | Tech |
|-------|------|------|
| UI | wdpr-payment-controls-client | Angular — PAP batch creation/approval + TRP transaction search (shared monorepo) |
| BFF | wdpr-payment-controls-api | Node.js — PAP batch routes + TRP search routes |
| Backend | wdpr-payment-services | Java/Spring Boot — core payment processing (auth, settlement, refund, batch) |
| Backend | wdpr-app-inquiry-service | Java/Spring Boot — transaction search and detail retrieval |
| Legacy | dpay-admin-inquiry-webapi | Node.js — legacy inquiry API (being replaced by TRP) |

## Key Flows
- PAP: batch creation → approval workflow → Automic processing
- TRP: transaction search → detail view → digital receipt generation
- Legacy inquiry migration to TRP module in payment-controls-client
