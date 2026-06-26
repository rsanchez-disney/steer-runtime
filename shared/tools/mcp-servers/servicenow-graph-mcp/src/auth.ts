import { chromium, type BrowserContext } from "playwright";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";

export interface ServiceNowCredentials {
  sessionCookie: string;
  userToken: string;
}

// Persistent browser state directory — survives restarts
const STATE_DIR = path.join(os.homedir(), ".mcp-servicenow", "browser-state");

function ensureStateDir() {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true, mode: 0o700 });
  }
}

/**
 * Opens a Playwright browser with persistent state.
 * First time: you log in via SSO. The session is saved to disk.
 * Next times: the saved session is reused — no login needed.
 * If the session expires, SSO page appears again, you log in, and it's saved.
 */
export async function authenticateViaBrowser(
  instanceUrl: string
): Promise<ServiceNowCredentials> {
  ensureStateDir();

  process.stderr.write("[servicenow-mcp] Opening browser for authentication...\n");

  // launchPersistentContext saves cookies, localStorage, etc. to STATE_DIR
  const context: BrowserContext = await chromium.launchPersistentContext(STATE_DIR, {
    headless: false,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const page = context.pages()[0] || await context.newPage();

  return new Promise<ServiceNowCredentials>((resolve, reject) => {
    const timeout = setTimeout(() => {
      context.close().catch(() => {});
      reject(new Error("Authentication timed out after 180 seconds"));
    }, 180_000);

    page.on("request", async (request) => {
      const url = request.url();
      if (!url.includes("/api/now/")) return;

      const headers = request.headers();
      const userToken = headers["x-usertoken"] ?? "";
      if (!userToken) return;

      const cookies = await context.cookies(instanceUrl);
      const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
      if (!cookieString) return;

      clearTimeout(timeout);

      setTimeout(async () => {
        await context.close().catch(() => {});
        resolve({ sessionCookie: cookieString, userToken });
      }, 500);
    });

    page.goto(`${instanceUrl}/now/nav/ui/classic/params/target/incident_list.do`).catch(reject);
  });
}
