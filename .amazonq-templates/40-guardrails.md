# Guardrails

## Blocked Write Paths
NEVER create or modify files in these directories:
- `node_modules/` — managed by package manager
- `dist/` — build output
- `.git/` — git internals
- `build/` — build output
- `target/` — Maven/Gradle output
- `vendor/` — Go vendor directory (if vendored)

If asked to modify files in these paths, refuse and explain why.

## Destructive Command Warnings
Before executing any of these patterns, STOP and confirm with the user:
- `rm -rf` — recursive force delete
- `DROP TABLE` / `DELETE FROM` — database destructive operations
- `--force` / `force push` — force operations that overwrite history
- `git reset --hard` — discards uncommitted changes
- `git clean -fd` — removes untracked files

## File Write Scope
When implementing changes, only modify files relevant to the current task:
- Backend agents: `src/**`, `pom.xml`, `build.gradle*`, `*.java`, `*.go`, `*.rs`, `*.py`
- WebAPI agents: `src/**`, `package.json`, `tsconfig*.json`, `jest.config*`
- UI agents: `src/**`, `projects/**`, `package.json`, `angular.json`
- Flutter agents: `lib/**`, `test/**`, `pubspec.yaml`

Do not modify unrelated files, reformat entire files, or add unused dependencies.
