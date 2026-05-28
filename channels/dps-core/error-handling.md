# DPS Core — Error Handling

## Common Errors
| Error | Cause | Resolution |
|-------|-------|------------|
| NO_AVAILABILITY | Calendar has no open dates | Check PAT calendar config, verify sync ran |
| QUOTE_EXPIRED | Price lock timed out | Re-invoke quote endpoint |
| FREEZE_CONFLICT | Inventory already held | Wait for TTL expiry or use different dates |
| PAT_UNREACHABLE | PAT Authoring GraphQL down | Check PAT service health, retry with backoff |
| SCORING_FAILED | Scoring scheme misconfigured | Verify scheme in scoreschemeconfig service |

## Splunk Queries
See context/splunk_queries.md for pre-built queries per service.
