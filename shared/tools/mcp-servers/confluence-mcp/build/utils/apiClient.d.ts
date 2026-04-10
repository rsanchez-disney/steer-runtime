export declare class ConfluenceApiClient {
    private confluenceUrl;
    private confluencePat;
    loadConfig(): Promise<void>;
    makeRequest(endpoint: string, options?: RequestInit): Promise<any>;
    getConfluenceUrl(): string;
    getConfluencePat(): string;
}
export declare const apiClient: ConfluenceApiClient;
/**
 * Strip Confluence storage format HTML to plain text.
 * Preserves structure with newlines for headings, lists, and paragraphs.
 */
export declare function stripHtmlToText(html: string): string;
/**
 * Truncate text to maxLength, appending a notice if truncated.
 */
export declare function truncateText(text: string, maxLength: number): string;
//# sourceMappingURL=apiClient.d.ts.map