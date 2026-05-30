import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = (() => {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return __dirname;
  }
})();

config({ path: path.join(scriptDir, "..", "..", ".env") });

const apiKey = process.env.HARNESS_API_KEY || "";
const accountId = process.env.HARNESS_ACCOUNT_ID || "";
const baseUrl = (process.env.HARNESS_BASE_URL || "https://disney.harness.io").replace(/\/$/, "");

if (!apiKey) {
  console.error("Missing HARNESS_API_KEY");
  process.exit(1);
}
if (!accountId) {
  console.error("Missing HARNESS_ACCOUNT_ID");
  process.exit(1);
}

export interface HarnessRequestOptions {
  method?: string;
  path: string;
  params?: Record<string, string>;
  body?: unknown;
}

export async function harnessRequest<T>(opts: HarnessRequestOptions): Promise<T> {
  const url = new URL(`${baseUrl}/gateway/${opts.path}`);
  url.searchParams.set("accountIdentifier", accountId);
  if (opts.params) {
    for (const [k, v] of Object.entries(opts.params)) {
      url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    method: opts.method || "GET",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Harness API ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export function getAccountId(): string {
  return accountId;
}

export function getBaseUrl(): string {
  return baseUrl;
}
