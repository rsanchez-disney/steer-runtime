#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TeamsClient } from "./client.js";
import { authenticateViaBrowser } from "./auth.js";
import { tools } from "./tools.js";
import { z } from "zod";

const authMode = process.env.TEAMS_CLIENT_SECRET ? "client_credentials" : "device_code";

const config = {
  tenantId: process.env.TEAMS_TENANT_ID ?? "common",
  clientId: process.env.TEAMS_CLIENT_ID ?? "",
  clientSecret: process.env.TEAMS_CLIENT_SECRET,
  authMode: authMode as "client_credentials" | "device_code",
};

const client = new TeamsClient(config);
const server = new McpServer({ name: "mcp-teams", version: "1.0.0" });

// Auto-load native token from env if available
const nativeToken = process.env.TEAMS_NATIVE_TOKEN;
if (nativeToken && nativeToken.length > 10) {
  client.setManualToken(nativeToken).then((result) => {
    process.stderr.write(`[mcp-teams] Auto-loaded token: ${result.mode}\n`);
  }).catch(() => {
    process.stderr.write(`[mcp-teams] Failed to auto-load native token\n`);
  });
}

// Auto-load chat token from env if available (for chatsvc/message endpoints)
const chatToken = process.env.TEAMS_CHAT_TOKEN;
if (chatToken && chatToken.length > 10) {
  client.setChatTokenFromEnv(chatToken);
  process.stderr.write(`[mcp-teams] Auto-loaded chat token\n`);
}

// If no tokens provided at all, authenticate via browser on startup
if ((!nativeToken || nativeToken.length <= 10) && (!chatToken || chatToken.length <= 10)) {
  process.stderr.write("[mcp-teams] No tokens found. Opening browser for authentication...\n");
  authenticateViaBrowser().then(async (tokens) => {
    if (tokens.nativeToken) {
      await client.setManualToken(tokens.nativeToken);
      process.stderr.write("[mcp-teams] Native token loaded via browser\n");
    }
    if (tokens.chatToken) {
      client.setChatTokenFromEnv(tokens.chatToken);
      process.stderr.write("[mcp-teams] Chat token loaded via browser\n");
    }
  }).catch((err) => {
    process.stderr.write(`[mcp-teams] Browser auth failed: ${err.message}\n`);
  });
}

// --- Auth ---
server.tool(
  "auth_login",
  "Start Teams authentication. Returns a URL and code to enter in your browser. After authenticating, call auth_complete.",
  {},
  async () => {
    try {
      const result = await client.startDeviceCodeFlow();
      return {
        content: [{
          type: "text",
          text: [
            "🔐 Authentication required. Please follow these steps:",
            "",
            `1. Open this URL in your browser: ${result.verificationUri}`,
            `2. Enter this code: ${result.userCode}`,
            "3. Sign in with your Teams account",
            "4. Once done, call the 'auth_complete' tool to finish",
          ].join("\n"),
        }],
      };
    } catch (err: any) {
      return { content: [{ type: "text", text: `Error starting auth: ${err.message}` }] };
    }
  }
);

server.tool(
  "auth_complete",
  "Complete Teams authentication after signing in via browser. Call this after using auth_login and completing the browser sign-in.",
  {},
  async () => {
    const result = await client.pollDeviceCode();
    if (result.authenticated) {
      return { content: [{ type: "text", text: "✅ Authenticated successfully. You can now use all Teams tools." }] };
    }
    return { content: [{ type: "text", text: `❌ Authentication failed: ${result.error}` }] };
  }
);

server.tool(
  "auth_status",
  "Check if you are currently authenticated with Teams.",
  {},
  async () => {
    const status: string[] = [];
    try {
      await client.listTeams();
      status.push("✅ Teams/Channels: Authenticated (native token)");
    } catch (err: any) {
      if (err.message?.includes("AUTH_REQUIRED")) {
        status.push("❌ Teams/Channels: Not authenticated. Use 'auth_login' or 'auth_token'.");
      } else {
        status.push(`❌ Teams/Channels: ${err.message}`);
      }
    }
    status.push(client.hasChatToken()
      ? "✅ Messages/Chats: Chat token loaded (TEAMS_CHAT_TOKEN)"
      : "❌ Messages/Chats: No chat token. Set TEAMS_CHAT_TOKEN env var.");
    return { content: [{ type: "text", text: status.join("\n") }] };
  }
);

server.tool(
  "auth_token",
  "Authenticate by pasting a Bearer token from your Teams browser session. Open teams.microsoft.com → DevTools (F12) → Network → find a request to graph.microsoft.com → copy the Authorization header value.",
  { token: z.string().describe("Bearer token from browser (with or without 'Bearer ' prefix)") },
  async (args) => {
    try {
      const result = await client.setManualToken(args.token);
      if (result.mode === "graph") {
        // Verify with Graph API
        const teams = await client.listTeams();
        return {
          content: [{
            type: "text",
            text: `✅ Authenticated via Graph API. Found ${teams.length} team(s).`,
          }],
        };
      } else {
        return {
          content: [{
            type: "text",
            text: `✅ Authenticated via Teams native APIs. Token exchange to Graph was not possible, but you can use Teams native endpoints. Some tools may have limited functionality.`,
          }],
        };
      }
    } catch (err: any) {
      return {
        content: [{
          type: "text",
          text: `❌ Token error: ${err.response?.data?.error?.message || err.message}. Try copying a fresh token from DevTools.`,
        }],
      };
    }
  }
);

