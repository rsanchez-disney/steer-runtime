import { APPIUM_URL, APPIUM_TIMEOUT } from "../config.js";

let currentSessionId: string | null = null;

export function getSessionId(): string | null {
  return currentSessionId;
}

export function setSessionId(id: string | null): void {
  currentSessionId = id;
}

export interface AppiumRequestOptions {
  method?: string;
  path: string;
  body?: unknown;
}

export async function appiumRequest<T>(opts: AppiumRequestOptions): Promise<T> {
  const url = `${APPIUM_URL}${opts.path}`;
  const res = await fetch(url, {
    method: opts.method || "GET",
    headers: { "Content-Type": "application/json" },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    signal: AbortSignal.timeout(APPIUM_TIMEOUT),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Appium ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export function sessionPath(suffix?: string): string {
  if (!currentSessionId) throw new Error("No active Appium session. Call appium_create_session first.");
  return `/session/${currentSessionId}${suffix ? suffix : ""}`;
}
