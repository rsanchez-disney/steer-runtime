# Kiro Powers Integration

## Overview
Kiro Powers extend agent capabilities with custom tools. Powers are modular, reusable, and shareable.

## Using Powers

Add to agent configuration:
```json
{
  "name": "my-agent",
  "powers": ["example-power", "another-power"],
  "tools": ["read", "write"]
}
```

## Creating Powers

1. Create directory: `.kiro/powers/my-power/`
2. Define tools in `power.json`
3. Implement in `index.js`
4. Document in `README.md`

See `.kiro/powers/README.md` for details.

## Available Powers

- **example-power**: Demonstration power with echo tool

## Best Practices

- Keep powers focused on single domain
- Use async functions for all tool implementations
- Return structured objects with success/error states
- Document all parameters and return values
- Test powers independently before integration
