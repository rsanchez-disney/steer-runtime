/**
 * BlueDolphin MCP tools — read-only access to enterprise architecture data.
 */
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { BlueDolphinClient } from "./client.js";
export declare const tools: Tool[];
export declare function handleToolCall(client: BlueDolphinClient, name: string, args: Record<string, unknown>): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