// --- Teams ---
server.tool("list_teams", tools.list_teams.description, tools.list_teams.schema.shape, async () => {
  const result = await client.listTeams();
  const compact = Array.isArray(result) ? result.map((t: any) => ({
    id: t.id || t.teamId,
    displayName: t.displayName || t.name,
    description: t.description || "",
    memberCount: t._raw?.membershipSummary?.totalMemberCount ?? t.membershipSummary?.totalMemberCount ?? undefined,
    channels: Array.isArray(t._raw?.channels) ? t._raw.channels.map((c: any) => ({
      id: c.id,
      displayName: c.displayName,
      isMember: c.isMember,
      isFavorite: c.isFavorite,
    })) : undefined,
  })) : result;
  return { content: [{ type: "text", text: JSON.stringify(compact, null, 2) }] };
});

// --- Channels ---
server.tool("list_channels", tools.list_channels.description, tools.list_channels.schema.shape, async (args) => {
  const result = await client.listChannels(args.team_id);
  const compact = Array.isArray(result) ? result.map((c: any) => ({
    id: c.id || c.channelId,
    displayName: c.displayName || c.name,
    description: c.description || "",
    membershipType: c.membershipType || "",
  })) : result;
  return { content: [{ type: "text", text: JSON.stringify(compact, null, 2) }] };
});

server.tool("get_channel", tools.get_channel.description, tools.get_channel.schema.shape, async (args) => {
  const result = await client.getChannel(args.team_id, args.channel_id);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

// --- Channel Messages ---
server.tool("list_messages", tools.list_messages.description, tools.list_messages.schema.shape, async (args) => {
  const result = await client.listMessages(args.team_id, args.channel_id, args.top, args.before);
  const compact = Array.isArray(result) ? result.map((m: any) => ({
    id: m.id || m.messageId,
    from: m.from?.user?.displayName || m.imDisplayName || m.from || "",
    content: (m.body?.content || m.content || "").substring(0, 500),
    createdDateTime: m.createdDateTime || m.composeTime || m.originalArrivalTime || "",
    replyCount: m.replies?.length ?? undefined,
  })) : result;
  return { content: [{ type: "text", text: JSON.stringify(compact, null, 2) }] };
});

server.tool("get_message", tools.get_message.description, tools.get_message.schema.shape, async (args) => {
  const result = await client.getMessage(args.team_id, args.channel_id, args.message_id);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

server.tool("list_replies", tools.list_replies.description, tools.list_replies.schema.shape, async (args) => {
  const result = await client.listReplies(args.team_id, args.channel_id, args.message_id);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

server.tool("send_message", tools.send_message.description, tools.send_message.schema.shape, async (args) => {
  const result = await client.sendMessage(args.team_id, args.channel_id, args.content);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

server.tool("reply_to_message", tools.reply_to_message.description, tools.reply_to_message.schema.shape, async (args) => {
  const result = await client.replyToMessage(args.team_id, args.channel_id, args.message_id, args.content);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

// --- Members ---
server.tool("list_members", tools.list_members.description, tools.list_members.schema.shape, async (args) => {
  const result = await client.listMembers(args.team_id);
  const compact = Array.isArray(result) ? result.map((m: any) => ({
    id: m.id || m.userId,
    displayName: m.displayName || m.name || "",
    email: m.email || m.userPrincipalName || "",
    roles: m.roles || [],
  })) : result;
  return { content: [{ type: "text", text: JSON.stringify(compact, null, 2) }] };
});

// --- Chats ---
server.tool("list_chats", tools.list_chats.description, tools.list_chats.schema.shape, async (args) => {
  const result = await client.listChats(args.top);
  const compact = Array.isArray(result) ? result.map((c: any) => ({
    id: c.id,
    topic: c.topic || c.displayName || "(no topic)",
    chatType: c.chatType || c.threadType || "",
    lastUpdated: c.lastUpdatedDateTime || c.lastMessage?.composeTime || "",
  })) : result;
  return { content: [{ type: "text", text: JSON.stringify(compact, null, 2) }] };
});

server.tool("list_chat_messages", tools.list_chat_messages.description, tools.list_chat_messages.schema.shape, async (args) => {
  const result = await client.listChatMessages(args.chat_id, args.top);
  const compact = Array.isArray(result) ? result.map((m: any) => ({
    id: m.id || m.messageId,
    from: m.from?.user?.displayName || m.imDisplayName || m.from || "",
    content: (m.body?.content || m.content || "").substring(0, 500),
    createdDateTime: m.createdDateTime || m.composeTime || "",
  })) : result;
  return { content: [{ type: "text", text: JSON.stringify(compact, null, 2) }] };
});

server.tool("send_chat_message", tools.send_chat_message.description, tools.send_chat_message.schema.shape, async (args) => {
  const result = await client.sendChatMessage(args.chat_id, args.content);
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

server.tool("react_to_message", tools.react_to_message.description, tools.react_to_message.schema.shape, async (args) => {
  try {
    const result = await client.reactToMessage(args.conversation_id, args.message_id, args.emoji);
    return { content: [{ type: "text", text: `✅ Reacted with ${args.emoji} to message ${args.message_id}` }] };
  } catch (err: any) {
    return { content: [{ type: "text", text: `❌ Failed to react: ${err.message}` }] };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(String(err));
  process.exit(1);
});
