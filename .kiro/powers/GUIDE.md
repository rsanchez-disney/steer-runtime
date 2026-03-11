# Kiro Powers Guide

Complete guide to using and creating Kiro Powers for development workflows.

## What are Kiro Powers?

Kiro Powers extend agent capabilities with custom tools. They're modular, reusable, and shareable across projects.

## Using Existing Powers

### 1. Enable Powers in Agent Configuration

Edit your agent's JSON configuration (e.g., `.kiro/agents/orchestrator.json`):

```json
{
  "name": "my-agent",
  "tools": ["read", "write"],
  "powers": ["git-ops", "code-analysis", "test-runner"]
}
```

### 2. Available Powers

#### git-ops
Git workflow operations

```javascript
// Get current status
git_status()
// Returns: { branch, ahead, changes, output }

// Show differences
git_diff({ file: "src/main.js", staged: false })
// Returns: { success, output }

// Recent commits
git_log({ limit: 10 })
// Returns: { success, commits, output }
```

#### code-analysis
Code search and metrics

```javascript
// Find files by pattern
find_files({ pattern: "*.java", path: "src" })
// Returns: { success, count, files, output }

// Search code
search_code({ query: "TODO", path: ".", file_type: "js" })
// Returns: { success, count, matches, output }

// Count lines
count_lines({ path: "src" })
// Returns: { success, output }
```

#### file-ops
Advanced file operations

```javascript
// Backup file with timestamp
backup_file({ file: "config.json" })
// Returns: { success, backup_path, output }

// Compare files
compare_files({ file1: "old.txt", file2: "new.txt" })
// Returns: { success, identical, output }

// Find duplicates
find_duplicates({ path: ".", pattern: "*.jpg" })
// Returns: { success, count, duplicates, output }
```

#### test-runner
Test execution and discovery

```javascript
// Run tests
run_tests({ command: "npm test", path: "." })
// Returns: { success, output, command }

// Find test files
find_tests({ path: ".", framework: "jest" })
// Returns: { success, count, files, output }

// Coverage analysis
test_coverage({ command: "npm run coverage" })
// Returns: { success, output, command }
```

### 3. Testing Powers

Test all powers:
```bash
node .kiro/test-powers.js
```

Test specific power:
```bash
node -e "
const PowerLoader = require('./.kiro/powers/loader');
const loader = new PowerLoader('./.kiro/powers');
loader.loadAll();
const tools = loader.getTools(['git-ops']);
tools[0].handler({}).then(console.log);
"
```

## Creating New Powers

### Step 1: Create Directory Structure

```bash
mkdir -p .kiro/powers/my-power
```

### Step 2: Define Tools (power.json)

```json
{
  "name": "my-power",
  "version": "1.0.0",
  "description": "What this power does",
  "tools": [
    {
      "name": "my_tool",
      "description": "Tool description for agents",
      "parameters": {
        "type": "object",
        "properties": {
          "input": {
            "type": "string",
            "description": "Input parameter description"
          },
          "optional_param": {
            "type": "number",
            "description": "Optional parameter",
            "default": 10
          }
        },
        "required": ["input"]
      }
    }
  ]
}
```

### Step 3: Implement Tools (index.js)

```javascript
const { execSync } = require('child_process');
const fs = require('fs');

module.exports = {
  // Function name must match tool name in power.json
  async my_tool({ input, optional_param = 10 }) {
    try {
      // Your implementation here
      const result = doSomething(input, optional_param);
      
      return {
        success: true,
        output: result,
        // Add any additional data
        metadata: { processed: true }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  async another_tool({ param }) {
    // Another tool implementation
    return { success: true, data: param };
  }
};
```

### Step 4: Document (README.md)

```markdown
# My Power

Brief description of what this power does.

## Tools

### my_tool
Description of what the tool does.

**Parameters:**
- `input` (string, required): What this parameter does
- `optional_param` (number, optional): What this does (default: 10)

**Returns:**
\`\`\`json
{
  "success": true,
  "output": "result",
  "metadata": {}
}
\`\`\`

**Example:**
\`\`\`javascript
my_tool({ input: "test", optional_param: 20 })
\`\`\`
```

### Step 5: Test Your Power

