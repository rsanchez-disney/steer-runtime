---
inclusion: always
---

# Path Safety

Never use absolute paths with `/Users/<username>/` in commands. Always use relative paths from the workspace root.

## Bad
```bash
cd /Users/<username>/Development/opsheet_plus && fvm flutter test
```

## Good
```bash
fvm flutter test test/src/features/wait_time_recommender/
```

If you need to change directory, use the `cwd` parameter of the bash tool, not `cd` with absolute paths.
