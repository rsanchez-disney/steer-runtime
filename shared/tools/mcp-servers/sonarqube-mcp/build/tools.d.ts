/**
 * SonarQube MCP tools — code quality, security, and coverage metrics.
 */
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { SonarQubeClient } from "./client.js";
export declare const tools: Tool[];
export declare function handleToolCall(client: SonarQubeClient, name: string, args: Record<string, unknown>): Promise<{
    content: Array<{
        type: string;
        text: string;
    }>;
}>;
