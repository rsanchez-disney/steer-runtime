# Nice-to-have: orchestration, harness, context — follow-up items

**Date**: 2026-05-09
**Prerequisite**: feat/orchestration-harness-context merged in all 3 repos
**Estimated effort**: 5 items, ~21 story points

---

## 1. RAG quality evaluation command

**Repo**: Koda
**Points**: 5
**Epic**: E13 follow-up

### Problem

`BuildContextIndex` and `QueryContextIndex` are implemented but there's no way to validate retrieval quality. Need a `koda eval context-retrieval` command that runs predefined queries and reports precision/recall.

### Design

```go
// internal/cli/eval.go
// koda eval context-retrieval
// Runs 10 queries with expected file matches, reports precision/recall
```

Test cases (hardcoded):

| Query                                    | Expected top file          |
|------------------------------------------|----------------------------|
| "estimate story points sizing"           | ccv-estimation.md          |
| "token cost drift budget"                | drift-estimation.md        |
| "splunk index query SPL"                 | splunk_indexes.md          |
| "servicenow incident INC"               | servicenow_reference.md    |
| "REST API pagination cursor"            | api_standards.md           |
| "golden rules backward compatible"      | golden_rules.md            |
| "email send recipients HTML"            | email_guidelines.md        |
| "Harness SonarQube AWS region"          | ops_guidelines.md          |
| "GLX Galaxy commerce platform"          | domain_glossary.md         |
| "ECS container Datadog monitoring"      | enterprise_architecture.md |

Pass criteria: avg precision ≥0.7 (top result matches expected file in ≥7/10 queries).

### Files to create

| File                      | Action |
|---------------------------|--------|
| `internal/cli/eval.go`   | Create |

---

## 2. KiteStream WebSocket permission forwarding

**Repo**: Koda
**Points**: 5
**Epic**: E3 follow-up

### Problem

When trust level is `supervised`, the ACP client emits `PermissionEvent` on `PermissionCh`. In the team TUI, this is handled by the orchestrator loop. But in KiteStream (web UI), permission events need to be forwarded over WebSocket so the browser can show approve/deny buttons.

### Design

```go
// In kitestream/bridge.go:
// When creating ACP session with trust=supervised, spawn a goroutine that:
// 1. Reads from client.PermissionCh
// 2. Sends WebSocket message: {"type":"permission","toolName":"fs_write","id":"..."}
// 3. Waits for WebSocket response: {"type":"permission_response","id":"...","decision":"allow_once"}
// 4. Calls client.RespondPermission(id, decision)
```

### Files to modify

| File                                | Change                                      |
|-------------------------------------|---------------------------------------------|
| `internal/kitestream/bridge.go`    | Forward PermissionCh to WebSocket           |
| `internal/kitestream/handlers.go`  | Handle permission_response from client      |

---

## 3. Planner prompt: retry config generation

**Repo**: Koda
**Points**: 3
**Epic**: E9 follow-up

### Problem

The team planner generates `WorkerSpec` JSON but doesn't know about `maxRetries`, `retryDelay`, or `onFailure`. It should assign retry configs for risky tasks.

### Design

Add to the plan prompt in `internal/team/planner.go`:

```text
For each worker, optionally set retry behavior:
- "maxRetries": 1-2 for network-dependent tasks (API calls, MCP tools)
- "retryDelay": "5s" for transient failures
- "onFailure": "skip" for non-critical tasks, "abort" for critical path
Default (if omitted): maxRetries=0, onFailure="abort"
```

### Files to modify

| File                          | Change                          |
|-------------------------------|---------------------------------|
| `internal/team/planner.go`   | Update plan prompt              |

---

## 4. E7 orchestrator validation test suite

**Repo**: steer-runtime
**Points**: 5
**Epic**: E7 follow-up

### Problem

12 orchestrators were decomposed. Need to validate that delegation accuracy is preserved — each orchestrator correctly routes representative tasks to the right agents.

### Design

Create a validation script that sends test prompts to each orchestrator and checks the delegation target:

```bash
# tests/validate-orchestrators.sh
# For each orchestrator, send 3 test prompts via kiro-cli and verify
# the subagent call targets the expected agent.
```

Test matrix (36 tests total):

| Orchestrator | Test 1 | Test 2 | Test 3 |
|---|---|---|---|
| dev-core | "implement DPAY-123" → story_analyzer | "review this code" → code_review | "create PR" → pr_creator |
| qa | "create test plan" → test_planner | "run API tests" → api_tester | "analyze this bug" → defect_analyst |
| ops | "check INC123456" → log_analyzer | "deploy status" → deployment | "release notes" → release_manager |
| ... | ... | ... | ... |

### Files to create

| File                                    | Action |
|-----------------------------------------|--------|
| `tests/validate-orchestrators.sh`       | Create |
| `tests/orchestrator-test-matrix.json`   | Create |

---

## 5. Token tracking from kiro-cli output

**Repo**: steer-autopilot
**Points**: 3
**Epic**: E6 follow-up

### Problem

`broker.Dispatch` spawns kiro-cli but doesn't parse token usage from its output. `DispatchResult.TokenUsage` is always 0. The metrics dashboard shows no real token data.

### Design

After kiro-cli exits, scan stdout for `_kiro.dev/metadata` JSON lines:

```go
// In broker.go Dispatch(), after cmd.Run():
scanner := bufio.NewScanner(bytes.NewReader(stdout.Bytes()))
for scanner.Scan() {
    var meta struct {
        Method string `json:"method"`
        Params struct {
            ContextUsagePercentage float64 `json:"contextUsagePercentage"`
        } `json:"params"`
    }
    if json.Unmarshal(scanner.Bytes(), &meta) == nil && meta.Method == "_kiro.dev/metadata" {
        result.TokenUsage = int(meta.Params.ContextUsagePercentage * 200000)
    }
}
```

### Files to modify

| File                            | Change                              |
|---------------------------------|-------------------------------------|
| `internal/broker/broker.go`    | Parse stdout for metadata lines     |

---

## Priority order

| # | Item                              | Points | Blocking? | Depends on |
|---|-----------------------------------|:------:|:---------:|:----------:|
| 1 | Token tracking (autopilot)        |   3    |    No     |    —       |
| 2 | Planner retry prompt              |   3    |    No     |    —       |
| 3 | RAG eval command                  |   5    |    No     |    —       |
| 4 | KiteStream permission forwarding  |   5    |    No     |    —       |
| 5 | Orchestrator validation suite     |   5    |    No     |    —       |

All items are independent — can be done in any order or in parallel.
