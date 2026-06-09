# Incident Analysis Patterns

## Mandatory New Relic Filters

ALL NRQL queries MUST include the base filter PLUS the environment state:

**At Home:**
```sql
AND buildVariant IN ('release', 'Appstore') AND appName IN ('DCL.iOS', 'DCL.Android-RELEASE') AND state = 'pre-voyage'
```

**Onboard:**
```sql
AND buildVariant IN ('release', 'Appstore') AND appName IN ('DCL.iOS', 'DCL.Android-RELEASE') AND state = 'in-voyage'
```

## Guest Identifiers by Environment

| Environment | Identifier | State Filter |
|-------------|-----------|--------------|
| At Home | `swid` | `state = 'pre-voyage'` |
| Onboard | `castawayId` | `state = 'in-voyage'` |

**NEVER mix these up.** swid + pre-voyage = At Home. castawayId + in-voyage = Onboard.

## Grafana Alert → New Relic Flow

1. Extract the Grafana alert URL from the INC description
2. **Access the Grafana alert link** to open the alert configuration
3. Find the **New Relic NRQL query** defined in the alert panel/rule
4. Use that exact query as the base — do NOT invent queries
5. **Append the mandatory filters** (buildVariant, appName, state) before running
6. Run the final NRQL via `@newrelic-mcp/*`
7. Analyze results for error patterns, affected users, status codes

## Link Extraction from INC Description

### Grafana Alert Links
Pattern: `https://grafana.disney.com/...` or `https://grafana-*.disney.com/...`
- Extract the full URL including alert ID and panel parameters
- **You MUST access this link** to get the actual NRQL query

### Runbook Links
Pattern: `https://confluence.disney.com/...` or `https://mywiki.disney.com/...`
- Extract for reference and known resolution steps

### Identifying Environment from Description
- **At Home indicators:** "shoreside", "at home", "pre-embarkation", `swid`, no ship reference
- **Onboard indicators:** ship names (Disney Wish, Disney Treasure, Disney Fantasy, Disney Dream, Disney Magic, Disney Wonder), voyage codes (e.g., `WI20260520`), "onboard", "at sea", `castawayId`

## Common Error Patterns

### At Home (swid-based, state = pre-voyage)
- Authentication failures (login, token refresh)
- Booking/reservation errors (payment, availability)
- Content loading failures (itinerary, port info)
- Push notification delivery failures

### Onboard (castawayId-based, state = in-voyage)
- Connectivity issues (satellite bandwidth, ship network)
- Chat/messaging failures
- Activity booking errors
- Folio/account lookup failures
- Dining reservation errors

### Status Code Meanings
- **401/403:** Auth token expired or invalid permissions
- **404:** Resource not found (deleted booking, invalid ID)
- **408/504:** Timeout (common onboard due to satellite latency)
- **429:** Rate limiting
- **500:** Server error (check logs for stack trace)
- **502/503:** Service unavailable (deployment, scaling, crash)

## LogInsights Query Templates

```
# By swid (At Home)
fields @timestamp, @message | filter @message like /SWID_VALUE/ | sort @timestamp desc | limit 100

# By castawayId (Onboard)
fields @timestamp, @message | filter @message like /CASTAWAY_ID/ | sort @timestamp desc | limit 100

# By stateroom and time window (Onboard)
fields @timestamp, @message | filter @message like /STATEROOM/ | filter @timestamp > START_TIME | sort @timestamp desc

# By error status code for a service
fields @timestamp, @message | filter @message like /HTTP\/(4|5)\d{2}/ | filter @logGroup = '/SERVICE_NAME' | sort @timestamp desc
```
