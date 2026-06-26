/**
 * XRay Cloud authentication — client credentials → bearer token with caching.
 * Env vars: XRAY_CLOUD_CLIENT_ID, XRAY_CLOUD_CLIENT_SECRET
 */

const XRAY_CLOUD_BASE = "https://xray.cloud.getxray.app";
const TOKEN_URL = `${XRAY_CLOUD_BASE}/api/v2/authenticate`;

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export function isXrayCloudConfigured(): boolean {
    return !!(process.env.XRAY_CLOUD_CLIENT_ID && process.env.XRAY_CLOUD_CLIENT_SECRET);
}

export async function getXrayCloudToken(): Promise<string> {
    if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

    const clientId = process.env.XRAY_CLOUD_CLIENT_ID;
    const clientSecret = process.env.XRAY_CLOUD_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error("XRAY_CLOUD_CLIENT_ID and XRAY_CLOUD_CLIENT_SECRET are required for XRay Cloud tools.");
    }

    const res = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`XRay Cloud auth failed: ${res.status} — ${text}`);
    }

    // Response is a plain JWT string (quoted)
    const token = (await res.text()).replace(/^"|"$/g, "");
    cachedToken = token;
    // XRay Cloud tokens expire after ~1h; refresh at 50min
    tokenExpiresAt = Date.now() + 50 * 60 * 1000;
    return token;
}

export function getXrayCloudBaseUrl(): string {
    return XRAY_CLOUD_BASE;
}

export function invalidateXrayCloudToken(): void {
    cachedToken = null;
    tokenExpiresAt = 0;
}
