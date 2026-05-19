/**
 * Chrome DevTools MCP Bundle
 *
 * Thin wrapper that spawns the official chrome-devtools-mcp server
 * with team-standard defaults (isolated + headless).
 *
 * Uses --isolated=true so it launches its own Chrome instance with a
 * temporary user-data-dir — never interferes with existing Chrome sessions.
 *
 * Optional env vars for remote connection:
 *   CHROME_WS_ENDPOINT - WebSocket endpoint (e.g. ws://127.0.0.1:9222/devtools/browser/<id>)
 *   CHROME_WS_TOKEN    - Bearer token for --wsHeaders (valid ~8h, rotate manually)
 */
import { spawn } from "child_process";
import { join } from "path";
import { existsSync } from "fs";

function resolveBin(): string {
  const local = join(__dirname, "../node_modules/.bin/chrome-devtools-mcp");
  if (existsSync(local)) return local;
  return "chrome-devtools-mcp";
}

function buildArgs(): string[] {
  const args: string[] = [
    "--isolated=true",
    "--headless=true",
    "--no-usage-statistics",
  ];

  const wsEndpoint = process.env.CHROME_WS_ENDPOINT;
  const wsToken = process.env.CHROME_WS_TOKEN;

  if (wsEndpoint) {
    args.push(`--wsEndpoint=${wsEndpoint}`);
    if (wsToken) {
      args.push(`--wsHeaders={"Authorization":"Bearer ${wsToken}"}`);
    }
  }

  return args;
}

const bin = resolveBin();
const args = buildArgs();

const child = spawn(bin, args, {
  stdio: "inherit",
  env: { ...process.env },
});

child.on("error", (err) => {
  console.error(`Failed to start chrome-devtools-mcp: ${err.message}`);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