```javascript
// test-my-power.js
const PowerLoader = require('./.kiro/powers/loader');

async function test() {
  const loader = new PowerLoader('./.kiro/powers');
  loader.loadPower('my-power');
  
  const tools = loader.getTools(['my-power']);
  const myTool = tools.find(t => t.name === 'my_tool');
  
  const result = await myTool.handler({ input: 'test' });
  console.log('Result:', result);
}

test().catch(console.error);
```

## Best Practices

### Tool Design
- **Single responsibility**: Each tool does one thing well
- **Async functions**: Always use `async` even if not awaiting
- **Structured returns**: Return objects with `success` and `output`
- **Error handling**: Catch errors and return `{ success: false, error }`

### Parameters
- **Clear descriptions**: Help agents understand what parameters do
- **Sensible defaults**: Provide defaults for optional parameters
- **Type validation**: Use JSON Schema types correctly
- **Required vs optional**: Mark required parameters explicitly

### Implementation
- **Minimal dependencies**: Use Node.js built-ins when possible
- **Safe execution**: Validate inputs before executing commands
- **Buffer limits**: Set `maxBuffer` for commands with large output
- **Timeout handling**: Consider timeouts for long-running operations

### Documentation
- **Clear examples**: Show actual usage with expected output
- **Parameter docs**: Document every parameter and return value
- **Use cases**: Explain when to use this power
- **Limitations**: Document any constraints or requirements

## Example: Database Query Power

```bash
mkdir -p .kiro/powers/db-query
```

**power.json:**
```json
{
  "name": "db-query",
  "version": "1.0.0",
  "description": "Database query utilities",
  "tools": [
    {
      "name": "query_db",
      "description": "Execute SQL query",
      "parameters": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "SQL query to execute"
          },
          "database": {
            "type": "string",
            "description": "Database name",
            "default": "default"
          }
        },
        "required": ["query"]
      }
    }
  ]
}
```

**index.js:**
```javascript
const { execSync } = require('child_process');

module.exports = {
  async query_db({ query, database = 'default' }) {
    try {
      // Example using sqlite3 CLI
      const cmd = `sqlite3 ${database}.db "${query}"`;
      const output = execSync(cmd, { encoding: 'utf8' });
      
      return {
        success: true,
        rows: output.split('\n').filter(l => l),
        output
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};
```

## Troubleshooting

### Power not loading
- Check `power.json` is valid JSON
- Verify tool names match exported functions
- Ensure `index.js` exports an object with async functions

### Tool not working
- Test function directly in Node.js REPL
- Check parameter types match schema
- Verify required dependencies are available
- Add console.log for debugging

### Integration issues
- Confirm power is listed in agent's `powers` array
- Check PowerLoader is initialized with correct path
- Verify agent has access to power directory

## Advanced Topics

### Stateful Powers
Powers can maintain state across calls:

```javascript
const state = new Map();

module.exports = {
  async set_value({ key, value }) {
    state.set(key, value);
    return { success: true };
  },
  
  async get_value({ key }) {
    return { success: true, value: state.get(key) };
  }
};
```

### External Dependencies
Install npm packages in power directory:

```bash
cd .kiro/powers/my-power
npm init -y
npm install axios
```

```javascript
const axios = require('axios');

module.exports = {
  async fetch_data({ url }) {
    const response = await axios.get(url);
    return { success: true, data: response.data };
  }
};
```

### Composing Powers
Powers can use other powers:

```javascript
const PowerLoader = require('../loader');
const loader = new PowerLoader(__dirname + '/..');
loader.loadAll();

module.exports = {
  async complex_operation({ input }) {
    const gitTools = loader.getTools(['git-ops']);
    const status = await gitTools[0].handler({});
    
    // Use status in your logic
    return { success: true, branch: status.branch };
  }
};
```

## Resources

- **Power Loader**: `.kiro/powers/loader.js`
- **Test Script**: `.kiro/test-powers.js`
- **Examples**: `.kiro/powers/*/`
- **Agent Config**: `.kiro/agents/*.json`

## Quick Reference

```bash
# Create new power
mkdir -p .kiro/powers/my-power
touch .kiro/powers/my-power/{power.json,index.js,README.md}

# Test power
node .kiro/test-powers.js

# Enable in agent
# Edit .kiro/agents/my-agent.json
# Add "powers": ["my-power"]

# List all powers
ls .kiro/powers/

# Check power definition
cat .kiro/powers/my-power/power.json
```
