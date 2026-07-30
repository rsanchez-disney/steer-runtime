/**
 * SonarQube API client — handles authentication, rate limiting, and request execution.
 */
export interface SonarQubeConfig {
    url: string;
    token: string;
    organization?: string;
    timeout?: number;
}
interface ApiResponse<T = unknown> {
    ok: boolean;
    status: number;
    data?: T;
    error?: string;
}
export declare class SonarQubeClient {
    private config;
    private timeout;
    constructor(config: SonarQubeConfig);
    private get baseUrl();
    private get authHeader();
    request<T = unknown>(path: string, params?: Record<string, string>): Promise<ApiResponse<T>>;
    /** Validate connection */
    validate(): Promise<ApiResponse>;
    /** Search issues (bugs, vulnerabilities, code smells) */
    getIssues(params: {
        projectKey?: string;
        componentKeys?: string;
        severities?: string;
        types?: string;
        statuses?: string;
        pageSize?: number;
        page?: number;
    }): Promise<ApiResponse>;
    /** Get component measures (coverage, bugs, debt, etc.) */
    getMeasures(params: {
        component: string;
        metricKeys: string;
    }): Promise<ApiResponse>;
    /** Search security hotspots */
    getHotspots(params: {
        projectKey: string;
        status?: string;
        pageSize?: number;
    }): Promise<ApiResponse>;
    /** List projects */
    listProjects(params?: {
        query?: string;
        pageSize?: number;
    }): Promise<ApiResponse>;
    /** Get quality gate status */
    getQualityGate(params: {
        projectKey: string;
    }): Promise<ApiResponse>;
    /** Get source code with annotations */
    getSource(params: {
        key: string;
        from?: number;
        to?: number;
    }): Promise<ApiResponse>;
}
export {};
