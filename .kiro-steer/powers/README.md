# Kiro Powers

Custom tools to extend Kiro agent capabilities.

## Available Powers

### git-ops
Git operations for development workflows
- `git_status` - Current branch, changes, uncommitted files
- `git_diff` - Show file differences
- `git_log` - Recent commit history

### code-analysis
Code search and analysis utilities
- `find_files` - Find files by pattern
- `search_code` - Search text/regex in code
- `count_lines` - Count lines of code

### file-ops
Advanced file operations
- `backup_file` - Create timestamped backups
- `compare_files` - Diff two files
- `find_duplicates` - Find duplicate files by hash

### test-runner
Test execution and discovery
- `run_tests` - Execute test commands
- `find_tests` - Locate test files
- `test_coverage` - Run coverage analysis

## Usage

Add to agent configuration:
```json
{
  "powers": ["git-ops", "code-analysis"]
}
```

## Creating New Powers

1. Create directory: `.kiro/powers/my-power/`
2. Add `power.json` with tool definitions
3. Implement in `index.js` with async functions
4. Export functions matching tool names

Example:
```javascript
module.exports = {
  async my_tool({ param }) {
    return { success: true, output: result };
  }
};
```
