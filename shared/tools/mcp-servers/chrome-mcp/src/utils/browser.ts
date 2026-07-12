import puppeteer, { Browser, Page } from "puppeteer";

let browser: Browser | null = null;
let page: Page | null = null;

export async function getPage(): Promise<Page> {
    if (!browser || !browser.connected) {
        const wsEndpoint = process.env.BROWSER_WS_ENDPOINT;
        const browserURL = process.env.BROWSER_URL;

        if (wsEndpoint) {
            // Connect to an existing browser (e.g., Kite's embedded browser)
            browser = await puppeteer.connect({
                browserWSEndpoint: wsEndpoint,
            });
        } else if (browserURL) {
            // Connect via HTTP discovery endpoint (e.g., http://127.0.0.1:9223)
            browser = await puppeteer.connect({
                browserURL,
            });
        } else {
            // Default: launch headless Chrome
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                ],
            });
        }
    }
    if (!page || page.isClosed()) {
        const pages = await browser.pages();
        page = pages[0] || await browser.newPage();
        await page.setViewport({ width: 1280, height: 900 });
    }
    return page;
}

export async function closeBrowser(): Promise<void> {
    if (browser) {
        // Don't close if we connected to an external browser
        if (process.env.BROWSER_WS_ENDPOINT || process.env.BROWSER_URL) {
            browser.disconnect();
        } else {
            await browser.close();
        }
        browser = null;
        page = null;
    }
}
