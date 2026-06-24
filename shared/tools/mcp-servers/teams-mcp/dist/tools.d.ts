import { z } from "zod";
export declare const tools: {
    readonly auth_login: {
        readonly description: "Start Teams authentication. Returns a URL and code to enter in your browser.";
        readonly schema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    };
    readonly auth_complete: {
        readonly description: "Complete Teams authentication after signing in via browser.";
        readonly schema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    };
    readonly auth_status: {
        readonly description: "Check if you are currently authenticated with Teams.";
        readonly schema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    };
    readonly auth_token: {
        readonly description: "Authenticate by pasting a Bearer token from your Teams browser session.";
        readonly schema: z.ZodObject<{
            token: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            token: string;
        }, {
            token: string;
        }>;
    };
    readonly list_teams: {
        readonly description: "List all Teams the app has access to";
        readonly schema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    };
    readonly list_channels: {
        readonly description: "List channels in a Team";
        readonly schema: z.ZodObject<{
            team_id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            team_id: string;
        }, {
            team_id: string;
        }>;
    };
    readonly get_channel: {
        readonly description: "Get details of a specific channel";
        readonly schema: z.ZodObject<{
            team_id: z.ZodString;
            channel_id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            team_id: string;
            channel_id: string;
        }, {
            team_id: string;
            channel_id: string;
        }>;
    };
    readonly list_messages: {
        readonly description: "List recent messages in a channel. Use 'before' with an ISO 8601 timestamp to paginate backwards and fetch older messages.";
        readonly schema: z.ZodObject<{
            team_id: z.ZodString;
            channel_id: z.ZodString;
            top: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            before: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            team_id: string;
            channel_id: string;
            top: number;
            before?: string | undefined;
        }, {
            team_id: string;
            channel_id: string;
            top?: number | undefined;
            before?: string | undefined;
        }>;
    };
    readonly get_message: {
        readonly description: "Get a specific message from a channel";
        readonly schema: z.ZodObject<{
            team_id: z.ZodString;
            channel_id: z.ZodString;
            message_id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            team_id: string;
            channel_id: string;
            message_id: string;
        }, {
            team_id: string;
            channel_id: string;
            message_id: string;
        }>;
    };
    readonly list_replies: {
        readonly description: "List replies to a specific message in a channel";
        readonly schema: z.ZodObject<{
            team_id: z.ZodString;
            channel_id: z.ZodString;
            message_id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            team_id: string;
            channel_id: string;
            message_id: string;
        }, {
            team_id: string;
            channel_id: string;
            message_id: string;
        }>;
    };
    readonly send_message: {
        readonly description: "Send a message to a Teams channel";
        readonly schema: z.ZodObject<{
            team_id: z.ZodString;
            channel_id: z.ZodString;
            content: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            team_id: string;
            channel_id: string;
            content: string;
        }, {
            team_id: string;
            channel_id: string;
            content: string;
        }>;
    };
    readonly reply_to_message: {
        readonly description: "Reply to a message in a Teams channel";
        readonly schema: z.ZodObject<{
            team_id: z.ZodString;
            channel_id: z.ZodString;
            message_id: z.ZodString;
            content: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            team_id: string;
            channel_id: string;
            message_id: string;
            content: string;
        }, {
            team_id: string;
            channel_id: string;
            message_id: string;
            content: string;
        }>;
    };
    readonly list_members: {
        readonly description: "List members of a Team";
        readonly schema: z.ZodObject<{
            team_id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            team_id: string;
        }, {
            team_id: string;
        }>;
    };
    readonly list_chats: {
        readonly description: "List recent 1:1 and group chats";
        readonly schema: z.ZodObject<{
            top: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            top: number;
        }, {
            top?: number | undefined;
        }>;
    };
    readonly list_chat_messages: {
        readonly description: "List messages in a specific chat";
        readonly schema: z.ZodObject<{
            chat_id: z.ZodString;
            top: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            top: number;
            chat_id: string;
        }, {
            chat_id: string;
            top?: number | undefined;
        }>;
    };
    readonly send_chat_message: {
        readonly description: "Send a message in a 1:1 or group chat";
        readonly schema: z.ZodObject<{
            chat_id: z.ZodString;
            content: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            content: string;
            chat_id: string;
        }, {
            content: string;
            chat_id: string;
        }>;
    };
    readonly react_to_message: {
        readonly description: "React to a message with an emoji. Conversation ID can be a channel ID or chat ID. Common emojis: like, heart, laugh, surprised, sad, angry";
        readonly schema: z.ZodObject<{
            conversation_id: z.ZodString;
            message_id: z.ZodString;
            emoji: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            message_id: string;
            conversation_id: string;
            emoji: string;
        }, {
            message_id: string;
            conversation_id: string;
            emoji: string;
        }>;
    };
};
export type ToolName = keyof typeof tools;
