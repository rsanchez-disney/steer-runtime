import puppeteer, { Browser, Page } from "puppeteer";

let browser: Browser | null = null;
let page: Page | null = null;
let connectedToExternal = false;

export async function getPage(): Promise<Page> {
    if (!browser || !browser.connected) {
        connectedToExternal = false;
        const wsEndpoint = process.env.BROWSER_WS_ENDPOINT;
        const browserURL = process.env.BROWSER_URL;

        if (wsEndpoint) {
            try {
                browser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint });
                connectedToExternal = true;
            } catch {
                // Fallback to launch if WebSocket connection fails
                browser = await launchHeadless();
            }
        } else if (browserURL) {
            try {
                browser = await puppeteer.connect({ browserURL });
                connectedToExternal = true;
            } catch {
                // Fallback to launch if HTTP discovery fails (e.g., Kite browser not open)
                browser = await launchHeadless();
            }
        } else {
            browser = await launchHeadless();
        }
    }
    if (!page || page.isClosed()) {
        const pages = await browser.pages();
        page = pages[0] || await browser.newPage();
        await page.setViewport({ width: 1280, height: 900 });
    }
    return page;
}

async function launchHeadless(): Promise<Browser> {
    return puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
        ],
    });
}

export async function closeBrowser(): Promise<void> {
    if (browser) {
        if (connectedToExternal) {
            browser.disconnect();
        } else {
            await browser.close();
        }
        browser = null;
        page = null;
        connectedToExternal = false;
    }
}
