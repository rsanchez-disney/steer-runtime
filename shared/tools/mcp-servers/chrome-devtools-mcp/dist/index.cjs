#!/usr/bin/env node
"use strict";

// src/index.ts
var import_child_process = require("child_process");
var import_path = require("path");
var import_fs = require("fs");
function resolveBin() {
  const local = (0, import_path.join)(__dirname, "../node_modules/.bin/chrome-devtools-mcp");
  if ((0, import_fs.existsSync)(local)) return local;
  return "chrome-devtools-mcp";
}
function buildArgs() {
  const args = [
    "--headless=true",
    "--isolated=true",
    "--autoConnect=true",
    "--no-usage-statistics"
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
var child = (0, import_child_process.spawn)(resolveBin(), buildArgs(), {
  stdio: "inherit",
  env: { ...process.env }
});
child.on("error", (err) => {
  console.error(`Failed to start chrome-devtools-mcp: ${err.message}`);
  process.exit(1);
});
child.on("exit", (code) => {
  process.exit(code ?? 0);
});
