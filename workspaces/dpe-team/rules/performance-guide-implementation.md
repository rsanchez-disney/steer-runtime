# Rule: Apply Performance Engineering Guide During Implementation

Whenever the user asks to implement, write, refactor, or add code, validate the work against the Performance Engineering Guide before producing output.

Guide location: find the file named `PERFORMANCE_ENGINEERING_GUIDE_AGNOSTIC.md` in the current workspace or any parent/sibling directory. If not found, ask the user to provide the path before proceeding.

## When This Rule Activates

- User asks to implement a new feature, service, method, or class
- User asks to refactor existing code
- User asks to "make this faster", "optimize", or "improve performance"
- User asks to add a repository, cache layer, or I/O operation
- User asks to add a controller, handler, or API endpoint

## Instructions

1. Before writing any code, check the implementation against these six dimensions:

   ### Concurrency
   - Are there multiple independent I/O calls? → parallelize them
   - Is there a collection of independent items to process? → use parallel processing
   - Is there a data dependency between steps? → keep sequential, add a comment explaining why
   - Are there cache writes? → make them async/fire-and-forget

   ### Async Behavior
   - Does the handler/controller do I/O? → offload to a worker executor, return a future
   - Are there async callbacks? → log with context at failure site, then re-throw (never swallow)
   - Are there multi-item writes to a remote store? → use batch/pipeline API

   ### Scale
   - Is there a repository call inside a loop? → replace with a batch method
   - Are keys collected before fetching? → two-phase: collect all keys first, then fetch once
   - Does the endpoint accept a collection? → enforce a configurable size limit
   - Do items have individual date/time ranges? → derive union range, fetch once, filter in memory
   - Does the primary source have partial coverage? → add explicit fallback with logging

   ### High-Performance Coding
   - Is there a `contains` check inside a loop or stream? → convert to HashSet first
   - Is there deduplication by a composite key? → use group-by + max/min, not sort
   - Are objects shared across concurrent tasks? → make them immutable, use builder pattern
   - Is work done unconditionally for all consumers? → gate on capability check
   - Is input validated deep in the pipeline? → move validation to the entry point
   - Are source objects mutated with derived values? → use a separate resolved-state object

   ### Observability
   - Is there an I/O call without a timer? → wrap in a timer with slow-operation thresholds
   - Does the handler log its total duration? → add start/end timing at the entry point
   - Do error handlers log full context + exception object? → ensure `e` is passed, not `e.message`
   - Are pipeline steps missing DEBUG entry/exit logs? → add them
   - Are diagnostic endpoints exposed? → ensure health, metrics, loggers are available
   - Does data have multiple possible sources? → attach a provenance/source identifier

   ### SQL Syntax & Query Quality
   - Is the SQL syntactically valid? → check balanced parentheses, keyword order, no trailing commas
   - Does a `SELECT` use `*`? → specify only the needed columns
   - Is a `WHERE` clause missing or filtering on non-indexed columns? → add indexed predicates
   - Are values concatenated into SQL strings? → use parameterized placeholders (`:param`)
   - Are `JOIN` conditions implicit (comma joins in `FROM`)? → use explicit `JOIN ... ON`
   - Do named parameters match the parameter map keys? → verify 1:1 correspondence
   - Is `ORDER BY` present without the caller needing order? → remove unnecessary sorts
   - Do `GROUP BY` columns match non-aggregated `SELECT` columns? → fix for strict SQL mode
   - Can the query return unbounded rows? → add `LIMIT` / pagination
   - Are SQL keywords used as unquoted aliases? → quote or rename them
   - Is `UNION` used where `UNION ALL` suffices? → prefer `UNION ALL` to skip dedup cost

2. If any violations are found, DO NOT apply changes automatically. Instead:
   - Present each suggestion with the violated rule, the reason, and a before/after code block
   - Group suggestions by dimension
   - Ask the user: "Would you like me to apply any or all of these suggestions? (all / none / list the ones you want)"
   - Wait for explicit confirmation. Only apply the changes the user accepts.
   - If the user declines all, proceed with the original implementation as-is.

3. Format each suggestion as:

```
## Performance Guide Suggestions

### <Dimension>
💡 **<Short title>** (<Dimension> §X.X)
<One sentence explaining the problem>

Before:
\`\`\`
<original code>
\`\`\`
After:
\`\`\`
<improved code>
\`\`\`
```

4. After all suggestions are listed, end with:
   > Would you like me to apply any or all of these suggestions? (all / none / list the ones you want)
