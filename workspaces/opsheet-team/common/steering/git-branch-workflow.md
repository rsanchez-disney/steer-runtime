# Git Branch Workflow

Before making any changes to the codebase (fixes, features, refactors):

1. Sync the main branch: `git checkout main && git pull`
2. Create an appropriate feature branch following the naming convention for the specific repo. If not found on steering files ask the user for confirmation.
   - `fix/OPS-XXXXX` for bugfixes
   - `feat/OPS-XXXXX` for new features
   - `refactor/OPS-XXXXX` for refactors
   - `test/OPS-XXXXX` for test-only changes
3. Only then proceed with code changes

Do NOT make changes directly on the main branch.
