import { getPage } from "../utils/browser.js";

export const getDomSchema = {
    name: "chrome_get_dom",
    description: "Get the HTML content of the page or a specific element",
    inputSchema: {
        type: "object",
        properties: {
            selector: { type: "string", description: "CSS selector (optional, defaults to full page HTML)" },
            outer: { type: "boolean", description: "Return outerHTML instead of innerHTML (default: false)" },
        },
    },
};

export async function handleGetDom(args: any): Promise<any> {
    try {
        const { selector, outer = false } = args as { selector?: string; outer?: boolean };
        const page = await getPage();
        let html: string;
        if (selector) {
            html = await page.$eval(selector, (el: Element, o: boolean) => o ? el.outerHTML : el.innerHTML, outer);
        } else {
            html = await page.content();
        }
        const truncated = html.length > 20000 ? html.slice(0, 20000) + "\n\n[... truncated at 20000 chars]" : html;
        return { content: [{ type: "text", text: truncated }] };
    } catch (error) {
        return { content: [{ type: "text", text: `Error getting DOM: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
}
