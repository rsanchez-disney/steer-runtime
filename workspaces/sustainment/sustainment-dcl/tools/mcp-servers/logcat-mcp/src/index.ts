import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { execSync, spawn } from "child_process";

const ADB_PATH = process.env.ADB_PATH || "adb";

// --- Helpers ---

function runAdb(args: string[]): string {
  try {
    return execSync(`"${ADB_PATH}" ${args.join(" ")}`, {
      encoding: "utf8",
      timeout: 10000,
    }).trim();
  } catch (err: any) {
    throw new Error(err.stderr || err.message || String(err));
  }
}

function getLogcat(options: {
  lines?: number;
  filter?: string;
  tag?: string;
  priority?: string;
  since?: string;
  pid?: number;
  grep?: string;
}): string {
  const args: string[] = ["logcat", "-d"];

  if (options.lines) {
    args.push("-t", String(options.lines));
  } else if (options.since) {
    args.push("-T", options.since);
  } else {
    args.push("-t", "100");
  }

  args.push("-v", "threadtime");

  if (options.tag && options.priority) {
    args.push(`${options.tag}:${options.priority}`, "*:S");
  } else if (options.tag) {
    args.push(`${options.tag}:V`, "*:S");
  } else if (options.priority) {
    args.push(`*:${options.priority}`);
  }

  let output = runAdb(args);

  if (options.pid) {
    output = output
      .split("\n")
      .filter((l) => l.includes(` ${options.pid} `))
      .join("\n");
  }

  if (options.grep) {
    const re = new RegExp(options.grep, "i");
    output = output
      .split("\n")
      .filter((l) => re.test(l))
      .join("\n");
  }

  return output || "(no matching log entries)";
}

// --- Tool Definitions ---

const tools = [
  {
    name: "logcat_read",
    description:
      "Read recent Android logcat output. Supports filtering by tag, priority, line count, time, PID, and grep pattern.",
    inputSchema: {
      type: "object" as const,
      properties: {
        lines: {
          type: "number",
          description: "Number of recent lines to return (default: 100)",
        },
        tag: {
          type: "string",
          description: "Filter by log tag (e.g. 'ActivityManager', 'MyApp')",
        },
        priority: {
          type: "string",
          description:
            "Minimum priority: V(erbose), D(ebug), I(nfo), W(arn), E(rror), F(atal)",
          enum: ["V", "D", "I", "W", "E", "F"],
        },
        since: {
          type: "string",
          description:
            "Show logs since timestamp (format: 'MM-DD HH:MM:SS.mmm' or relative like '5s ago')",
        },
        pid: {
          type: "number",
          description: "Filter by process ID",
        },
        grep: {
          type: "string",
          description:
            "Regex pattern to filter log lines (case-insensitive)",
        },
      },
    },
  },
  {
    name: "logcat_clear",
    description: "Clear the logcat buffer on the connected device",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "logcat_crash",
    description:
      "Read the crash log buffer (recent crashes and ANRs)",
    inputSchema: {
      type: "object" as const,
      properties: {
        lines: {
          type: "number",
          description: "Number of recent crash lines (default: 50)",
        },
      },
    },
  },
  {
    name: "logcat_app",
    description:
      "Read logcat filtered to a specific app package (finds PID automatically)",
    inputSchema: {
      type: "object" as const,
      properties: {
        package: {
          type: "string",
          description:
            "App package name (e.g. 'com.disney.cruise.guestapp')",
        },
        lines: {
          type: "number",
          description: "Number of recent lines (default: 150)",
        },
        priority: {
          type: "string",
          description: "Minimum priority: V, D, I, W, E, F",
          enum: ["V", "D", "I", "W", "E", "F"],
        },
        grep: {
          type: "string",
          description: "Regex pattern to further filter lines",
        },
      },
      required: ["package"],
    },
  },
  {
    name: "adb_devices",
    description: "List connected Android devices/emulators",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "adb_shell",
    description:
      "Run an adb shell command on the connected device (read-only commands recommended)",
    inputSchema: {
      type: "object" as const,
      properties: {
        command: {
          type: "string",
          description:
            "Shell command to run (e.g. 'dumpsys activity top', 'ps -A | grep com.disney')",
        },
      },
      required: ["command"],
    },
  },
  {
    name: "logcat_errors",
    description:
      "Get only ERROR and FATAL level logs from the last N lines",
    inputSchema: {
      type: "object" as const,
      properties: {
        lines: {
          type: "number",
          description: "Number of recent lines to scan (default: 500)",
        },
        grep: {
          type: "string",
          description: "Optional regex to further filter error lines",
        },
      },
    },
  },
];

// --- Server Setup ---

const server = new Server(
  { name: "logcat-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "logcat_read": {
        const a = args as any;
        const output = getLogcat({
          lines: a?.lines,
          tag: a?.tag,
          priority: a?.priority,
          since: a?.since,
          pid: a?.pid,
          grep: a?.grep,
        });
        return { content: [{ type: "text", text: output }] };
      }

      case "logcat_clear": {
        runAdb(["logcat", "-c"]);
        return {
          content: [{ type: "text", text: "Logcat buffer cleared." }],
        };
      }

      case "logcat_crash": {
        const lines = (args as any)?.lines || 50;
        const output = runAdb([
          "logcat",
          "-b",
          "crash",
          "-d",
          "-t",
          String(lines),
          "-v",
          "threadtime",
        ]);
        return {
          content: [
            { type: "text", text: output || "(no crash logs found)" },
          ],
        };
      }

      case "logcat_app": {
        const a = args as any;
        const pkg = a.package;
        // Find PID for the package
        let pid: number | undefined;
        try {
          const psOutput = runAdb(["shell", "pidof", pkg]);
          const pids = psOutput.trim().split(/\s+/);
          if (pids.length > 0 && pids[0]) {
            pid = parseInt(pids[0], 10);
          }
        } catch {
          // App might not be running
        }

        if (!pid) {
          return {
            content: [
              {
                type: "text",
                text: `App "${pkg}" is not running or not found on device. Start the app and try again.`,
              },
            ],
            isError: true,
          };
        }

        const output = getLogcat({
          lines: a?.lines || 150,
          pid,
          priority: a?.priority,
          grep: a?.grep,
        });
        return {
          content: [
            {
              type: "text",
              text: `Logcat for ${pkg} (PID: ${pid}):\n\n${output}`,
            },
          ],
        };
      }

      case "adb_devices": {
        const output = runAdb(["devices", "-l"]);
        return { content: [{ type: "text", text: output }] };
      }

      case "adb_shell": {
        const cmd = (args as any)?.command;
        if (!cmd) {
          return {
            content: [{ type: "text", text: "No command provided." }],
            isError: true,
          };
        }
        const output = runAdb(["shell", ...cmd.split(" ")]);
        return { content: [{ type: "text", text: output }] };
      }

      case "logcat_errors": {
        const lines = (args as any)?.lines || 500;
        const grep = (args as any)?.grep;
        const output = getLogcat({
          lines,
          priority: "E",
          grep,
        });
        return { content: [{ type: "text", text: output }] };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error: any) {
    const message =
      error?.message?.includes("no devices")
        ? "No Android device connected. Connect a device or start an emulator."
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
