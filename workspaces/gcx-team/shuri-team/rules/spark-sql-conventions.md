# Spark SQL conventions for AEP Query Service

Rules for writing Spark SQL queries against Adobe Experience Platform datasets. The Shuri team interacts with SORs (GAM, Park Pass, etc.) and delivers data to AEP.

## Query formatting standards

- Write SQL keywords in **uppercase**: `SELECT`, `FROM`, `WHERE`, `JOIN`, `ON`, `GROUP BY`
- Indent nested clauses by 2 spaces
- Place each column on its own line in `SELECT` lists with more than 3 columns
- Use Common Table Expressions (CTEs) instead of nested subqueries
- Name CTEs descriptively — avoid generic names like `tmp` or `t1`
- Place the closing parenthesis of a CTE on its own line, aligned with `WITH` or the comma

```sql
WITH active_guests AS (
  SELECT
    swid,
    first_name,
    last_name,
    loyalty_tier
  FROM gam_guest_profile
  WHERE is_active = TRUE
),
recent_visits AS (
  SELECT
    swid,
    visit_date,
    park_id
  FROM park_pass_visits
  WHERE visit_date >= CURRENT_DATE - INTERVAL 90 DAYS
)
SELECT
  ag.swid,
  ag.loyalty_tier,
  COUNT(rv.visit_date) AS visit_count
FROM active_guests ag
INNER JOIN recent_visits rv
  ON ag.swid = rv.swid
GROUP BY ag.swid, ag.loyalty_tier
```

## Partition and filter strategies

- **Always** filter on the date partition column first in `WHERE` clauses
- Use explicit date ranges — never query without a partition filter
- Prefer `BETWEEN` or bounded comparisons over open-ended ranges
- Avoid full table scans; if no partition filter is possible, document why and get approval
- Use `_ACP_DATE` or the dataset-specific partition column as the primary filter

```sql
-- Correct: partition filter applied first
SELECT swid, event_type
FROM gam_guest_events
WHERE _ACP_DATE BETWEEN '2026-07-01' AND '2026-07-15'
  AND event_type = 'purchase'

-- Wrong: no partition filter — triggers full scan
SELECT swid, event_type
FROM gam_guest_events
WHERE event_type = 'purchase'
```

## Identity join patterns

- Join on the **resolved identity namespace**, not raw identifiers
- Use `identityMap` fields with explicit namespace filtering
- Always specify the namespace when extracting from identity arrays
- Prefer `ECID` for cross-device joins and `CRM_ID` for guest-level joins
- Flatten identity arrays before joining to avoid unexpected row multiplication

```sql
-- Extract identity from identityMap
WITH guest_ids AS (
  SELECT
    id_entry.id AS crm_id,
    _id AS event_id
  FROM gam_guest_events
  LATERAL VIEW EXPLODE(identityMap['CRM_ID']) AS id_entry
  WHERE id_entry.primary = TRUE
    AND _ACP_DATE >= '2026-07-01'
)
SELECT
  g.crm_id,
  p.loyalty_tier
FROM guest_ids g
INNER JOIN gam_guest_profile p
  ON g.crm_id = p.swid
```

## Common anti-patterns to avoid

- **No `SELECT *`** — always list explicit columns to control schema and cost
- **No cartesian joins** — every `JOIN` must have an `ON` clause; cross joins require a comment justifying the intent
- **No UDFs when built-ins exist** — use Spark built-in functions (`COALESCE`, `DATE_FORMAT`, `CONCAT`, `ARRAY_AGG`) before writing custom UDFs
- **Always `COALESCE` nullable fields** used in calculations, comparisons, or output columns
- **No implicit type casting** — use explicit `CAST()` to make type conversions visible
- **No `ORDER BY` without `LIMIT`** in subqueries or CTEs — sorting without bounds is expensive

```sql
-- Wrong: missing COALESCE on nullable field
SELECT swid, points_balance + bonus_points AS total_points
FROM gam_guest_profile

-- Correct: handle nullability
SELECT
  swid,
  COALESCE(points_balance, 0) + COALESCE(bonus_points, 0) AS total_points
FROM gam_guest_profile
```

## Performance requirements

- Run `EXPLAIN` on complex queries before committing — verify no full scans or skewed joins
- Use **broadcast joins** (`/*+ BROADCAST(table) */`) for small dimension tables under 100 MB
- Prefer `EXISTS` over `IN` for subquery filtering on large datasets
- Limit result sets during development with `LIMIT` — remove before production
- Avoid `DISTINCT` when `GROUP BY` achieves the same result with an aggregate
- Monitor query runtime; queries exceeding 30 minutes need review and optimization

```sql
-- Broadcast join for small dimension table
SELECT /*+ BROADCAST(dim_parks) */
  v.swid,
  v.visit_date,
  dp.park_name
FROM park_pass_visits v
INNER JOIN dim_parks dp
  ON v.park_id = dp.park_id
WHERE v._ACP_DATE >= '2026-07-01'
```
