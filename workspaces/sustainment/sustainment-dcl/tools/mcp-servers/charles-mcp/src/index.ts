import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import http from "http";

const CHARLES_HOST = process.env.CHARLES_HOST || "127.0.0.1";
const CHARLES_PORT = parseInt(process.env.CHARLES_PORT || "8888", 10);

// --- Charles API Client ---

function charlesRequest(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options: http.RequestOptions = {
      host: CHARLES_HOST,
      port: CHARLES_PORT,
      path: path,
      method: "GET",
      headers: {
        Host: "control.charles",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    });

    req.on("error", (err) => reject(err));
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error("Request to Charles timed out"));
    });
    req.end();
  });
}

function parseStatus(html: string): string {
  const match = html.match(/<p>Status:\s*(.*?)<\/p>/i);
  return match ? match[1].trim() : "Unknown";
}

// --- Tool Definitions ---

const tools = [
  {
    name: "charles_recording_start",
    description: "Start recording traffic in Charles Proxy",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "charles_recording_stop",
    description: "Stop recording traffic in Charles Proxy",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "charles_recording_status",
    description: "Get the current recording status from Charles Proxy",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "charles_throttling_activate",
    description:
      "Activate throttling in Charles Proxy with an optional preset",
    inputSchema: {
      type: "object" as const,
      properties: {
        preset: {
          type: "string",
          description:
            'Throttling preset name. Options: "56 kbps Modem", "256 kbps ISDN/DSL", "512 kbps ISDN/DSL", "2 Mbps ADSL", "8 Mbps ADSL2", "16 Mbps ADSL2+", "32 Mbps VDSL", "32 Mbps Fibre", "100 Mbps Fibre", "3G", "4G". Leave empty for last used preset.',
        },
      },
    },
  },
  {
    name: "charles_throttling_deactivate",
    description: "Deactivate throttling in Charles Proxy",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "charles_throttling_status",
    description: "Get the current throttling status from Charles Proxy",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "charles_tool_enable",
    description:
      "Enable a Charles Proxy tool (breakpoints, no-caching, block-cookies, map-remote, map-local, rewrite, black-list, white-list, dns-spoofing, auto-save, client-process)",
    inputSchema: {
      type: "object" as const,
      properties: {
        tool: {
          type: "string",
          description:
            "Tool name: breakpoints, no-caching, block-cookies, map-remote, map-local, rewrite, black-list, white-list, dns-spoofing, auto-save, client-process",
        },
      },
      required: ["tool"],
    },
  },
  {
    name: "charles_tool_disable",
    description:
      "Disable a Charles Proxy tool (breakpoints, no-caching, block-cookies, map-remote, map-local, rewrite, black-list, white-list, dns-spoofing, auto-save, client-process)",
    inputSchema: {
      type: "object" as const,
      properties: {
        tool: {
          type: "string",
          description:
            "Tool name: breakpoints, no-caching, block-cookies, map-remote, map-local, rewrite, black-list, white-list, dns-spoofing, auto-save, client-process",
        },
      },
      required: ["tool"],
    },
  },
  {
    name: "charles_tool_status",
    description: "Get the status of a Charles Proxy tool",
    inputSchema: {
      type: "object" as const,
      properties: {
        tool: {
          type: "string",
          description:
            "Tool name: breakpoints, no-caching, block-cookies, map-remote, map-local, rewrite, black-list, white-list, dns-spoofing, auto-save, client-process",
        },
      },
      required: ["tool"],
    },
  },
  {
    name: "charles_session_clear",
    description: "Clear the current Charles Proxy session (all recorded data)",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "charles_status",
    description:
      "Get a summary of Charles Proxy status: recording, throttling, and key tools",
    inputSchema: { type: "object" as const, properties: {} },
  },
];

const VALID_TOOLS = [
  "breakpoints",
  "no-caching",
  "block-cookies",
  "map-remote",
  "map-local",
  "rewrite",
  "black-list",
  "white-list",
  "dns-spoofing",
  "auto-save",
  "client-process",
];

// --- Preset encoding ---

const PRESET_MAP: Record<string, string> = {
  "56 kbps modem": "56+kbps+Modem",
  "256 kbps isdn/dsl": "256+kbps+ISDN%2FDSL",
  "512 kbps isdn/dsl": "512+kbps+ISDN%2FDSL",
  "2 mbps adsl": "2+Mbps+ADSL",
  "8 mbps adsl2": "8+Mbps+ADSL2",
  "16 mbps adsl2+": "16+Mbps+ADSL2%2B",
  "32 mbps vdsl": "32+Mbps+VDSL",
  "32 mbps fibre": "32+Mbps+Fibre",
  "100 mbps fibre": "100+Mbps+Fibre",
  "3g": "3G",
  "4g": "4G",
};

