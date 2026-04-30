import { getPage } from "../utils/browser.js";

export const navigateSchema = {
    name: "chrome_navigate",
    description: "Navigate to a URL and return the page title",
    inputSchema: {
        type: "object",
        properties: {
            url: { type: "string", description: "URL to navigate to (http:// or https:// only)" },
            waitUntil: { type: "string", enum: ["load", "domcontentloaded", "networkidle0", "networkidle2"], description: "Wait condition (default: domcontentloaded)" },
        },
        required: ["url"],
    },
};

export async function handleNavigate(args: any): Promise<any> {
    try {
        const { url, waitUntil = "domcontentloaded" } = args as { url: string; waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2" };
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return { content: [{ type: "text", text: "Error: Only http:// and https:// URLs are supported" }], isError: true };
        }
        const page = await getPage();
        await page.goto(url, { waitUntil, timeout: 30000 });
        const title = await page.title();
        const currentUrl = page.url();
        return { content: [{ type: "text", text: `**Navigated to:** ${currentUrl}\n**Title:** ${title}` }] };
    } catch (error) {
        return { content: [{ type: "text", text: `Error navigating: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
}
