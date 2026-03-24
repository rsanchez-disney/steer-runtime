#!/usr/bin/env node
import { createBrunoMcpServer } from './server.js';

const server = createBrunoMcpServer();
server.start().catch((error) => {
  console.error('Failed to start Bruno MCP Server:', error);
  process.exit(1);
});
