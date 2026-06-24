/**
 * XRay Cloud API client — REST and GraphQL operations.
 */

import { getXrayCloudToken, getXrayCloudBaseUrl, invalidateXrayCloudToken } from "./xrayCloudAuth.js";

const ISSUE_KEY_RE = /^[A-Z][A-Z0-9]+-\d+$/;

export function validateIssueKey(key: string, field = "issueKey"): void {
    if (!ISSUE_KEY_RE.test(key)) {
        throw new Error(`Invalid ${field}: "${key}" — expected format like PROJ-123`);
    }
}

async function headers(): Promise<Record<string, string>> {
    const token = await getXrayCloudToken();
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

async function fetchWithRetry(url: string, body: string): Promise<Response> {
    let res = await fetch(url, { method: "POST", headers: await headers(), body });
    if (res.status === 401) {
        invalidateXrayCloudToken();
        res = await fetch(url, { method: "POST", headers: await headers(), body });
    }
    return res;
}

export async function xrayCloudPost(path: string, body: unknown): Promise<any> {
    const res = await fetchWithRetry(`${getXrayCloudBaseUrl()}${path}`, JSON.stringify(body));
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`XRay Cloud POST ${path} failed: ${res.status} — ${text}`);
    }
    const contentType = res.headers.get("content-type") || "";
    return contentType.includes("application/json") ? res.json() : res.text();
}

export async function xrayCloudGraphQL(query: string, variables?: Record<string, unknown>): Promise<any> {
    const res = await fetchWithRetry(
        `${getXrayCloudBaseUrl()}/api/v2/graphql`,
        JSON.stringify({ query, variables }),
    );
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`XRay Cloud GraphQL failed: ${res.status} — ${text}`);
    }
    const json = await res.json();
    if (json.errors?.length) {
        throw new Error(`XRay Cloud GraphQL errors: ${JSON.stringify(json.errors)}`);
    }
    return json.data;
}
