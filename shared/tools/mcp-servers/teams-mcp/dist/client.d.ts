export type AuthMode = "client_credentials" | "device_code";
export type ApiMode = "graph" | "teams_native";
export interface TeamsConfig {
    tenantId: string;
    clientId: string;
    clientSecret?: string;
    authMode: AuthMode;
}
export declare class TeamsClient {
    private http;
    private nativeHttp;
    private chatHttp;
    private config;
    private accessToken;
    private chatToken;
    private refreshToken;
    private skypeToken;
    private tokenExpiry;
    private chatTokenExpiry;
    private apiMode;
    private chatServiceUrl;
    private pendingDeviceCode;
    private pendingPollInterval;
    private static readonly SCOPES;
    constructor(config: TeamsConfig);
    private loadCachedToken;
    private saveCachedToken;
    getApiMode(): ApiMode;
    isAuthenticated(): boolean;
    hasChatToken(): boolean;
    setChatTokenFromEnv(token: string): void;
    private getChatToken;
    setManualToken(token: string): Promise<{
        mode: ApiMode;
        error?: string;
    }>;
    private getToken;
    private getTokenClientCredentials;
    private getTokenDeviceCode;
    private getTokenRefresh;
    startDeviceCodeFlow(): Promise<{
        userCode: string;
        verificationUri: string;
        message: string;
    }>;
    pollDeviceCode(): Promise<{
        authenticated: boolean;
        error?: string;
    }>;
    private reauthInProgress;
    reauthenticateViaBrowser(): Promise<void>;
    /**
     * Wraps an async call with automatic retry on auth errors (401/403).
     */
    withAutoReauth<T>(fn: () => Promise<T>): Promise<T>;
    private nativeGet;
    private nativePost;
    listTeams(): Promise<any>;
    listChannels(teamId: string): Promise<any>;
    getChannel(teamId: string, channelId: string): Promise<any>;
    listMessages(teamId: string, channelId: string, top?: number, before?: string): Promise<any>;
    getMessage(teamId: string, channelId: string, messageId: string): Promise<any>;
    listReplies(teamId: string, channelId: string, messageId: string): Promise<any>;
    private buildNativeMessageBody;
    sendMessage(teamId: string, channelId: string, content: string): Promise<any>;
    replyToMessage(teamId: string, channelId: string, messageId: string, content: string): Promise<any>;
    listMembers(teamId: string): Promise<any>;
    listChats(top?: number): Promise<any>;
    listChatMessages(chatId: string, top?: number): Promise<any>;
    sendChatMessage(chatId: string, content: string): Promise<any>;
    reactToMessage(conversationId: string, messageId: string, emoji: string): Promise<any>;
}
