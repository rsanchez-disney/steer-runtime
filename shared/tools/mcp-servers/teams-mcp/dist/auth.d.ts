export interface TeamsTokens {
    nativeToken: string;
    chatToken: string;
}
/**
 * Opens a Playwright browser with persistent state.
 * First time: you log in to Teams. The session is saved to disk.
 * Next times: the saved session is reused — no login needed.
 */
export declare function authenticateViaBrowser(): Promise<TeamsTokens>;
