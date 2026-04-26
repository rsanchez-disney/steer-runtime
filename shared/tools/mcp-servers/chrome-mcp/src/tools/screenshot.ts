import { getPage } from "../utils/browser.js";

export const screenshotSchema = {
    name: "chrome_screenshot",
    description: "Take a screenshot of the current page, returned as base64 PNG",
    inputSchema: {
        type: "object",
        properties: {
            selector: { type: "string", description: "CSS selector to screenshot a specific element (optional, defaults to full page)" },
            fullPage: { type: "boolean", description: "Capture full scrollable page (default: false)" },
        },
    },
};

export async function handleScreenshot(args: any): Promise<any> {
    try {
        const { selector, fullPage = false } = args as { selector?: string; fullPage?: boolean };
        const page = await getPage();
        let buffer: Buffer;
        if (selector) {
            const el = await page.$(selector);
            if (!el) return { content: [{ type: "text", text: `Element not found: ${selector}` }], isError: true };
            buffer = (await el.screenshot({ type: "png" })) as Buffer;
        } else {
            buffer = (await page.screenshot({ type: "png", fullPage })) as Buffer;
        }
        return { content: [{ type: "image", data: buffer.toString("base64"), mimeType: "image/png" }] };
    } catch (error) {
        return { content: [{ type: "text", text: `Error taking screenshot: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
}
