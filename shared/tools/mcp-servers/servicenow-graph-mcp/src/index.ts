#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ServiceNowClient } from "./client.js";
import { authenticateViaBrowser } from "./auth.js";
import { tools } from "./tools.js";

const instanceUrl = process.env.SERVICENOW_INSTANCE_URL ?? "";
let sessionCookie = process.env.SERVICENOW_SESSION_COOKIE ?? "";
let userToken = process.env.SERVICENOW_USER_TOKEN ?? "";

async function createClient(): Promise<ServiceNowClient> {
  // If no credentials provided, authenticate via browser on startup
  if (!sessionCookie || !userToken) {
    process.stderr.write(
      "[servicenow-graph-mcp] No session credentials found. Opening browser to authenticate...\n"
    );
    const creds = await authenticateViaBrowser(instanceUrl);
    sessionCookie = creds.sessionCookie;
    userToken = creds.userToken;
  }

  return new ServiceNowClient({ instanceUrl, sessionCookie, userToken });
}

async function main() {
  const client = await createClient();
  const server = new McpServer({ name: "mcp-servicenow-graph", version: "1.0.0" });

  // --- Incidents ---
  server.tool("search_incidents", tools.search_incidents.description, tools.search_incidents.schema.shape, async (args) => {
    const result = await client.getRecords({ table: "incident", query: args.query, fields: args.fields, limit: args.limit });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_incident", tools.get_incident.description, tools.get_incident.schema.shape, async (args) => {
    const result = await client.getRecord("incident", args.sys_id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("create_incident", tools.create_incident.description, tools.create_incident.schema.shape, async (args) => {
    const result = await client.createRecord("incident", args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("update_incident", tools.update_incident.description, tools.update_incident.schema.shape, async (args) => {
    const result = await client.updateRecord("incident", args.sys_id, args.data);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  // --- Incident Journal (Comments & Work Notes) ---
  server.tool("get_incident_comments", tools.get_incident_comments.description, tools.get_incident_comments.schema.shape, async (args) => {
    const result = await client.getJournalEntries(args.sys_id, "comments", args.limit);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_incident_worknotes", tools.get_incident_worknotes.description, tools.get_incident_worknotes.schema.shape, async (args) => {
    const result = await client.getJournalEntries(args.sys_id, "work_notes", args.limit);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_incident_journal", tools.get_incident_journal.description, tools.get_incident_journal.schema.shape, async (args) => {
    const result = await client.getJournalEntries(args.sys_id, "all", args.limit);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  // --- Change Requests ---
  server.tool("search_change_requests", tools.search_change_requests.description, tools.search_change_requests.schema.shape, async (args) => {
    const result = await client.getRecords({ table: "change_request", query: args.query, fields: args.fields, limit: args.limit });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("get_change_request", tools.get_change_request.description, tools.get_change_request.schema.shape, async (args) => {
    const result = await client.getRecord("change_request", args.sys_id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("create_change_request", tools.create_change_request.description, tools.create_change_request.schema.shape, async (args) => {
    const result = await client.createRecord("change_request", args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("update_change_request", tools.update_change_request.description, tools.update_change_request.schema.shape, async (args) => {
    const result = await client.updateRecord("change_request", args.sys_id, args.data);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  // --- Users ---
  server.tool("search_users", tools.search_users.description, tools.search_users.schema.shape, async (args) => {
    const result = await client.getRecords({ table: "sys_user", query: args.query, fields: args.fields, limit: args.limit });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  // --- CMDB ---
  server.tool("search_cmdb_ci", tools.search_cmdb_ci.description, tools.search_cmdb_ci.schema.shape, async (args) => {
    const result = await client.getRecords({ table: "cmdb_ci", query: args.query, fields: args.fields, limit: args.limit });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  // --- Generic Table ---
  server.tool("query_table", tools.query_table.description, tools.query_table.schema.shape, async (args) => {
    const result = await client.getRecords({ table: args.table, query: args.query, fields: args.fields, limit: args.limit });
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("create_record", tools.create_record.description, tools.create_record.schema.shape, async (args) => {
    const result = await client.createRecord(args.table, args.data);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("update_record", tools.update_record.description, tools.update_record.schema.shape, async (args) => {
    const result = await client.updateRecord(args.table, args.sys_id, args.data);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(String(err));
  process.exit(1);
});
