
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';


const server = new Server(
  {
    name: 'mermaid-diagram-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'generate_mermaid_image',
        description: 'Generate PNG image from Mermaid diagram content',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'Mermaid diagram content (use this OR inputPath)',
            },
            inputPath: {
              type: 'string',
              description: 'Path to existing .mmd file (use this OR content)',
            },
            outputPath: {
              type: 'string',
              description: 'Output file path for the generated image',
            },
            width: {
              type: 'number',
              description: 'Image width in pixels (default: 1600)',
              default: 1600,
            },
            height: {
              type: 'number',
              description: 'Image height in pixels (default: 1200)',
              default: 1200,
            },
            scale: {
              type: 'number',
              description: 'Scale factor for image quality (default: 2)',
              default: 2,
            },
          },
          required: ['outputPath'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'generate_mermaid_image') {
    const { content, inputPath, outputPath, width = 1600, height = 1200, scale = 2 } = request.params.arguments as any;

    try {
      if (!content && !inputPath) {
        throw new Error('Either content or inputPath must be provided');
      }
      if (content && inputPath) {
        throw new Error('Provide either content or inputPath, not both');
      }

      const mmdcPath = join(__dirname, '../node_modules/.bin/mmdc');
      
      let inputFile: string;
      let shouldCleanup = false;

      if (inputPath) {
        if (!existsSync(inputPath)) {
          throw new Error(`Input file not found: ${inputPath}`);
        }
        inputFile = inputPath;
      } else {
        inputFile = join(process.cwd(), 'temp.mmd');
        writeFileSync(inputFile, content);
        shouldCleanup = true;
      }

      const resolvedOutputPath = resolve(outputPath);
      const outputDir = dirname(resolvedOutputPath);
      
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      const command = `"${mmdcPath}" -i "${inputFile}" -o "${resolvedOutputPath}" -w ${width} -H ${height} -s ${scale}`;
      execSync(command, { stdio: 'pipe' });

      if (shouldCleanup) {
        execSync(`rm "${inputFile}"`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Successfully generated Mermaid diagram image at: ${resolvedOutputPath}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error generating Mermaid diagram: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
