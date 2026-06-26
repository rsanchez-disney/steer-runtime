import { type ServiceNowCredentials } from "./auth.js";
export interface ServiceNowConfig {
    instanceUrl: string;
    sessionCookie: string;
    userToken: string;
}
export interface SNQueryParams {
    table: string;
    query?: string;
    fields?: string;
    limit?: number;
    offset?: number;
}
export declare class ServiceNowClient {
    private http;
    private instanceUrl;
    private reauthInProgress;
    constructor(config: ServiceNowConfig);
    private buildHttp;
    /**
     * Updates the HTTP client with fresh credentials.
     */
    updateCredentials(creds: ServiceNowCredentials): void;
    /**
     * Re-authenticates via browser. Only one reauth runs at a time —
     * concurrent callers wait for the same promise.
     */
    private reauthenticate;
    /**
     * Wraps an HTTP call with automatic retry on 401/403.
     */
    private withAutoReauth;
    getRecords(params: SNQueryParams): Promise<any>;
    getRecord(table: string, sysId: string): Promise<any>;
    createRecord(table: string, data: Record<string, unknown>): Promise<any>;
    updateRecord(table: string, sysId: string, data: Record<string, unknown>): Promise<any>;
    /**
     * Fetches journal entries (comments and/or work_notes) for a record
     * using sys_history_line, which is where this ServiceNow instance
     * stores the full journal history.
     *
     * Deduplicates by journal_sysid to avoid repeated entries across
     * multiple history sets.
     *
     * @param sysId - The sys_id of the parent record
     * @param element - "comments", "work_notes", or "all" for both
     * @param limit - Max entries to return (default 50)
     */
    getJournalEntries(sysId: string, element?: "comments" | "work_notes" | "all", limit?: number): Promise<{
        type: string;
        text: string;
        author: string;
        author_id: string;
        timestamp: string;
    }[]>;
}
