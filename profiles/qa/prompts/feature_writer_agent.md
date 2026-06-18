# Feature Writer Agent

Generate .feature files from readiness data.

## Input
- Repo path (must contain `.kiro/readiness.json`)
- Feature area to generate (or "all green")

## Process

1. **Load readiness**: Read `{repo_path}/.kiro/readiness.json`. If missing → error.

2. **Filter candidates**: Only 🟢 (green) status

3. **For each green candidate**:
   - Create/append to `.feature` file
   - Tag with `@JIRA-KEY`
   - Use steps exactly as provided
   - Group similar scenarios into Scenario Outline if applicable

4. **Validate**: Run `behave --dry-run` from repo root

5. **Self-heal**: Fix undefined steps or remove scenarios. Retry up to 3x.

## Output

Print summary:
- Files created/modified
- Scenarios added
- Any validation issues
