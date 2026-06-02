import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = (() => {
  try { return path.dirname(fileURLToPath(import.meta.url)); }
  catch { return __dirname; }
})();

config({ path: path.join(scriptDir, "..", "..", ".env") });

const pat = process.env.AZDO_PAT || "";
const org = process.env.AZDO_ORG || "";
const defaultProject = process.env.AZDO_PROJECT || "";

if (!pat) { console.error("Missing AZDO_PAT"); process.exit(1); }
if (!org) { console.error("Missing AZDO_ORG"); process.exit(1); }

const baseUrl = `https://dev.azure.com/${org}`;

export interface AzdoRequestOptions {
  method?: string;
  path: string;
  project?: string;
  params?: Record<string, string>;
  body?: unknown;
}

export async function azdoRequest<T>(opts: AzdoRequestOptions): Promise<T> {
  const project = opts.project || defaultProject;
  const prefix = project ? `${baseUrl}/${project}/_apis` : `${baseUrl}/_apis`;
  const url = new URL(`${prefix}/${opts.path}`);
  url.searchParams.set("api-version", "7.1");
  if (opts.params) {
    for (const [k, v] of Object.entries(opts.params)) url.searchParams.set(k, v);
  }

  const auth = Buffer.from(`:${pat}`).toString("base64");
  const res = await fetch(url.toString(), {
    method: opts.method || "GET",
    headers: { "Authorization": `Basic ${auth}`, "Content-Type": "application/json" },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Azure DevOps API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export function getOrg(): string { return org; }
export function getDefaultProject(): string { return defaultProject; }
