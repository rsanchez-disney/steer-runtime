import { getPage } from "../utils/browser.js";

export const waitForSelectorSchema = {
    name: "chrome_wait_for",
    description: "Wait for an element matching a CSS selector to appear on the page",
    inputSchema: {
        type: "object",
        properties: {
            selector: { type: "string", description: "CSS selector to wait for" },
            timeout: { type: "number", description: "Max wait time in ms (default: 10000)" },
            visible: { type: "boolean", description: "Wait for element to be visible (default: true)" },
        },
        required: ["selector"],
    },
};

export async function handleWaitForSelector(args: any): Promise<any> {
    try {
        const { selector, timeout = 10000, visible = true } = args as { selector: string; timeout?: number; visible?: boolean };
        const page = await getPage();
        await page.waitForSelector(selector, { timeout, visible });
        return { content: [{ type: "text", text: `Element found: ${selector}` }] };
    } catch (error) {
        return { content: [{ type: "text", text: `Timeout waiting for: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
}
