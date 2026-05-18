# Lessons Learned

Curated, actionable engineering lessons discovered across OpSheet+ Go projects. Max 20 entries — no generic advice, no business-specific details.

---

### Inject configuration into clients, never read env vars directly
Clients receive config (URLs, keys, etc.) as constructor parameters. Only `internal/app/` reads environment variables and injects them. This keeps clients testable and pure.

### Use partial JSON deserialization for event source detection
When a single handler supports multiple event types, deserialize partially with "probe" structs to inspect discriminator fields. Avoid attempting full deserialization into each candidate type and checking errors.

### Separate helper functions into their own file
Place utility functions and internal structs in a dedicated `_helpers.go` file. This keeps the main file focused on business logic and improves navigability.

### Default to safe values when parsing untrusted attributes
When reading attributes from external messages (e.g., SQS `ApproximateReceiveCount`), default to a safe value (like 1) if the attribute is missing or invalid.

### Fail fast on first error with Kinesis ReportBatchItemFailures
Kinesis retries from the lowest failed sequence number, re-delivering all records after it. If you keep processing after a failure, already-processed records get retried and cause duplicate side effects. Stop on the first error and return only that record.

### Chunk Kinesis PutRecords calls at 500 records
The Kinesis `PutRecords` API has a hard limit of 500 records per call. Always chunk your records slice before calling it.

### Use SequenceNumber, not EventID, in Kinesis BatchItemFailures
AWS uses `ItemIdentifier` in `BatchItemFailures` as the shard checkpoint. It must be `rec.Kinesis.SequenceNumber`, not `rec.EventID`. Using EventID breaks retry positioning.

### Always use time.Now().UTC() in Lambda and server-side Go code
`time.Now()` returns the system timezone, which is UTC in Lambda but may differ locally. Always call `.UTC()` explicitly to avoid off-by-one day issues at timezone boundaries.

### Push branch before running gh pr create
`gh pr create` prompts interactively if the branch doesn't exist on the remote. Always `git push` first to avoid the CLI hanging in non-interactive contexts.

### Add generated artifacts to .gitignore immediately
Files like `coverage.out` and build artifacts should be gitignored from the start. Cleaning them up later requires `git rm --cached` and a separate commit that pollutes the PR diff.

### Never mock what you don't own — wrap behind interfaces first
External dependencies (HTTP clients, DB drivers) should be wrapped behind an interface you control. Mock your interface, not the third-party library directly.

### Circuit breaker closures must use pointer-result pattern
When using `CircuitBreakerManager.ExecuteWithRetry`, the closure must write to a `*result` pointer declared outside. Returning values from the closure directly loses them when the CB wraps the call.
