import type { JiraTicket } from "./types.js";
import { JiraAuth } from "./auth.js";
const USER_AGENT = `JiraMCP/0.1.0 (${process.env.MCP_USER_AGENT_CONTACT || "steer-runtime"}) ${process.env.MCP_USER_AGENT_ENV || "local-dev nonprod"}`;

function dedup<T>(existing: T[], incoming: T[], key: (t: T) => string): T[] {
    const seen = new Set(existing.map(key));
    return [...existing, ...incoming.filter(i => !seen.has(key(i)))];
}

/** Wrap plain text in Atlassian Document Format (required by Jira Cloud API v3). */
function toADF(text: string): object {
    return {
        type: "doc",
        version: 1,
        content: [{ type: "paragraph", content: [{ type: "text", text }] }],
    };
}

export class JiraApiClient {
    auth = new JiraAuth();

    private static fieldCache: Map<string, string> | null = null;

    /** Centralized fetch with User-Agent header for Atlassian compliance. */
    private async fetch(url: string, options: RequestInit = {}): Promise<Response> {
        const headers = options.headers as Record<string, string> || {};
        return fetch(url, { ...options, headers: { ...headers, "User-Agent": USER_AGENT } });
    }


    /** Resolves custom field names to IDs. Caches the field list on first call. */
    async resolveCustomFields(): Promise<string[]> {
        const raw = this.auth.getRawCustomFields();
        if (raw.length === 0) return [];

        // If all entries are already IDs, skip resolution
        if (raw.every(f => f.startsWith("customfield_"))) return raw;

        // Fetch field metadata once
        if (!JiraApiClient.fieldCache) {
            try {
                const response = await this.fetch(
                    `${this.baseUrl}/rest/api/${this.auth.apiVersion()}/field`,
                    { headers: { Authorization: await this.auth.getAuthHeader() } },
                );
                if (response.ok) {
                    const fields: Array<{ id: string; name: string }> = await response.json();
                    JiraApiClient.fieldCache = new Map();
                    for (const f of fields) {
                        JiraApiClient.fieldCache.set(f.name.toLowerCase(), f.id);
                    }
                } else {
                    JiraApiClient.fieldCache = new Map();
                }
            } catch {
                JiraApiClient.fieldCache = new Map();
            }
        }

        // Resolve names to IDs
        return raw.map(entry => {
            if (entry.startsWith("customfield_")) return entry;
            const id = JiraApiClient.fieldCache!.get(entry.toLowerCase());
            if (id) return id;
            console.error(`Custom field "${entry}" not found — skipping`);
            return "";
        }).filter(f => f.length > 0);
    }

    private get baseUrl(): string {
        return this.auth.getBaseUrl();
    }

