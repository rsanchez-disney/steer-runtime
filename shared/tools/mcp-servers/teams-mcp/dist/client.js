import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { authenticateViaBrowser } from "./auth.js";
const TOKEN_CACHE_DIR = path.join(os.homedir(), ".mcp-teams");
const TOKEN_CACHE_FILE = path.join(TOKEN_CACHE_DIR, "token-cache.json");
const BROWSER_STATE_DIR = path.join(TOKEN_CACHE_DIR, "browser-state");
export class TeamsClient {
    http;
    nativeHttp;
    chatHttp; // separate http client for chat/message operations
    config;
    accessToken = null;
    chatToken = null; // dedicated token for chatsvc endpoints
    refreshToken = null;
    skypeToken = null;
    tokenExpiry = 0;
    chatTokenExpiry = 0;
    apiMode = "graph";
    chatServiceUrl = "https://teams.microsoft.com/api/csa";
    // Pending device code flow state
    pendingDeviceCode = null;
    pendingPollInterval = 5;
    static SCOPES = [
        "Team.ReadBasic.All", "Channel.ReadBasic.All",
        "ChannelMessage.Read.All", "ChannelMessage.Send",
        "TeamMember.Read.All", "Chat.Read", "Chat.ReadWrite",
        "User.Read", "offline_access",
    ].join(" ");
    constructor(config) {
        this.config = config;
        this.http = axios.create({
            baseURL: "https://graph.microsoft.com/v1.0",
            headers: { "Content-Type": "application/json" },
        });
        this.http.interceptors.request.use(async (req) => {
            const token = await this.getToken();
            req.headers.Authorization = `Bearer ${token}`;
            return req;
        });
        this.nativeHttp = axios.create({
            headers: { "Content-Type": "application/json" },
        });
        this.nativeHttp.interceptors.request.use(async (req) => {
            const token = await this.getToken();
            req.headers.Authorization = `Bearer ${token}`;
            if (this.skypeToken) {
                req.headers["x-skypetoken"] = this.skypeToken;
            }
            return req;
        });
        // Separate HTTP client for chat/message endpoints using chatToken
        this.chatHttp = axios.create({
            headers: { "Content-Type": "application/json" },
        });
        this.chatHttp.interceptors.request.use(async (req) => {
            const token = this.getChatToken();
            req.headers.Authorization = `Bearer ${token}`;
            if (this.skypeToken) {
                req.headers["x-skypetoken"] = this.skypeToken;
            }
            return req;
        });
        this.loadCachedToken();
    }
    // --- Token cache ---
    loadCachedToken() {
        try {
            if (fs.existsSync(TOKEN_CACHE_FILE)) {
                const data = JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, "utf-8"));
                if (data.expires_at > Date.now()) {
                    this.accessToken = data.access_token;
                    this.refreshToken = data.refresh_token ?? null;
                    this.skypeToken = data.skype_token ?? null;
                    this.apiMode = data.api_mode ?? "graph";
                    this.chatServiceUrl = data.chat_service_url ?? "https://teams.microsoft.com/api/csa";
                    this.tokenExpiry = data.expires_at;
                }
                else if (data.refresh_token) {
                    this.refreshToken = data.refresh_token;
                }
            }
        }
        catch { /* ignore */ }
    }
    saveCachedToken() {
        try {
            if (!fs.existsSync(TOKEN_CACHE_DIR)) {
                fs.mkdirSync(TOKEN_CACHE_DIR, { recursive: true, mode: 0o700 });
            }
            const data = {
                access_token: this.accessToken,
                refresh_token: this.refreshToken ?? undefined,
                skype_token: this.skypeToken ?? undefined,
                api_mode: this.apiMode,
                chat_service_url: this.chatServiceUrl,
                expires_at: this.tokenExpiry,
            };
            fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(data), { mode: 0o600 });
        }
        catch { /* non-critical */ }
    }
    // --- Auth flows ---
    getApiMode() { return this.apiMode; }
    isAuthenticated() {
        return this.accessToken !== null && Date.now() < this.tokenExpiry;
    }
    /**
     * Resets all authentication state by deleting cached tokens and browser state.
     * Use this when auth is in a broken/stale state and a clean re-auth is needed.
     */
    resetAuth() {
        const result = { tokenCacheDeleted: false, browserStateDeleted: false, memoryCleared: false };
        // 1. Delete the token cache file
        try {
            if (fs.existsSync(TOKEN_CACHE_FILE)) {
                fs.unlinkSync(TOKEN_CACHE_FILE);
                result.tokenCacheDeleted = true;
            }
        }
        catch (err) {
            process.stderr.write(`[mcp-teams] Warning: could not delete token cache: ${err}\n`);
        }
        // 2. Delete the browser state directory recursively
        try {
            if (fs.existsSync(BROWSER_STATE_DIR)) {
                fs.rmSync(BROWSER_STATE_DIR, { recursive: true, force: true });
                result.browserStateDeleted = true;
            }
        }
        catch (err) {
            process.stderr.write(`[mcp-teams] Warning: could not delete browser state: ${err}\n`);
        }
        // 3. Clear all in-memory tokens
        this.accessToken = null;
        this.chatToken = null;
        this.refreshToken = null;
        this.skypeToken = null;
        // 4. Reset token expiry timestamps
        this.tokenExpiry = 0;
        this.chatTokenExpiry = 0;
        result.memoryCleared = true;
        process.stderr.write(`[mcp-teams] Auth reset complete — cache: ${result.tokenCacheDeleted}, browser: ${result.browserStateDeleted}, memory: ${result.memoryCleared}\n`);
        return result;
    }
    hasChatToken() {
        return this.chatToken !== null && Date.now() < this.chatTokenExpiry;
    }
    setChatTokenFromEnv(token) {
        const rawToken = token.replace(/^Bearer\s+/i, "");
        this.chatToken = rawToken;
        try {
            const payload = JSON.parse(Buffer.from(rawToken.split(".")[1], "base64").toString());
            this.chatTokenExpiry = payload.exp ? payload.exp * 1000 - 60000 : Date.now() + 55 * 60 * 1000;
        }
        catch {
            this.chatTokenExpiry = Date.now() + 55 * 60 * 1000;
        }
    }
    getChatToken() {
        // Prefer dedicated chat token, fall back to main token
        if (this.chatToken && Date.now() < this.chatTokenExpiry)
            return this.chatToken;
        if (this.accessToken && Date.now() < this.tokenExpiry)
            return this.accessToken;
        throw new Error("AUTH_REQUIRED: No chat token available. Set TEAMS_CHAT_TOKEN env var or use 'auth_login'.");
    }
    async setManualToken(token) {
        const rawToken = token.replace(/^Bearer\s+/i, "");
        // Decode JWT
        let audience = "";
        try {
            const payload = JSON.parse(Buffer.from(rawToken.split(".")[1], "base64").toString());
            audience = payload.aud || "";
            this.tokenExpiry = payload.exp ? payload.exp * 1000 - 60000 : Date.now() + 55 * 60 * 1000;
        }
        catch {
            this.tokenExpiry = Date.now() + 55 * 60 * 1000;
        }
        // If already a Graph token, use directly
        if (audience.includes("graph.microsoft.com") || audience === "00000003-0000-0000-c000-000000000000") {
            this.accessToken = rawToken;
            this.apiMode = "graph";
            this.refreshToken = null;
            this.saveCachedToken();
            return { mode: "graph" };
        }
        // Teams token: try to get authz data (skype token + region URLs)
        this.accessToken = rawToken;
        this.refreshToken = null;
        try {
            const authzRes = await axios.post("https://authsvc.teams.microsoft.com/v1.0/authz", {}, { headers: { Authorization: `Bearer ${rawToken}` } });
            const data = authzRes.data;
            // Try to find a Graph token
            if (data?.tokens) {
                const graphEntry = Object.entries(data.tokens).find(([_k, v]) => v?.tokenValue && (v?.resourceId?.includes("graph") || _k.toLowerCase().includes("graph")));
                if (graphEntry) {
                    this.accessToken = graphEntry[1].tokenValue;
                    this.apiMode = "graph";
                    this.saveCachedToken();
                    return { mode: "graph" };
                }
            }
            // Extract skype token and region URLs for native mode
            this.skypeToken = data?.tokens?.skypeToken?.tokenValue || null;
            this.chatServiceUrl = data?.regionGtms?.middleTier
                || data?.regionGtms?.chatService
                || "https://teams.microsoft.com/api/csa";
        }
        catch { /* authz failed, try native without skype token */ }
        this.apiMode = "teams_native";
        this.saveCachedToken();
        return { mode: "teams_native" };
    }
    async getToken() {
        if (this.accessToken && Date.now() < this.tokenExpiry)
            return this.accessToken;
        if (this.config.authMode === "client_credentials")
            return this.getTokenClientCredentials();
        if (this.refreshToken) {
            try {
                return await this.getTokenRefresh();
            }
            catch { /* fall through */ }
        }
        return this.getTokenDeviceCode();
    }
    async getTokenClientCredentials() {
        const url = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`;
        const res = await axios.post(url, new URLSearchParams({
            client_id: this.config.clientId, client_secret: this.config.clientSecret,
            scope: "https://graph.microsoft.com/.default", grant_type: "client_credentials",
        }).toString(), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
        this.accessToken = res.data.access_token;
        this.tokenExpiry = Date.now() + (res.data.expires_in - 60) * 1000;
        this.apiMode = "graph";
        this.saveCachedToken();
        return this.accessToken;
    }
    async getTokenDeviceCode() {
        throw new Error("AUTH_REQUIRED: Not authenticated. Use 'auth_login' or 'auth_token'.");
    }
    async getTokenRefresh() {
        const url = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`;
        const res = await axios.post(url, new URLSearchParams({
            client_id: this.config.clientId, grant_type: "refresh_token", refresh_token: this.refreshToken,
        }).toString(), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
        this.accessToken = res.data.access_token;
        this.refreshToken = res.data.refresh_token ?? this.refreshToken;
        this.tokenExpiry = Date.now() + (res.data.expires_in - 60) * 1000;
        this.saveCachedToken();
        return this.accessToken;
    }
    async startDeviceCodeFlow() {
        const url = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/devicecode`;
        const codeRes = await axios.post(url, new URLSearchParams({
            client_id: this.config.clientId, scope: TeamsClient.SCOPES,
        }).toString(), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
        const { device_code, user_code, verification_uri, interval, message } = codeRes.data;
        this.pendingDeviceCode = device_code;
        this.pendingPollInterval = interval || 5;
        return { userCode: user_code, verificationUri: verification_uri, message };
    }
    async pollDeviceCode() {
        if (!this.pendingDeviceCode)
            return { authenticated: false, error: "No pending flow." };
        const tokenUrl = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`;
        for (let i = 0; i < 60; i++) {
            try {
                const res = await axios.post(tokenUrl, new URLSearchParams({
                    client_id: this.config.clientId,
                    grant_type: "urn:ietf:params:oauth:grant-type:device_code",
                    device_code: this.pendingDeviceCode,
                }).toString(), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
                this.accessToken = res.data.access_token;
                this.refreshToken = res.data.refresh_token ?? null;
                this.tokenExpiry = Date.now() + (res.data.expires_in - 60) * 1000;
                this.apiMode = "graph";
                this.pendingDeviceCode = null;
                this.saveCachedToken();
                return { authenticated: true };
            }
            catch (err) {
                const error = err.response?.data?.error;
                if (error === "authorization_pending") {
                    await new Promise(r => setTimeout(r, this.pendingPollInterval * 1000));
                    continue;
                }
                if (error === "slow_down") {
                    await new Promise(r => setTimeout(r, 10000));
                    continue;
                }
                this.pendingDeviceCode = null;
                return { authenticated: false, error: err.response?.data?.error_description || error };
            }
        }
        return { authenticated: false, error: "Timeout." };
    }
    // ============================================================
    // Browser-based re-authentication
    // ============================================================
    reauthInProgress = null;
    async reauthenticateViaBrowser() {
        if (this.reauthInProgress)
            return this.reauthInProgress;
        this.reauthInProgress = (async () => {
            process.stderr.write("[mcp-teams] Opening browser for re-authentication...\n");
            try {
                const tokens = await authenticateViaBrowser();
                if (tokens.nativeToken) {
                    await this.setManualToken(tokens.nativeToken);
                    process.stderr.write("[mcp-teams] Native token refreshed via browser\n");
                }
                if (tokens.chatToken) {
                    this.setChatTokenFromEnv(tokens.chatToken);
                    process.stderr.write("[mcp-teams] Chat token refreshed via browser\n");
                }
            }
            catch (err) {
                const errMsg = err.message || String(err);
                const isStaleStateError = errMsg.includes("auth") ||
                    errMsg.includes("login") ||
                    errMsg.includes("session") ||
                    errMsg.includes("401") ||
                    errMsg.includes("403") ||
                    errMsg.includes("timeout") ||
                    errMsg.includes("navigation") ||
                    errMsg.includes("Target closed") ||
                    errMsg.includes("browser") ||
                    errMsg.includes("context");
                if (isStaleStateError) {
                    process.stderr.write(`[mcp-teams] Browser auth failed (likely stale state): ${errMsg}\n` +
                        `[mcp-teams] Resetting auth and retrying with clean state...\n`);
                    this.resetAuth();
                    // Retry once with clean state
                    try {
                        const tokens = await authenticateViaBrowser();
                        if (tokens.nativeToken) {
                            await this.setManualToken(tokens.nativeToken);
                            process.stderr.write("[mcp-teams] Native token refreshed via browser (retry succeeded)\n");
                        }
                        if (tokens.chatToken) {
                            this.setChatTokenFromEnv(tokens.chatToken);
                            process.stderr.write("[mcp-teams] Chat token refreshed via browser (retry succeeded)\n");
                        }
                    }
                    catch (retryErr) {
                        process.stderr.write(`[mcp-teams] Browser auth retry also failed: ${retryErr.message}\n`);
                        throw retryErr;
                    }
                }
                else {
                    throw err;
                }
            }
            finally {
                this.reauthInProgress = null;
            }
        })();
        return this.reauthInProgress;
    }
    /**
     * Wraps an async call with automatic retry on auth errors (401/403).
     */
    async withAutoReauth(fn) {
        try {
            return await fn();
        }
        catch (err) {
            const axErr = err;
            const status = axErr.response?.status;
            const msg = err.message || "";
            if (status === 401 || status === 403 || msg.includes("AUTH_REQUIRED")) {
                await this.reauthenticateViaBrowser();
                return fn();
            }
            throw err;
        }
    }
    // ============================================================
    // API Methods — dual mode (Graph API or Teams native)
    // ============================================================
    async nativeGet(path, params) {
        return this.nativeHttp.get(`${this.chatServiceUrl}${path}`, { params });
    }
    async nativePost(path, body) {
        return this.nativeHttp.post(`${this.chatServiceUrl}${path}`, body);
    }
    // --- Teams ---
    async listTeams() {
        return this.withAutoReauth(async () => {
            if (this.apiMode === "graph") {
                const res = await this.http.get("/me/joinedTeams", { params: { $select: "id,displayName,description" } });
                return res.data.value;
            }
            // Native: use the Teams user endpoint
            const endpoints = [
                "https://teams.microsoft.com/api/csa/api/v1/teams/users/me?isPrefetch=false&enableMembershipSummary=true",
                "https://teams.microsoft.com/api/csa/emea/api/v1/teams/users/me?isPrefetch=false&enableMembershipSummary=true",
            ];
            for (const url of endpoints) {
                try {
                    const res = await this.nativeHttp.get(url);
                    const teams = res.data?.value || res.data?.teams || res.data;
                    if (Array.isArray(teams)) {
                        return teams.map((t) => ({
                            id: t.teamId || t.id || t.threadId,
                            displayName: t.displayName || t.teamName || t.name,
                            description: t.description || "",
                            _raw: t, // keep raw data to inspect structure
                        }));
                    }
                    return res.data;
                }
                catch {
                    continue;
                }
            }
            throw new Error("Could not list teams. All native endpoints failed.");
        });
    }
    // --- Channels ---
    async listChannels(teamId) {
        return this.withAutoReauth(async () => {
            if (this.apiMode === "graph") {
                const res = await this.http.get(`/teams/${teamId}/channels`);
                return res.data.value;
            }
            // Native: try multiple known endpoints
            const endpoints = [
                `https://teams.microsoft.com/api/csa/api/v2/teams/${teamId}/channels`,
                `https://teams.microsoft.com/api/csa/api/v1/teams/${teamId}/channels`,
            ];
            for (const url of endpoints) {
                try {
                    const res = await this.nativeHttp.get(url);
                    const channels = res.data?.value || res.data?.channels || res.data;
                    if (Array.isArray(channels)) {
                        return channels.map((c) => ({
                            id: c.id || c.channelId || c.threadId,
                            displayName: c.displayName || c.name,
                            description: c.description || "",
                            membershipType: c.membershipType || c.channelType || "",
                        }));
                    }
                    return res.data;
                }
                catch {
                    continue;
                }
            }
            throw new Error("Could not list channels. All native endpoints failed.");
        });
    }
    async getChannel(teamId, channelId) {
        if (this.apiMode === "graph") {
            const res = await this.http.get(`/teams/${teamId}/channels/${channelId}`);
            return res.data;
        }
        const channels = await this.listChannels(teamId);
        if (Array.isArray(channels)) {
            return channels.find((c) => c.id === channelId || c.channelId === channelId) || null;
        }
        return null;
    }
    // --- Messages ---
    async listMessages(teamId, channelId, top = 20, before) {
        return this.withAutoReauth(async () => {
            if (this.apiMode === "graph") {
                const params = { $top: top, $orderby: "lastModifiedDateTime desc" };
                if (before) {
                    params.$filter = `lastModifiedDateTime lt ${before}`;
                }
                const res = await this.http.get(`/teams/${teamId}/channels/${channelId}/messages`, { params });
                return res.data.value;
            }
            // Native: use chatsvc endpoint (the real Teams Web API for messages)
            const encodedChannelId = encodeURIComponent(channelId);
            const nativeParams = { view: "msnp24Equivalent|supportsMessageProperties", pageSize: String(top) };
            if (before) {
                nativeParams.startTime = before;
            }
            const res = await this.chatHttp.get(`https://teams.microsoft.com/api/chatsvc/amer/v1/users/ME/conversations/${encodedChannelId}/messages`, { params: nativeParams });
            return res.data?.messages || res.data?.value || res.data;
        });
    }
    async getMessage(teamId, channelId, messageId) {
        if (this.apiMode === "graph") {
            const res = await this.http.get(`/teams/${teamId}/channels/${channelId}/messages/${messageId}`);
            return res.data;
        }
        const messages = await this.listMessages(teamId, channelId, 50);
        if (Array.isArray(messages)) {
            return messages.find((m) => m.id === messageId || m.messageId === messageId) || null;
        }
        return null;
    }
    async listReplies(teamId, channelId, messageId) {
        if (this.apiMode === "graph") {
            const res = await this.http.get(`/teams/${teamId}/channels/${channelId}/messages/${messageId}/replies`);
            return res.data.value;
        }
        // Native: use chatsvc with messageid in conversation path
        const conversationId = encodeURIComponent(`${channelId};messageid=${messageId}`);
        const res = await this.chatHttp.get(`https://teams.microsoft.com/api/chatsvc/amer/v1/users/ME/conversations/${conversationId}/messages`, { params: { view: "msnp24Equivalent|supportsMessageProperties", pageSize: "50" } });
        return res.data?.messages || res.data?.value || res.data;
    }
    buildNativeMessageBody(conversationId, content) {
        const now = new Date().toISOString();
        const clientMsgId = String(Date.now()) + String(Math.floor(Math.random() * 1000000));
        // Extract user OID from token
        let userOid = "";
        try {
            const payload = JSON.parse(Buffer.from(this.accessToken.split(".")[1], "base64").toString());
            userOid = payload.oid || "";
        }
        catch { /* ignore */ }
        return {
            content: content.startsWith("<") ? content : `<p>${content}</p>`,
            messagetype: "RichText/Html",
            contenttype: "Text",
            clientmessageid: clientMsgId,
            imdisplayname: "",
            composetime: now,
            originalarrivaltime: now,
            from: `8:orgid:${userOid}`,
            fromUserId: `8:orgid:${userOid}`,
            conversationid: conversationId,
            conversationLink: `https://teams.microsoft.com/api/chatsvc/amer/v1/users/ME/conversations/${conversationId}`,
            type: "Message",
            id: "-1",
            version: "0",
            state: 0,
            amsreferences: [],
            crossPostChannels: [],
            properties: {
                importance: "",
                subject: "",
                title: "",
                cards: "[]",
                links: "[]",
                mentions: "[]",
                files: "[]",
                formatVariant: "TEAMS",
                onbehalfof: null,
                policyViolation: null,
            },
        };
    }
    async sendMessage(teamId, channelId, content) {
        if (this.apiMode === "graph") {
            const res = await this.http.post(`/teams/${teamId}/channels/${channelId}/messages`, {
                body: { contentType: "html", content },
            });
            return res.data;
        }
        const encodedChannelId = encodeURIComponent(channelId);
        const body = this.buildNativeMessageBody(channelId, content);
        const res = await this.chatHttp.post(`https://teams.microsoft.com/api/chatsvc/amer/v1/users/ME/conversations/${encodedChannelId}/messages`, body);
        return res.data;
    }
    async replyToMessage(teamId, channelId, messageId, content) {
        if (this.apiMode === "graph") {
            const res = await this.http.post(`/teams/${teamId}/channels/${channelId}/messages/${messageId}/replies`, {
                body: { contentType: "html", content },
            });
            return res.data;
        }
        // Native: replies go to the conversation thread (channelId;messageid=messageId)
        const threadId = `${channelId};messageid=${messageId}`;
        const encodedThreadId = encodeURIComponent(threadId);
        const body = this.buildNativeMessageBody(threadId, content);
        const res = await this.chatHttp.post(`https://teams.microsoft.com/api/chatsvc/amer/v1/users/ME/conversations/${encodedThreadId}/messages`, body);
        return res.data;
    }
    // --- Members ---
    async listMembers(teamId) {
        if (this.apiMode === "graph") {
            const res = await this.http.get(`/teams/${teamId}/members`);
            return res.data.value;
        }
        const res = await this.nativeHttp.get(`https://teams.microsoft.com/api/csa/api/v1/teams/${teamId}/members`);
        return res.data?.members || res.data?.value || res.data;
    }
    // --- Chats ---
    async listChats(top = 20) {
        return this.withAutoReauth(async () => {
            if (this.apiMode === "graph") {
                const res = await this.http.get("/me/chats", { params: { $top: top } });
                return res.data.value;
            }
            // Native: try multiple regional endpoints for conversations/chats
            const endpoints = [
                "https://teams.microsoft.com/api/csa/amer/api/v2/conversations",
                "https://teams.microsoft.com/api/csa/emea/api/v2/conversations",
                "https://teams.microsoft.com/api/csa/api/v2/conversations",
                "https://teams.microsoft.com/api/chatsvc/amer/v1/users/ME/conversations",
                "https://teams.microsoft.com/api/chatsvc/emea/v1/users/ME/conversations",
                "https://amer.ng.msg.teams.microsoft.com/v1/users/ME/conversations",
                "https://emea.ng.msg.teams.microsoft.com/v1/users/ME/conversations",
            ];
            for (const url of endpoints) {
                try {
                    const res = await this.chatHttp.get(url, { params: { pageSize: String(top), view: "msnp24Equivalent|supportsMessageProperties" } });
                    const data = res.data?.chats || res.data?.conversations || res.data?.value || res.data;
                    if (data)
                        return data;
                }
                catch {
                    continue;
                }
            }
            throw new Error("Could not list chats. All native endpoints failed.");
        });
    }
    async listChatMessages(chatId, top = 20) {
        if (this.apiMode === "graph") {
            const res = await this.http.get(`/chats/${chatId}/messages`, { params: { $top: top } });
            return res.data.value;
        }
        const encodedChatId = encodeURIComponent(chatId);
        const res = await this.chatHttp.get(`https://teams.microsoft.com/api/chatsvc/amer/v1/users/ME/conversations/${encodedChatId}/messages`, { params: { view: "msnp24Equivalent|supportsMessageProperties", pageSize: String(top) } });
        return res.data?.messages || res.data?.value || res.data;
    }
    async sendChatMessage(chatId, content) {
        if (this.apiMode === "graph") {
            const res = await this.http.post(`/chats/${chatId}/messages`, {
                body: { contentType: "html", content },
            });
            return res.data;
        }
        const encodedChatId = encodeURIComponent(chatId);
        const body = this.buildNativeMessageBody(chatId, content);
        const res = await this.chatHttp.post(`https://teams.microsoft.com/api/chatsvc/amer/v1/users/ME/conversations/${encodedChatId}/messages`, body);
        return res.data;
    }
    // --- Reactions ---
    async reactToMessage(conversationId, messageId, emoji) {
        if (this.apiMode === "graph") {
            throw new Error("Reactions are not supported via Graph API. Use native token.");
        }
        const encodedConvId = encodeURIComponent(conversationId);
        const res = await this.chatHttp.put(`https://teams.microsoft.com/api/chatsvc/amer/v1/users/ME/conversations/${encodedConvId}/messages/${messageId}/properties?name=emotions`, { emotions: { key: emoji, value: Date.now() } });
        return res.data;
    }
}
