---
inclusion: manual
---

# Defect Resolution

## Workflow

### 1. Gather Context

- If the user provides a ticket ID (OPS-XXXX) and explicitly asks to fetch it, activate the **fetch-ticket-context** skill (from the dev-tools profile)
- If no ticket — work from the user's description; ask clarifying questions if the bug is ambiguous
- Identify the feature module: match ticket components or keywords to `lib/src/features/{feature_name}/`

### 2. Investigate

- Trace the defect across layers: `data/` → `model/` → `presentation/controllers/` → `presentation/pages|widgets/`. If running under an orchestrator with `context-gatherer` available, delegate the trace to it with the feature name and symptom description. Otherwise, use `readCode` and `grepSearch` to walk the layers manually.
- If the defect involves serialization or state, check codegen sync first (see Codegen Staleness below) before reading further into the code
- If the defect is environment-specific, check `defines/` configs before diving into Dart code (see Environment-Specific below)

### 3. Propose Fix

- Summarize the root cause hypothesis in 2-3 sentences
- List the files that need changes
- Wait for user confirmation before implementing

### 4. Implement

- Smallest diff possible — fix the defect, nothing else
- No drive-by refactors, no unrelated changes
- Do not add tests unless explicitly requested

### 5. Validate

- Run `getDiagnostics` on all changed files
- If any model or controller was changed, remind user to run: `fvm dart run build_runner build --delete-conflicting-outputs`
- Remind user to run `sh check.sh` before committing

### 6. Cleanup

- If a context file was created in step 1, delete `.kiro/context/{TICKET_ID}_context.md`
- If attachments were downloaded, remind user to clean up `.amazonq/external-data/attachments/{TICKET_ID}/`

## Diagnostic Patterns

Use these to shortcut investigation based on the symptom:

| Symptom                                    | Check First                                                                                              |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| JSON parsing / serialization error         | `.g.dart` in sync with model? Fields match API response?                                                 |
| State not updating in UI                   | Provider `watch` vs `read` usage. Check `.g.dart` matches controller source                              |
| Silent failure / no error logged           | `OpsApiClient.execute()` missing `currentRoute`. `onError` not called in repository                      |
| Works in one environment, fails in another | Compare `defines/*.json` configs. Check `main.dart` vs `main_automation.dart` entry points               |
| Null error on a field that should have data| Model field added but `.g.dart` not regenerated. Or API response shape changed                            |
| Error handling not triggering              | `BaseRepository.onError(currentPath:error:stack:)` — verify `currentPath` uses `$runtimeType.methodName` |

## Project-Specific Gotchas

### Codegen Staleness

- Models with `@JsonSerializable()` and controllers with `@riverpod` have generated `.g.dart` companions
- Before investigating serialization or state bugs, compare the source `.dart` against its `.g.dart` — if fields or method signatures don't match, the generated file is stale
- This is the most common false trail in this codebase

### Repository Error Handling

- All repositories extend `BaseRepository` mixin
- Required pattern: try-catch wrapping the API call, `onError` called with `currentPath: '$runtimeType.methodName'`
- `OpsApiClient.execute()` must receive `currentRoute` — omitting it causes silent routing failures with no error log

### Environment-Specific Behavior

- `defines/` contains per-environment JSON configs passed via `--dart-define-from-file` at build time
- `lib/main_automation.dart` uses mock interceptors — bugs in automation builds may not reproduce via `lib/main.dart`
- If the user says "only happens in prod/latest/automation", start with the config diff

### State Management

- Riverpod controllers use code generation — always check both `.dart` and `.g.dart`
- Common issue: provider being `read` where it should be `watched` (or vice versa)
- DI-related bugs: check `ProviderContainer` overrides in the bootstrapping files

## Fix Constraints

- Smallest diff — fix the defect, nothing else
- If the fix changes API response handling, verify the transformer still aligns with the model
- If the fix changes a model field, search for all consumers of that model across features with `grepSearch`
- Preserve backward compatibility unless the ticket explicitly calls for a breaking change
    