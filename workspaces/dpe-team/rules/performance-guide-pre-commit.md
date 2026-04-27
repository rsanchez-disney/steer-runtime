# Rule: Pre-Commit Performance Guide Check

Whenever the user asks to "check before committing", "review my changes", "pre-commit check", or "is this ready to commit", run a structured audit of the staged/unstaged diff against the Performance Engineering Guide.

Guide location: find the file named `performance_engineering_guide.md` in the current workspace or any parent/sibling directory. If not found, ask the user to provide the path before proceeding.

## Instructions

1. Run `git diff HEAD` to get all uncommitted changes (staged + unstaged).
   If the user specifies staged only, run `git diff --cached`.

2. For each changed file, audit the diff against the checklist below.

3. Report findings grouped by dimension. For each finding:
   - State the file and approximate line
   - State which rule is violated
   - Show a before/after code block with the proposed fix

4. At the end, give a PASS / NEEDS ATTENTION verdict.
   - **PASS**: no violations found — safe to commit
   - **NEEDS ATTENTION**: list the violations with proposed fixes

5. After presenting findings, ask: "Would you like me to apply any or all of these fixes? (all / none / list the ones you want)"
   - Wait for explicit confirmation before touching any file.
   - Apply only the fixes the user accepts.
   - If the user declines all, do not modify any file.

## Audit Checklist

### Concurrency
- [ ] No repository/service call inside a sequential loop where a batch call exists
- [ ] Independent I/O calls are parallelized (not sequential)
- [ ] Cache writes are non-blocking (fire-and-forget)
- [ ] Sequential loops with data dependencies have a comment explaining why

### Async
- [ ] Handlers/controllers that do I/O return a future and use an executor
- [ ] Async error callbacks log with full context and re-throw (do not return defaults)
- [ ] Multi-item remote writes use batch/pipeline API

### Scale
- [ ] No N+1 patterns (repository call inside a loop)
- [ ] Endpoints accepting collections enforce a configurable size limit
- [ ] Batch fetches use union date ranges, not per-item ranges
- [ ] Fallback routing is explicit and logged

### High-Performance Coding
- [ ] No `list.contains()` inside a loop or stream filter (use HashSet)
- [ ] Deduplication uses group-by + max/min (not sort-then-first)
- [ ] Objects shared across threads are immutable
- [ ] Work gated on capability checks where only some consumers need it
- [ ] Input validation at the entry point, not deep in the pipeline
- [ ] Source objects not mutated with derived values

### Observability
- [ ] Every new I/O call is wrapped in a timer
- [ ] New handlers log total request duration
- [ ] Error handlers log full context including the exception object (not just message)
- [ ] New pipeline steps have DEBUG entry/exit logs with counts
- [ ] Data with multiple sources carries a provenance identifier

### SQL Syntax & Query Quality
- [ ] All SQL strings are syntactically valid (balanced parentheses, correct keyword order, no trailing commas)
- [ ] `SELECT` queries specify only needed columns — no `SELECT *` in production code
- [ ] `WHERE` clauses use indexed columns; no unfiltered full-table scans
- [ ] `IN` clauses use parameterized placeholders (`:param`) — no string concatenation of values
- [ ] `JOIN` conditions are explicit (`ON a.id = b.id`) — no implicit joins via `WHERE`
- [ ] Named parameters match the keys in the `MapSqlParameterSource` / parameter map
- [ ] `ORDER BY` is present only when the caller actually needs ordering (unnecessary sorts are expensive)
- [ ] `GROUP BY` columns match the non-aggregated `SELECT` columns (SQL mode strict compliance)
- [ ] `LIMIT` / pagination is applied for queries that could return unbounded result sets
- [ ] No SQL keywords used as unquoted column/table aliases
- [ ] String literals are properly quoted and escaped
- [ ] `UNION` vs `UNION ALL` is intentional — prefer `UNION ALL` unless dedup is required

## Output Format

```
## Pre-Commit Performance Check

### Concurrency
✅ No issues

### Scale
⚠️  `src/service/ProductService.java` ~line 87
    Rule: N+1 query — repository call inside a loop (Scale §3.1)

    Before:
    for id in ids:
        result = repository.find_one(id)

    After:
    results = repository.find_batch(ids, criteria)

### Observability
⚠️  `src/dao/RateAdapter.java` ~line 134
    Rule: I/O call without a timer (Observability §5.1)

    Before:
    var rates = namedJdbcTemplate.query(sql, params, rowMapper);

    After:
    try (var timer = operationMetrics.startTimer("rate-batch-load")) {
        var rates = namedJdbcTemplate.query(sql, params, rowMapper);
        timer.recordSuccess(rates.size(), productCodes.size());
    }

### SQL Syntax & Query Quality
⚠️  `src/dao/RateRepositoryAdapter.java` ~line 95
    Rule: SELECT * in production query (SQL §6.2)

    Before:
    String sql = "SELECT * FROM rate WHERE product_code IN (:codes)";

    After:
    String sql = "SELECT product_code, rate_value, effective_date FROM rate WHERE product_code IN (:codes)";

⚠️  `src/dao/DiscountRepository.java` ~line 42
    Rule: Unbounded result set without LIMIT (SQL §6.9)

    Before:
    String sql = "SELECT id, name FROM discount WHERE active = 1";

    After:
    String sql = "SELECT id, name FROM discount WHERE active = 1 LIMIT :maxResults";

---
Verdict: NEEDS ATTENTION — 4 violations found

Would you like me to apply any or all of these fixes? (all / none / list the ones you want)
```
