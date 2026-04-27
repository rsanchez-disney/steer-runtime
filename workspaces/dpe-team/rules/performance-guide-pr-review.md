# Rule: PR / Branch Performance Guide Review

Whenever the user asks to "review this PR", "review this branch", "check their changes", or "review someone else's code", run a structured review against the Performance Engineering Guide.

Guide location: find the file named `performance_engineering_guide.md` in the current workspace or any parent/sibling directory. If not found, ask the user to provide the path before proceeding.

## Instructions

1. Determine the diff to review:
   - If a branch name is given: `git diff main..<branch>` (or `develop` if that is the base)
   - If a commit range is given: `git diff <base>..<head>`
   - If files are provided directly: review those files in full

2. Read the diff. For each changed file, evaluate it against all six dimensions of the guide (Concurrency, Async, Scale, High-Performance Coding, Observability, SQL Syntax & Query Quality).

3. Classify each finding by severity:
   - 🔴 **Must Fix** — correctness risk (race condition, silent failure, data loss) or severe scale risk (N+1 in a hot path)
   - 🟡 **Should Fix** — performance or observability gap that will cause problems under load or during incidents
   - 🔵 **Consider** — improvement that is not urgent but aligns with the guide

4. For each finding, provide:
   - File + approximate line
   - Severity
   - Which guide rule is violated
   - A before/after code block showing the proposed fix

5. Also call out what the PR does **well** relative to the guide (positive reinforcement, max 3 items).

6. End with a summary verdict:
   - ✅ **Approve** — no must-fix or should-fix items
   - 🟡 **Approve with comments** — only consider items
   - 🔴 **Request changes** — one or more must-fix or should-fix items

7. After presenting all findings, ask: "Would you like me to apply any of these suggested fixes to the local files? (all / none / list the ones you want)"
   - Wait for explicit confirmation before modifying any file.
   - Apply only the fixes the user accepts.
   - If the user declines, do not modify any file.

## Output Format

```
## Performance Guide Review — <branch or PR title>

### What's done well
- Parallel fetch pattern correctly applied for independent I/O in `AssemblyService`
- Immutable builder pattern used consistently on new value objects

---

### Findings

#### 🔴 Must Fix

**`src/dao/RateRepository.java` ~line 112**
Rule: N+1 query — repository call inside a loop (Scale §3.1)
The loop calls `findOne(productCode)` for each product. Under a 10-product request this is 10 sequential DB round-trips.

Before:
for (String code : productCodes) {
    Rate rate = rateRepository.findOne(code);
}

After:
Map<String, Rate> ratesByProduct = rateRepository.findBatch(productCodes, criteria);
products.forEach(p -> process(p, ratesByProduct.get(p.getCode())));

---

#### 🟡 Should Fix

**`src/service/PricingService.java` ~line 78**
Rule: I/O call without a timer (Observability §5.1)
The `discountRepository.getDiscounts(...)` call has no timing wrapper. Slow discount fetches will be invisible in logs.

Before:
var discounts = discountRepository.getDiscounts(criteria);

After:
try (var timer = operationMetrics.startTimer("discount-fetch")) {
    var discounts = discountRepository.getDiscounts(criteria);
    timer.recordSuccess(discounts.size(), groupCodes.size());
    return discounts;
}

---

#### 🔵 Consider

**`src/handler/ProductHandler.java` ~line 34**
Rule: Handler does I/O on the request thread (Async §2.1)
The handler calls the service synchronously. Not urgent if the thread pool is large, but worth offloading for consistency.

---

#### 🟡 Should Fix

**`src/dao/RateRepositoryAdapter.java` ~line 95**
Rule: SELECT * in production query (SQL §6.2)
Using `SELECT *` fetches all columns including BLOBs and unused fields, increasing I/O and memory pressure.

Before:
String sql = "SELECT * FROM rate WHERE product_code IN (:codes)";

After:
String sql = "SELECT product_code, rate_value, effective_date FROM rate WHERE product_code IN (:codes)";

---

### Verdict
🔴 Request changes — 1 must-fix, 2 should-fix

---
Would you like me to apply any of these suggested fixes to the local files? (all / none / list the ones you want)
```

## Tone

- Be direct and specific. No vague feedback like "consider improving performance".
- Every finding must have a concrete before/after fix.
- Positive items are genuine, not filler.
- Do not repeat the entire guide — reference section numbers only.