    async fetchJiraTicket(
        ticketId: string,
        fields?: string[],
    ): Promise<JiraTicket> {

        const defaultFields = [
            "summary",
            "description",
            "status",
            "assignee",
            "reporter",
            "priority",
            "created",
            "updated",
            "comment",
            "issuetype",
            "parent",
            "components",
            "subtasks",
            "labels",
            "issuelinks",
            "fixVersions",
        ];
        const requestedFields = fields || [...defaultFields, ...await this.resolveCustomFields()];

        const response = await this.fetch(
            `${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issue/${ticketId}?fields=${requestedFields.join(",")}`,
            {
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch JIRA ticket: ${response.status} ${response.statusText}`,
            );
        }

        const result = await response.json();
        console.error(
            "Fetched ticket fields:",
            Object.keys(result.fields || {}),
        );
        return result;
    }

    async updateJiraTicket(ticketId: string, updates: any): Promise<void> {

        // Separate native fields that require the update section (bypasses screen scheme)
        const { fixVersions, duedate, ...fields } = updates;
        const updateSection: any = {};
        if (fixVersions !== undefined) updateSection.fixVersions = [{ set: fixVersions }];
        if (duedate !== undefined) updateSection.duedate = [{ set: duedate }];

        const body: any = {};
        if (Object.keys(fields).length > 0) body.fields = fields;
        if (Object.keys(updateSection).length > 0) body.update = updateSection;

        console.error(
            "Updating JIRA ticket:",
            JSON.stringify(body, null, 2),
        );

        const response = await this.fetch(
            `${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issue/${ticketId}`,
            {
                method: "PUT",
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("JIRA API Error Response:", errorText);
            throw new Error(
                `Failed to update JIRA ticket: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        console.error("JIRA update successful");
    }

    async transitionJiraTicket(
        ticketId: string,
        transitionId: string,
    ): Promise<void> {

        const response = await this.fetch(
            `${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issue/${ticketId}/transitions`,
            {
                method: "POST",
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ transition: { id: transitionId } }),
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to transition JIRA ticket: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }
    }

    async getJiraTransitions(ticketId: string): Promise<any> {

        const response = await this.fetch(
            `${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issue/${ticketId}/transitions`,
            {
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            throw new Error(
                `Failed to get JIRA transitions: ${response.status} ${response.statusText}`,
            );
        }

        return await response.json();
    }

    async addJiraComment(ticketId: string, comment: string): Promise<any> {

        const response = await this.fetch(
            `${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issue/${ticketId}/comment`,
            {
                method: "POST",
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ body: this.auth.isCloud() ? toADF(comment) : comment }),
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to add comment to JIRA ticket: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        return await response.json();
    }

    async searchJiraIssues(
        jql: string,
        maxResults: number = 50,
        startAt: number = 0,
        extraFields: string[] = [],
    ): Promise<any> {

        const baseFields = [
            "summary",
            "status",
            "assignee",
            "reporter",
            "priority",
            "issuetype",
            "project",
            "created",
            "updated",
        ];
        const fields = [...new Set([...baseFields, ...extraFields])];

        const response = await this.fetch(
            `${this.baseUrl}/rest/api/${this.auth.apiVersion()}/search`,
            {
                method: "POST",
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    jql,
                    maxResults,
                    startAt,
                    fields,
                }),
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to search JIRA issues: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        return await response.json();
    }

    async createJiraIssue(opts: {
        projectKey: string;
        summary: string;
        issueType: string;
        description?: string;
        assignee?: string;
        reporter?: string;
        epicLink?: string;
        components?: string[];
        labels?: string[];
        sprint?: string;
        storyPoints?: number;
        customFields?: Record<string, unknown>;
        parent?: string;
    }): Promise<any> {
        const {
            projectKey, summary, issueType, description, assignee,
            reporter, epicLink, components, labels, sprint,
            storyPoints, customFields, parent,
        } = opts;

        const fields: any = {
            project: { key: projectKey },
            summary,
            issuetype: { name: issueType },
        };

        if (parent) {
            fields.parent = { key: parent };
        }

        if (description) {
            fields.description = this.auth.isCloud() ? toADF(description) : description;
        }

        if (assignee) {
            fields.assignee = this.auth.isCloud() ? { accountId: assignee } : { name: assignee };
        }

        if (reporter) {
            fields.reporter = this.auth.isCloud() ? { accountId: reporter } : { name: reporter };
        }

        // Epic Link is NOT included in create fields — many projects block it via screen schemes.
        // Instead, we assign to epic via Agile API after creation (see below).

        if (storyPoints !== undefined) {
            const { resolveCustomFieldIds } = await import("./customFields.js");
            const resolved = resolveCustomFieldIds(["storyPoints"]);
            if (resolved.length > 0) {
                fields[resolved[0]] = storyPoints;
            }
        }

        if (components && components.length > 0) {
            fields.components = components.map((name) => ({ name }));
        }

        if (labels && labels.length > 0) {
            fields.labels = labels;
        }

        if (sprint) {
            // Sprint is typically customfield_10003 but resolve via alias system
            const { resolveCustomFieldIds } = await import("./customFields.js");
            const resolved = resolveCustomFieldIds(["sprint"]);
            if (resolved.length > 0) {
                fields[resolved[0]] = Number(sprint);
            }
        }

        // Resolve and merge custom fields
        if (customFields && Object.keys(customFields).length > 0) {
            const { resolveCustomFieldIds } = await import("./customFields.js");
            for (const [key, value] of Object.entries(customFields)) {
                const resolved = resolveCustomFieldIds([key]);
                if (resolved.length > 0) {
                    fields[resolved[0]] = value;
                }
            }
        }

        console.error(
            "Creating JIRA issue with fields:",
            JSON.stringify(fields, null, 2),
        );

        const response = await this.fetch(
            `${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issue`,
            {
                method: "POST",
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ fields }),
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("JIRA API Error Response:", errorText);
            throw new Error(
                `Failed to create JIRA issue: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        const result = await response.json();

        // If epicLink was requested, try Agile API as fallback
        // (screen schemes may block customfield_10014 via REST API)
        if (epicLink && result.key) {
            try {
                await this.assignIssuesToEpic(epicLink, [result.key]);
                console.error(`Epic link set via Agile API: ${result.key} → ${epicLink}`);
            } catch (agileErr) {
                console.error(`Warning: Could not set epic link via Agile API: ${agileErr}`);
            }
        }

        return result;
    }

    async getJiraProjects(): Promise<any> {

        const response = await this.fetch(
            `${this.baseUrl}/rest/api/${this.auth.apiVersion()}/project`,
            {
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to get JIRA projects: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        return await response.json();
    }

    async getJiraIssueTypes(): Promise<any> {

        const response = await this.fetch(
            `${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issuetype`,
            {
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to get JIRA issue types: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        return await response.json();
    }

    async getJiraBoards(
        projectKey?: string,
        boardType?: string,
        name?: string,
        startAt: number = 0,
        maxResults: number = 50,
    ): Promise<any> {

        const params = new URLSearchParams({
            startAt: startAt.toString(),
            maxResults: maxResults.toString(),
        });

        if (projectKey) params.append("projectKeyOrId", projectKey);
        if (boardType) params.append("type", boardType);
        if (name) params.append("name", name);

        const response = await this.fetch(
            `${this.baseUrl}/rest/agile/1.0/board?${params}`,
            {
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to get JIRA boards: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        return await response.json();
    }

    async getJiraSprints(
        boardId: string,
        state?: string,
        startAt: number = 0,
        maxResults: number = 50,
    ): Promise<any> {

        const params = new URLSearchParams({
            startAt: startAt.toString(),
            maxResults: maxResults.toString(),
        });

        if (state) params.append("state", state);

        const response = await this.fetch(
            `${this.baseUrl}/rest/agile/1.0/board/${boardId}/sprint?${params}`,
            {
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to get JIRA sprints: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        return await response.json();
    }

    async getJiraAttachments(ticketId: string): Promise<any[]> {

        const response = await this.fetch(
            `${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issue/${ticketId}?fields=attachment`,
            {
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            throw new Error(
                `Failed to get attachments: ${response.status} ${response.statusText}`,
            );
        }

        const result = await response.json();
        return result.fields?.attachment || [];
    }

    async downloadAttachment(url: string): Promise<Buffer> {

        const response = await this.fetch(url, {
            headers: {
                Authorization: await this.auth.getAuthHeader(),
            },
        });

        if (!response.ok) {
            throw new Error(
                `Failed to download attachment: ${response.status} ${response.statusText}`,
            );
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }

    async getJiraSprintIssues(
        sprintId: string,
        startAt: number = 0,
        maxResults: number = 50,
    ): Promise<any> {

        const params = new URLSearchParams({
            startAt: startAt.toString(),
            maxResults: maxResults.toString(),
            fields: "summary,status,assignee,reporter,priority,issuetype,project,created,updated,customfield_10004",
        });

        const response = await this.fetch(
            `${this.baseUrl}/rest/agile/1.0/sprint/${sprintId}/issue?${params}`,
            {
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to get JIRA sprint issues: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        return await response.json();
    }

    // ==========================================
    // XRay REST API Methods
    // ==========================================

    private assertXRayServer() {
        if (this.auth.isCloud()) {
            throw new Error("XRay tools are not supported on Jira Cloud. XRay Cloud uses a different API (xray.cloud.getxray.app).");
        }
    }

    /**
     * Get all test steps for a Test issue
     * GET /rest/raven/2.0/api/test/{testKey}/step
     */
    async getXrayTestSteps(testKey: string): Promise<any[]> {
        this.assertXRayServer();

        const response = await this.fetch(
            `${this.baseUrl}/rest/raven/2.0/api/test/${testKey}/step`,
            {
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to get XRay test steps for ${testKey}: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        return await response.json();
    }

    /**
     * Get a specific test step by ID
     * GET /rest/raven/2.0/api/test/{testKey}/step/{stepId}
     */
    async getXrayTestStep(testKey: string, stepId: string): Promise<any> {
        this.assertXRayServer();

        const response = await this.fetch(
            `${this.baseUrl}/rest/raven/2.0/api/test/${testKey}/step/${stepId}`,
            {
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to get XRay test step ${stepId} for ${testKey}: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        return await response.json();
    }

    /**
     * Get tests associated with a Test Execution
     * GET /rest/raven/2.0/api/testexec/{testExecKey}/test
     */
    async getXrayTestExecTests(
        testExecKey: string,
        detailed: boolean = false,
        page?: number,
        limit?: number,
    ): Promise<any> {
        this.assertXRayServer();

        const params = new URLSearchParams();
        if (detailed) params.append("detailed", "true");
        if (page !== undefined) params.append("page", page.toString());
        if (limit !== undefined) params.append("limit", limit.toString());

        const queryString = params.toString();
        const url = `${this.baseUrl}/rest/raven/2.0/api/testexec/${testExecKey}/test${queryString ? `?${queryString}` : ""}`;

        const response = await this.fetch(url, {
            headers: {
                Authorization: await this.auth.getAuthHeader(),
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to get XRay test execution tests for ${testExecKey}: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        return await response.json();
    }

    /**
     * Get pre-conditions for a Test
     * GET /rest/raven/2.0/api/test/{testKey}/precondition
     */
    async getXrayTestPreConditions(testKey: string): Promise<any[]> {
        this.assertXRayServer();

        const response = await this.fetch(
            `${this.baseUrl}/rest/raven/2.0/api/test/${testKey}/precondition`,
            {
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to get XRay pre-conditions for ${testKey}: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        return await response.json();
    }

    /**
     * Get test sets for a Test
     * GET /rest/raven/2.0/api/test/{testKey}/testset
     */
    async getXrayTestSets(testKey: string): Promise<any[]> {
        this.assertXRayServer();

        const response = await this.fetch(
            `${this.baseUrl}/rest/raven/2.0/api/test/${testKey}/testset`,
            {
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to get XRay test sets for ${testKey}: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        return await response.json();
    }

    /**
     * Get test executions for a Test
     * GET /rest/raven/2.0/api/test/{testKey}/testexecution
     */
    async getXrayTestExecutions(
        testKey: string,
        page?: number,
        limit?: number,
    ): Promise<any> {
        this.assertXRayServer();

        const params = new URLSearchParams();
        if (page !== undefined) params.append("page", page.toString());
        if (limit !== undefined) params.append("limit", limit.toString());

        const queryString = params.toString();
        const url = `${this.baseUrl}/rest/raven/2.0/api/test/${testKey}/testexecution${queryString ? `?${queryString}` : ""}`;

        const response = await this.fetch(url, {
            headers: {
                Authorization: await this.auth.getAuthHeader(),
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to get XRay test executions for ${testKey}: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        return await response.json();
    }

    /**
     * Get test plans for a Test
     * GET /rest/raven/2.0/api/test/{testKey}/testplan
     */
    async getXrayTestPlans(testKey: string): Promise<any[]> {
        this.assertXRayServer();

        const response = await this.fetch(
            `${this.baseUrl}/rest/raven/2.0/api/test/${testKey}/testplan`,
            {
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to get XRay test plans for ${testKey}: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        return await response.json();
    }

    /**
     * Get tests in a Test Plan
     * GET /rest/raven/2.0/api/testplan/{testPlanKey}/test
     */
    async getXrayTestPlanTests(
        testPlanKey: string,
        page?: number,
        limit?: number,
    ): Promise<any> {
        this.assertXRayServer();

        const params = new URLSearchParams();
        if (page !== undefined) params.append("page", page.toString());
        if (limit !== undefined) params.append("limit", limit.toString());

        const queryString = params.toString();
        const url = `${this.baseUrl}/rest/raven/2.0/api/testplan/${testPlanKey}/test${queryString ? `?${queryString}` : ""}`;

        const response = await this.fetch(url, {
            headers: {
                Authorization: await this.auth.getAuthHeader(),
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to get XRay test plan tests for ${testPlanKey}: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        return await response.json();
    }

    /**
     * Get tests in a Test Set
     * GET /rest/raven/2.0/api/testset/{testSetKey}/test
     */
    async getXrayTestSetTests(
        testSetKey: string,
        page?: number,
        limit?: number,
    ): Promise<any> {
        this.assertXRayServer();

        const params = new URLSearchParams();
        if (page !== undefined) params.append("page", page.toString());
        if (limit !== undefined) params.append("limit", limit.toString());

        const queryString = params.toString();
        const url = `${this.baseUrl}/rest/raven/2.0/api/testset/${testSetKey}/test${queryString ? `?${queryString}` : ""}`;

        const response = await this.fetch(url, {
            headers: {
                Authorization: await this.auth.getAuthHeader(),
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to get XRay test set tests for ${testSetKey}: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        return await response.json();
    }

    /**
     * Export test runs (execution results)
     * GET /rest/raven/2.0/api/testruns
     */
    async getXrayTestRuns(
        testExecKey?: string,
        testKey?: string,
        testPlanKey?: string,
        testEnvironments?: string,
        page?: number,
        limit?: number,
    ): Promise<any> {
        this.assertXRayServer();

        const params = new URLSearchParams();
        if (testExecKey) params.append("testExecKey", testExecKey);
        if (testKey) params.append("testKey", testKey);
        if (testPlanKey) params.append("testPlanKey", testPlanKey);
        if (testEnvironments)
            params.append("testEnvironments", testEnvironments);
        if (page !== undefined) params.append("page", page.toString());
        if (limit !== undefined) params.append("limit", limit.toString());

        const queryString = params.toString();
        const url = `${this.baseUrl}/rest/raven/2.0/api/testruns${queryString ? `?${queryString}` : ""}`;

        const response = await this.fetch(url, {
            headers: {
                Authorization: await this.auth.getAuthHeader(),
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to get XRay test runs: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        return await response.json();
    }

    /**
     * Get all available test statuses in XRay
     * GET /rest/raven/2.0/api/settings/teststatuses
     */
    async getXrayTestStatuses(): Promise<any[]> {
        this.assertXRayServer();

        const response = await this.fetch(
            `${this.baseUrl}/rest/raven/2.0/api/settings/teststatuses`,
            {
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to get XRay test statuses: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        return await response.json();
    }

    /**
     * Get a full Test Case with all XRay details (steps, pre-conditions, test sets, executions, plans)
     * Combines multiple XRay API calls into one comprehensive response
     */
    async getXrayTestCaseFull(testKey: string): Promise<any> {
        this.assertXRayServer();
        this.assertXRayServer();

        // Fetch the Jira issue with all fields
        const issueResponse = await this.fetch(
            `${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issue/${testKey}`,
            {
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
            },
        );

        if (!issueResponse.ok) {
            throw new Error(
                `Failed to fetch issue ${testKey}: ${issueResponse.status} ${issueResponse.statusText}`,
            );
        }

        const issue = await issueResponse.json();

        // Fetch XRay-specific data in parallel
        const [steps, preConditions, testSets, testExecutions, testPlans] =
            await Promise.allSettled([
                this.getXrayTestSteps(testKey),
                this.getXrayTestPreConditions(testKey),
                this.getXrayTestSets(testKey),
                this.getXrayTestExecutions(testKey),
                this.getXrayTestPlans(testKey),
            ]);

        return {
            issue,
            xray: {
                steps:
                    steps.status === "fulfilled" ? steps.value : { error: (steps as PromiseRejectedResult).reason?.message },
                preConditions:
                    preConditions.status === "fulfilled"
                        ? preConditions.value
                        : { error: (preConditions as PromiseRejectedResult).reason?.message },
                testSets:
                    testSets.status === "fulfilled"
                        ? testSets.value
                        : { error: (testSets as PromiseRejectedResult).reason?.message },
                testExecutions:
                    testExecutions.status === "fulfilled"
                        ? testExecutions.value
                        : { error: (testExecutions as PromiseRejectedResult).reason?.message },
                testPlans:
                    testPlans.status === "fulfilled"
                        ? testPlans.value
                        : { error: (testPlans as PromiseRejectedResult).reason?.message },
            },
        };
    }

    /**
     * Get pre-condition tests (tests associated with a pre-condition issue)
     * GET /rest/raven/2.0/api/precondition/{preConditionKey}/test
     */
    async getXrayPreConditionTests(preConditionKey: string): Promise<any[]> {
        this.assertXRayServer();
        this.assertXRayServer();

        const response = await this.fetch(
            `${this.baseUrl}/rest/raven/2.0/api/precondition/${preConditionKey}/test`,
            {
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to get XRay pre-condition tests for ${preConditionKey}: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        return await response.json();
    }

    // ==========================================
    // Issue Link & User Methods
    // ==========================================

    /**
     * Create a link between two Jira issues.
     * POST /rest/api/{version}/issueLink
     */
    async linkJiraIssues(
        inwardTicketId: string,
        outwardTicketId: string,
        linkType: string,
    ): Promise<void> {
        const response = await this.fetch(
            `${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issueLink`,
            {
                method: "POST",
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    type: { name: linkType },
                    inwardIssue: { key: inwardTicketId },
                    outwardIssue: { key: outwardTicketId },
                }),
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to link JIRA issues: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }
    }

    /**
     * Get all available issue link types.
     * GET /rest/api/{version}/issueLinkType
     */
    async getJiraIssueLinkTypes(): Promise<any> {
        const response = await this.fetch(
            `${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issueLinkType`,
            {
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to get JIRA issue link types: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        return await response.json();
    }

    /**
     * Get the currently authenticated user's profile.
     * GET /rest/api/{version}/myself
     */
    async getMyself(): Promise<any> {
        const response = await this.fetch(
            `${this.baseUrl}/rest/api/${this.auth.apiVersion()}/myself`,
            {
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Failed to get current user: ${response.status} ${response.statusText} - ${errorText}`,
            );
        }

        return await response.json();
    }

    // ==========================================
    // Development Status (Server-only)
    // ==========================================

    /**
     * Get development status (PRs, branches, commits) for an issue.
     * Server-only — the dev-status REST API is not available on Jira Cloud.
     * GET /rest/dev-status/1.0/issue/detail?issueId={id}&applicationType=githube&dataType={type}
     */
    async getDevStatus(issueId: string): Promise<any> {
        this.assertXRayServer();

        const dataTypes = ["pullrequest", "branch", "repository"];
        const results = await Promise.allSettled(
            dataTypes.map(async (dataType) => {
                const params = new URLSearchParams({
                    issueId,
                    applicationType: "githube",
                    dataType,
                });
                const response = await this.fetch(
                    `${this.baseUrl}/rest/dev-status/1.0/issue/detail?${params}`,
                    {
                        headers: {
                            Authorization: await this.auth.getAuthHeader(),
                            "Content-Type": "application/json",
                        },
                    },
                );
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(
                        `Failed to get dev status (${dataType}): ${response.status} ${response.statusText} - ${errorText}`,
                    );
                }
                return await response.json();
            }),
        );

        const mergedDetail: any[] = [];
        for (const result of results) {
            if (result.status === "fulfilled" && result.value?.detail) {
                for (const provider of result.value.detail) {
                    const existing = mergedDetail.find(
                        (d) => d.instanceName === provider.instanceName,
                    );
                    if (existing) {
                        existing.pullRequests = dedup(existing.pullRequests || [], provider.pullRequests || [], (pr: any) => pr.url);
                        existing.branches = dedup(existing.branches || [], provider.branches || [], (b: any) => b.url);
                        existing.commits = dedup(existing.commits || [], provider.commits || [], (c: any) => c.id);
                    } else {
                        mergedDetail.push({ ...provider });
                    }
                }
            }
        }

        return { detail: mergedDetail };
    }

    // ==========================================
    // XRay Write Methods (Server-only)
    // ==========================================

    /**
     * Add tests to a Test Execution.
     * POST /rest/raven/1.0/api/testexec/{testExecKey}/test
     */
    async addTestsToTestExec(
        testExecKey: string,
        testKeys: string[],
    ): Promise<void> {
        this.assertXRayServer();

        const response = await this.fetch(
            `${this.baseUrl}/rest/raven/1.0/api/testexec/${testExecKey}/test`,
            {
                method: "POST",
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ add: testKeys }),
            },
        );

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(
                `Failed to add tests to Test Execution ${testExecKey}: ${response.status} ${response.statusText} - ${errText}`,
            );
        }
    }

    /**
     * Assign issues to an Epic using the Agile API.
     * This bypasses screen scheme restrictions that block customfield_10014 via REST API.
     * POST /rest/agile/1.0/epic/{epicKey}/issue
     */
    async assignIssuesToEpic(
        epicKey: string,
        issueKeys: string[],
    ): Promise<void> {
        const response = await this.fetch(
            `${this.baseUrl}/rest/agile/1.0/epic/${epicKey}/issue`,
            {
                method: "POST",
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ issues: issueKeys }),
            },
        );

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(
                `Failed to assign issues to epic ${epicKey}: ${response.status} ${response.statusText} - ${errText}`,
            );
        }
    }

