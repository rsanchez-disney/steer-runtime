# Kiro Powers

Extend Kiro agents with custom tools and capabilities.

## Structure

Each power lives in its own directory:
```
powers/
  my-power/
    power.json       # Power definition
    index.js         # Implementation
    README.md        # Documentation
```

## Power Definition (power.json)

```json
{
  "name": "my-power",
  "version": "1.0.0",
  "description": "What this power does",
  "tools": [
    {
      "name": "my_tool",
      "description": "Tool description",
      "parameters": {
        "type": "object",
        "properties": {
          "input": {"type": "string"}
        },
        "required": ["input"]
      }
    }
  ]
}
```

## Implementation (index.js)

```javascript
module.exports = {
  async my_tool({ input }) {
    // Tool implementation
    return { result: input };
  }
};
```

## Usage

Add to agent configuration:
```json
{
  "powers": ["my-power"]
}
```
