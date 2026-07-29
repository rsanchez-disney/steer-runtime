/**
 * BlueDolphin API client — handles REST API and OData authentication,
 * rate limiting, and request execution.
 */
export interface BlueDolphinConfig {
    apiKey: string;
    tenant: string;
    region: "eu" | "us";
    useOData: boolean;
    odataUsername: string;
    odataPassword: string;
    rateLimitDelay?: number;
    maxRetries?: number;
    timeout?: number;
}
interface ApiResponse<T = unknown> {
    ok: boolean;
    status: number;
    data?: T;
    error?: string;
}
export declare class BlueDolphinClient {
    private config;
    private lastRequestTime;
    private rateLimitDelay;
    private maxRetries;
    private timeout;
    constructor(config: BlueDolphinConfig);
    /** REST API base URL */
    private get restBaseUrl();
    /** OData base URL */
    private get odataBaseUrl();
    /** Rate-limited fetch with retries */
    request<T = unknown>(method: string, path: string, body?: unknown): Promise<ApiResponse<T>>;
    /** Validate connection by hitting the liveness endpoint */
    validateConnection(): Promise<ApiResponse>;
    /** List objects with optional filters */
    listObjects(params?: {
        workspaceId?: string;
        objectTypeId?: string;
        limit?: number;
    }): Promise<ApiResponse>;
    /** Get a specific object by ID */
    getObject(objectId: string): Promise<ApiResponse>;
    /** Search objects by query */
    searchObjects(params: {
        query?: string;
        workspaceId?: string;
        objectTypeId?: string;
    }): Promise<ApiResponse>;
    /** List available workspaces */
    listWorkspaces(): Promise<ApiResponse>;
    /** List object type definitions */
    listObjectTypes(): Promise<ApiResponse>;
    /** List relations for an object */
    listRelations(objectId: string): Promise<ApiResponse>;
}
export {};
