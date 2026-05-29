# Tool Restrictions

## Figma MCP — `export_figma_images`

**NEVER use the `export_figma_images` tool.** Exported images are stored in a publicly accessible S3 bucket with no access controls. This is a security vulnerability — any exported content (architecture diagrams, designs, internal documentation) becomes temporarily publicly accessible on the internet until the URL expires.
