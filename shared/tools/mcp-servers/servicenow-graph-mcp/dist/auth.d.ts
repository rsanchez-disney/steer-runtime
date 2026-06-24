export interface ServiceNowCredentials {
    sessionCookie: string;
    userToken: string;
}
/**
 * Opens a Playwright browser with persistent state.
 * First time: you log in via SSO. The session is saved to disk.
 * Next times: the saved session is reused — no login needed.
 * If the session expires, SSO page appears again, you log in, and it's saved.
 */
export declare function authenticateViaBrowser(instanceUrl: string): Promise<ServiceNowCredentials>;
