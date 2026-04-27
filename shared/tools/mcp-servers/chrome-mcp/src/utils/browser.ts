import puppeteer, { Browser, Page } from "puppeteer";

let browser: Browser | null = null;
let page: Page | null = null;

export async function getPage(): Promise<Page> {
    if (!browser || !browser.connected) {
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
    if (!page || page.isClosed()) {
        page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 900 });
    }
    return page;
}

export async function closeBrowser(): Promise<void> {
    if (browser) {
        await browser.close();
        browser = null;
        page = null;
    }
}
