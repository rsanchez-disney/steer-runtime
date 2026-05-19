/**
 * Chrome DevTools MCP Bundle
 *
 * Thin wrapper around the official chrome-devtools-mcp server
 * with safe defaults: headless + isolated (no user Chrome interference).
 *
 * Env vars (optional):
 *   CHROME_WS_ENDPOINT - WebSocket endpoint for remote Chrome
 *   CHROME_WS_TOKEN    - Bearer token for wsHeaders auth
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
    "--headless=true",
    "--isolated=true",
    "--autoConnect=true",
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

const child = spawn(resolveBin(), buildArgs(), {
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
