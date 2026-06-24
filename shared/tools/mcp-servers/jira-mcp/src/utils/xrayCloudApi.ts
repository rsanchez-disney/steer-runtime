/**
 * XRay Cloud API client — REST and GraphQL operations.
 */

import { getXrayCloudToken, getXrayCloudBaseUrl } from "./xrayCloudAuth.js";

async function headers(): Promise<Record<string, string>> {
    const token = await getXrayCloudToken();
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export async function xrayCloudPost(path: string, body: unknown): Promise<any> {
    const res = await fetch(`${getXrayCloudBaseUrl()}${path}`, {
        method: "POST",
        headers: await headers(),
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`XRay Cloud POST ${path} failed: ${res.status} — ${text}`);
    }
    const contentType = res.headers.get("content-type") || "";
    return contentType.includes("application/json") ? res.json() : res.text();
}

export async function xrayCloudGraphQL(query: string, variables?: Record<string, unknown>): Promise<any> {
    const res = await fetch(`${getXrayCloudBaseUrl()}/api/v2/graphql`, {
        method: "POST",
        headers: await headers(),
        body: JSON.stringify({ query, variables }),
    });
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
