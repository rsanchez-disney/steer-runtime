import { z } from "zod";
export const tools = {
    // --- Auth ---
    auth_login: {
        description: "Start Teams authentication. Returns a URL and code to enter in your browser.",
        schema: z.object({}),
    },
    auth_complete: {
        description: "Complete Teams authentication after signing in via browser.",
        schema: z.object({}),
    },
    auth_status: {
        description: "Check if you are currently authenticated with Teams.",
        schema: z.object({}),
    },
    auth_token: {
        description: "Authenticate by pasting a Bearer token from your Teams browser session.",
        schema: z.object({
            token: z.string().describe("Bearer token from browser (with or without 'Bearer ' prefix)"),
        }),
    },
    // --- Teams ---
    list_teams: {
        description: "List all Teams the app has access to",
        schema: z.object({}),
    },
    // --- Channels ---
    list_channels: {
        description: "List channels in a Team",
        schema: z.object({
            team_id: z.string().describe("The Team ID"),
        }),
    },
    get_channel: {
        description: "Get details of a specific channel",
        schema: z.object({
            team_id: z.string(),
            channel_id: z.string(),
        }),
    },
    // --- Channel Messages ---
    list_messages: {
        description: "List recent messages in a channel. Use 'before' with an ISO 8601 timestamp to paginate backwards and fetch older messages.",
        schema: z.object({
            team_id: z.string(),
            channel_id: z.string(),
            top: z.number().optional().default(20).describe("Number of messages to return"),
            before: z.string().optional().describe("ISO 8601 timestamp to fetch messages before this time (e.g. '2026-05-17T00:00:00Z'). Use for pagination to get older messages."),
        }),
    },
    get_message: {
        description: "Get a specific message from a channel",
        schema: z.object({
            team_id: z.string(),
            channel_id: z.string(),
            message_id: z.string(),
        }),
    },
    list_replies: {
        description: "List replies to a specific message in a channel",
        schema: z.object({
            team_id: z.string(),
            channel_id: z.string(),
            message_id: z.string(),
        }),
    },
    send_message: {
        description: "Send a message to a Teams channel",
        schema: z.object({
            team_id: z.string(),
            channel_id: z.string(),
            content: z.string().describe("Message content (supports HTML)"),
        }),
    },
    reply_to_message: {
        description: "Reply to a message in a Teams channel",
        schema: z.object({
            team_id: z.string(),
            channel_id: z.string(),
            message_id: z.string(),
            content: z.string().describe("Reply content (supports HTML)"),
        }),
    },
    // --- Members ---
    list_members: {
        description: "List members of a Team",
        schema: z.object({
            team_id: z.string(),
        }),
    },
    // --- Chats ---
    list_chats: {
        description: "List recent 1:1 and group chats",
        schema: z.object({
            top: z.number().optional().default(20),
        }),
    },
    list_chat_messages: {
        description: "List messages in a specific chat",
        schema: z.object({
            chat_id: z.string(),
            top: z.number().optional().default(20),
        }),
    },
    send_chat_message: {
        description: "Send a message in a 1:1 or group chat",
        schema: z.object({
            chat_id: z.string(),
            content: z.string().describe("Message content (supports HTML)"),
        }),
    },
    react_to_message: {
        description: "React to a message with an emoji. Conversation ID can be a channel ID or chat ID. Common emojis: like, heart, laugh, surprised, sad, angry",
        schema: z.object({
            conversation_id: z.string().describe("Channel ID or Chat ID where the message is"),
            message_id: z.string().describe("The message ID to react to"),
            emoji: z.string().describe("Emoji key: like, heart, laugh, surprised, sad, angry"),
        }),
    },
};
