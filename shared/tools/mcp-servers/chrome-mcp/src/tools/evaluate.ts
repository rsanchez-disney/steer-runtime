import { getPage } from "../utils/browser.js";

export const evaluateSchema = {
    name: "chrome_evaluate",
    description: "Execute JavaScript in the browser page context and return the result. NOTE: This executes arbitrary JS — use responsibly.",
    inputSchema: {
        type: "object",
        properties: {
            script: { type: "string", description: "JavaScript code to execute in the page context" },
        },
        required: ["script"],
    },
};

export async function handleEvaluate(args: any): Promise<any> {
    try {
        const { script } = args as { script: string };
        console.error(`[chrome_evaluate] Executing script (${script.length} chars): ${script.slice(0, 200)}${script.length > 200 ? "..." : ""}`);
        const page = await getPage();
        const result = await page.evaluate(script);
        const output = result === undefined ? "undefined" : JSON.stringify(result, null, 2);
        return { content: [{ type: "text", text: output }] };
    } catch (error) {
        return { content: [{ type: "text", text: `Error evaluating JS: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
}
