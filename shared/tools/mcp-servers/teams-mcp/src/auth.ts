import { chromium, type BrowserContext } from "playwright";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";

export interface TeamsTokens {
  nativeToken: string;
  chatToken: string;
}

const STATE_DIR = path.join(os.homedir(), ".mcp-teams", "browser-state");

function ensureStateDir() {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true, mode: 0o700 });
  }
}

/**
 * Opens a Playwright browser with persistent state.
 * First time: you log in to Teams. The session is saved to disk.
 * Next times: the saved session is reused — no login needed.
 */
export async function authenticateViaBrowser(): Promise<TeamsTokens> {
  ensureStateDir();

  process.stderr.write("[mcp-teams] Opening browser for authentication...\n");

  const context: BrowserContext = await chromium.launchPersistentContext(STATE_DIR, {
    headless: false,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const page = context.pages()[0] || await context.newPage();

  return new Promise<TeamsTokens>((resolve, reject) => {
    let nativeToken = "";
    let chatToken = "";

    const timeout = setTimeout(() => {
      context.close().catch(() => {});
      if (nativeToken || chatToken) {
        resolve({ nativeToken, chatToken });
      } else {
        reject(new Error("Teams authentication timed out after 180 seconds"));
      }
    }, 180_000);

    const tryResolve = () => {
      if (nativeToken && chatToken) {
        clearTimeout(timeout);
        setTimeout(async () => {
          await context.close().catch(() => {});
          resolve({ nativeToken, chatToken });
        }, 1000);
      }
    };

    page.on("request", (request) => {
      const url = request.url();
      const authHeader = request.headers()["authorization"] ?? "";
      if (!authHeader.startsWith("Bearer ")) return;
      const token = authHeader.replace("Bearer ", "");

      if (!nativeToken && (
        url.includes("graph.microsoft.com") ||
        url.includes("/api/csa/")
      )) {
        nativeToken = token;
        process.stderr.write("[mcp-teams] Captured native token\n");
        tryResolve();
      }

      if (!chatToken && url.includes("/api/chatsvc/")) {
        chatToken = token;
        process.stderr.write("[mcp-teams] Captured chat token\n");
        tryResolve();
      }
    });

    page.goto("https://teams.microsoft.com").catch(reject);
  });
}
