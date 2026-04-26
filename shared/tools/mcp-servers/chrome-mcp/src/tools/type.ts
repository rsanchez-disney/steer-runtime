import { getPage } from "../utils/browser.js";

export const typeSchema = {
    name: "chrome_type",
    description: "Type text into an input element identified by CSS selector",
    inputSchema: {
        type: "object",
        properties: {
            selector: { type: "string", description: "CSS selector of the input element" },
            text: { type: "string", description: "Text to type" },
            clear: { type: "boolean", description: "Clear the field before typing (default: true)" },
        },
        required: ["selector", "text"],
    },
};

export async function handleType(args: any): Promise<any> {
    try {
        const { selector, text, clear = true } = args as { selector: string; text: string; clear?: boolean };
        const page = await getPage();
        await page.waitForSelector(selector, { timeout: 5000 });
        if (clear) {
            await page.click(selector, { count: 3 });
            await page.keyboard.press("Backspace");
        }
        await page.type(selector, text);
        return { content: [{ type: "text", text: `Typed "${text}" into ${selector}` }] };
    } catch (error) {
        return { content: [{ type: "text", text: `Error typing: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
}