function encodePreset(preset: string): string | null {
  const key = preset.toLowerCase().trim();
  return PRESET_MAP[key] || null;
}

// --- Server Setup ---

const server = new Server(
  { name: "charles-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "charles_recording_start": {
        await charlesRequest("/recording/start");
        return { content: [{ type: "text", text: "Recording started." }] };
      }

      case "charles_recording_stop": {
        await charlesRequest("/recording/stop");
        return { content: [{ type: "text", text: "Recording stopped." }] };
      }

      case "charles_recording_status": {
        const html = await charlesRequest("/recording/");
        const status = parseStatus(html);
        return {
          content: [{ type: "text", text: `Recording status: ${status}` }],
        };
      }

      case "charles_throttling_activate": {
        const preset = (args as any)?.preset;
        let path = "/throttling/activate";
        if (preset) {
          const encoded = encodePreset(preset);
          if (!encoded) {
            return {
              content: [
                {
                  type: "text",
                  text: `Unknown preset "${preset}". Valid presets: ${Object.keys(PRESET_MAP).join(", ")}`,
                },
              ],
              isError: true,
            };
          }
          path += `?preset=${encoded}`;
        }
        await charlesRequest(path);
        return {
          content: [
            {
              type: "text",
              text: preset
                ? `Throttling activated with preset: ${preset}`
                : "Throttling activated (last used preset).",
            },
          ],
        };
      }

      case "charles_throttling_deactivate": {
        await charlesRequest("/throttling/deactivate");
        return { content: [{ type: "text", text: "Throttling deactivated." }] };
      }

      case "charles_throttling_status": {
        const html = await charlesRequest("/throttling/");
        const status = parseStatus(html);
        return {
          content: [{ type: "text", text: `Throttling status: ${status}` }],
        };
      }

      case "charles_tool_enable": {
        const tool = (args as any)?.tool;
        if (!tool || !VALID_TOOLS.includes(tool)) {
          return {
            content: [
              {
                type: "text",
                text: `Invalid tool "${tool}". Valid tools: ${VALID_TOOLS.join(", ")}`,
              },
            ],
            isError: true,
          };
        }
        await charlesRequest(`/tools/${tool}/enable`);
        return {
          content: [{ type: "text", text: `Tool "${tool}" enabled.` }],
        };
      }

      case "charles_tool_disable": {
        const tool = (args as any)?.tool;
        if (!tool || !VALID_TOOLS.includes(tool)) {
          return {
            content: [
              {
                type: "text",
                text: `Invalid tool "${tool}". Valid tools: ${VALID_TOOLS.join(", ")}`,
              },
            ],
            isError: true,
          };
        }
        await charlesRequest(`/tools/${tool}/disable`);
        return {
          content: [{ type: "text", text: `Tool "${tool}" disabled.` }],
        };
      }

      case "charles_tool_status": {
        const tool = (args as any)?.tool;
        if (!tool || !VALID_TOOLS.includes(tool)) {
          return {
            content: [
              {
                type: "text",
                text: `Invalid tool "${tool}". Valid tools: ${VALID_TOOLS.join(", ")}`,
              },
            ],
            isError: true,
          };
        }
        const html = await charlesRequest(`/tools/${tool}/`);
        const status = parseStatus(html);
        return {
          content: [
            { type: "text", text: `Tool "${tool}" status: ${status}` },
          ],
        };
      }

      case "charles_session_clear": {
        await charlesRequest("/session/clear");
        return { content: [{ type: "text", text: "Session cleared." }] };
      }

      case "charles_status": {
        const results: string[] = [];
        try {
          const recHtml = await charlesRequest("/recording/");
          results.push(`Recording: ${parseStatus(recHtml)}`);
        } catch {
          results.push("Recording: Unable to fetch");
        }
        try {
          const thrHtml = await charlesRequest("/throttling/");
          results.push(`Throttling: ${parseStatus(thrHtml)}`);
        } catch {
          results.push("Throttling: Unable to fetch");
        }
        for (const t of ["rewrite", "map-local", "map-remote", "breakpoints"]) {
          try {
            const html = await charlesRequest(`/tools/${t}/`);
            results.push(`${t}: ${parseStatus(html)}`);
          } catch {
            results.push(`${t}: Unable to fetch`);
          }
        }
        return {
          content: [
            { type: "text", text: `Charles Proxy Status:\n${results.join("\n")}` },
          ],
        };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error: any) {
    const message =
      error?.code === "ECONNREFUSED"
        ? "Cannot connect to Charles Proxy. Make sure Charles is running with the Web Interface enabled (Proxy GåÆ Web Interface Settings)."
        : `Error: ${error?.message || String(error)}`;
    return { content: [{ type: "text", text: message }], isError: true };
  }
});

// --- Start ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