    // ==========================================
    // Issue Properties API
    // ==========================================

    async getIssueProperty(issueKey: string, propertyKey: string): Promise<any> {
        const response = await fetch(
            `${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issue/${issueKey}/properties/${propertyKey}`,
            {
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
            },
        );
        if (!response.ok) {
            if (response.status === 404) return null;
            const errorText = await response.text();
            throw new Error(`Failed to get issue property "${propertyKey}" for ${issueKey}: ${response.status} ${response.statusText} - ${errorText}`);
        }
        return await response.json();
    }

    async setIssueProperty(issueKey: string, propertyKey: string, value: unknown): Promise<void> {
        const response = await fetch(
            `${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issue/${issueKey}/properties/${propertyKey}`,
            {
                method: "PUT",
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(value),
            },
        );
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to set issue property "${propertyKey}" for ${issueKey}: ${response.status} ${response.statusText} - ${errorText}`);
        }
    }

    async deleteIssueProperty(issueKey: string, propertyKey: string): Promise<void> {
        const response = await fetch(
            `${this.baseUrl}/rest/api/${this.auth.apiVersion()}/issue/${issueKey}/properties/${propertyKey}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: await this.auth.getAuthHeader(),
                },
            },
        );
        if (!response.ok) {
            if (response.status === 404) return;
            const errorText = await response.text();
            throw new Error(`Failed to delete issue property "${propertyKey}" for ${issueKey}: ${response.status} ${response.statusText} - ${errorText}`);
        }
    }
}
