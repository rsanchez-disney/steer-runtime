import { getPage } from "../utils/browser.js";

export const getTextSchema = {
    name: "chrome_get_text",
    description: "Extract visible text content from the page or a specific element",
    inputSchema: {
        type: "object",
        properties: {
            selector: { type: "string", description: "CSS selector (optional, defaults to body)" },
        },
    },
};

export async function handleGetText(args: any): Promise<any> {
    try {
        const { selector = "body" } = args as { selector?: string };
        const page = await getPage();
        const text = await page.$eval(selector, (el: Element) => (el as HTMLElement).innerText);
        const truncated = text.length > 10000 ? text.slice(0, 10000) + "\n\n[... truncated at 10000 chars]" : text;
        return { content: [{ type: "text", text: truncated }] };
    } catch (error) {
        return { content: [{ type: "text", text: `Error extracting text: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
}
