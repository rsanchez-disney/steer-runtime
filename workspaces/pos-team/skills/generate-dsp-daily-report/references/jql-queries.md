# DSP Bug Report JQL Queries

## Base Filter (shared across all releases)

```jql
project = "Point of Sale"
  AND Team in (
    237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-4004,
    237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-4027,
    237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-4134,
    237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-3993,
    237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-4168,
    237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-4111,
    237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-4237,
    237631c2-1e5a-49c3-9ca1-70ce61a2d0ce-4326
  )
  AND issuetype = Bug
```

## Release Filters

| Release | Append to Base |
|---------|---------------|
| DSP 2.1.1 | `AND "Target Release" ~ "DSP 2.1.1"` |
| DSP 2.1.2 | `AND "Target Release" ~ "DSP 2.1.2"` |
| DSP 2.1.3 | `AND "Target Release" ~ "DSP 2.1.3"` |

## Specific Queries

### All bugs (for status summary)
```jql
{base} AND "Target Release" ~ "DSP 2.1.X"
```

### P1 Critical (open)
```jql
{base} AND "Target Release" ~ "DSP 2.1.X"
  AND priority = "1 - Critical"
  AND status not in (Closed, Done, Resolved)
```

### P2 High (open)
```jql
{base} AND "Target Release" ~ "DSP 2.1.X"
  AND priority = "2 - High"
  AND status not in (Closed, Done, Resolved)
```

### Release Blockers (open)
```jql
{base} AND "Target Release" ~ "DSP 2.1.X"
  AND "Customer Priority" = "Release Blocker"
  AND status not in (Closed, Done, Resolved)
```

### Updated in last 24h (for promotions)
```jql
{base} AND "Target Release" ~ "DSP 2.1.X"
  AND updated >= -1d
```

### Created in last 24h (new bugs)
```jql
{base} AND "Target Release" ~ "DSP 2.1.X"
  AND created >= -1d
```

### Stagnant (7+ days)
```jql
{base} AND "Target Release" ~ "DSP 2.1.X"
  AND updated <= -7d
  AND status not in (Closed, Done, Resolved)
```

### Blocked (3+ days)
```jql
{base} AND "Target Release" ~ "DSP 2.1.X"
  AND status = Blocked
  AND updated <= -3d
```

## Biweekly Cadence

- Anchor: May 27, 2026 (first biweekly Tuesday)
- Rule: `today is Tuesday AND (today - May 27, 2026) mod 14 == 0`

## Pagination

Always use `maxResults: 50` and increment `startAt` by 50 until all results retrieved. Never report partial counts.
