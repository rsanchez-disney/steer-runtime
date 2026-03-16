# Mermaid Diagram MCP

A Model Context Protocol (MCP) server for generating PNG images from Mermaid diagrams.

## Installation

1. Clone or download this repository
2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Usage with Q CLI

### Option 1: Add to existing agent
Add to your Q CLI agent configuration (e.g., `~/.aws/amazonq/cli-agents/your-agent.json`):

```json
{
  "mcpServers": {
    "mermaid-diagram": {
      "command": "node",
      "args": ["/path/to/mermaid-diagram-mcp/dist/index.js"],
      "cwd": "/path/to/mermaid-diagram-mcp"
    }
  },
  "tools": [
    "@mermaid-diagram/generate_mermaid_image"
  ],
  "allowedTools": [
    "@mermaid-diagram/generate_mermaid_image"
  ]
}
```

### Option 2: Add to global Q CLI configuration
Add to your global MCP configuration:

```json
{
  "mcpServers": {
    "mermaid-diagram": {
      "command": "node",
      "args": ["/path/to/mermaid-diagram-mcp/dist/index.js"]
    }
  }
}
```

## Tool: generate_mermaid_image

Generates a PNG image from Mermaid diagram content.

### Parameters:
- `content` (optional): Mermaid diagram content as string (use this OR inputPath)
- `inputPath` (optional): Path to existing .mmd file (use this OR content)
- `outputPath` (required): Path where the PNG image will be saved
- `width` (optional): Image width in pixels (default: 1600)
- `height` (optional): Image height in pixels (default: 1200)  
- `scale` (optional): Scale factor for image quality (default: 2)

### Examples:

**From content:**
```
Generate a flowchart image from this mermaid content:
```
graph TD
    A[Start] --> B[Process]
    B --> C[End]
```
Save it to ./diagram.png
```

**From existing file:**
```
Generate an image from the mermaid file at ./my-diagram.mmd and save it to ./output.png
```

## License

MIT
