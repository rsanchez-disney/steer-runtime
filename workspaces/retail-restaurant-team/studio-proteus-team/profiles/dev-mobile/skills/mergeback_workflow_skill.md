---
name: mergeback-pr
description: Perform a mergeback PR that brings changes from a previous release branch into a newer one.
triggers:
  - mergeback
  - MB
  - merge back
---

# Mergeback PR Workflow

## Parameters
- **target_branch**: The newer branch receiving changes (e.g., "8.23")
- **source_branch**: The older branch with changes to merge (e.g., "8.22")

## Steps

1. **Confirm branches** — If you can't identify which exact branches match (e.g., `release/8.23_vxxx`), ask the user for confirmation. We normally have just one branch starting with `release/<version>_vxxx`.

2. **Fetch latest changes** on both branches:
   ```bash
   git fetch origin
   ```

3. **Checkout the target (base) branch**:
   ```bash
   git checkout release/<target>_vxxx
   ```

4. **Create a new branch** from the base branch using this naming convention:
   ```
   sandbox/<username>/<target_sanitized>/mb/from_<source_sanitized>
   ```
   Replace `.` with `_` in version numbers (e.g., `8.23` → `8_23`) since dots can be problematic in CI/CD.

   Example: `sandbox/<username>/8_23/mb/from_8_22`

5. **Perform the merge** (no fast-forward):
   ```bash
   git merge --no-ff release/<source>_vxxx
   ```

6. **Handle result**:
   - **If conflicts**: Stop and notify the user to resolve them manually.
   - **If no conflicts**: Push the branch and create a PR:
     - **Target**: `release/<target>_vxxx`
     - **Title**: `[MB] <target> <- <source>` (e.g., `[MB] 8.23 <- 8.22`)
     - **Assign** to the user for review.
