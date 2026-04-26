import { getPage } from "../utils/browser.js";

export const clickSchema = {
    name: "chrome_click",
    description: "Click an element by CSS selector",
    inputSchema: {
        type: "object",
        properties: {
            selector: { type: "string", description: "CSS selector of the element to click" },
        },
        required: ["selector"],
    },
};

export async function handleClick(args: any): Promise<any> {
    try {
        const { selector } = args as { selector: string };
        const page = await getPage();
        await page.waitForSelector(selector, { timeout: 5000 });
        await page.click(selector);
        return { content: [{ type: "text", text: `Clicked: ${selector}` }] };
    } catch (error) {
        return { content: [{ type: "text", text: `Error clicking: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
}
