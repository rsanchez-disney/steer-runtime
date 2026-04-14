import type { JiraTicket } from "./types.js";
import { JiraAuth } from "./auth.js";

export class JiraApiClient {
    private auth = new JiraAuth();

    async fetchJiraTicket(
        ticketId: string,
        fields?: string[],
    ): Promise<JiraTicket> {
        const pat = await this.auth.getJiraPat();

        const defaultFields = [
            "summary",
            "description",
            "status",
            "assignee",
            "priority",
            "created",
        ];
        const requestedFields = fields || defaultFields;

        const response = await fetch(
            `https://myjira.disney.com/rest/api/2/issue/${ticketId}?fields=${requestedFields.join(",")}`,
            {
                headers: {
                    Authorization: `Bearer ${pat}`,
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
        const pat = await this.auth.getJiraPat();

        console.error(
            "Updating JIRA ticket with fields:",
            JSON.stringify(updates, null, 2),
        );

        const response = await fetch(
            `https://myjira.disney.com/rest/api/2/issue/${ticketId}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${pat}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ fields: updates }),
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
        const pat = await this.auth.getJiraPat();

        const response = await fetch(
            `https://myjira.disney.com/rest/api/2/issue/${ticketId}/transitions`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${pat}`,
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
        const pat = await this.auth.getJiraPat();

        const response = await fetch(
            `https://myjira.disney.com/rest/api/2/issue/${ticketId}/transitions`,
            {
                headers: {
                    Authorization: `Bearer ${pat}`,
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
        const pat = await this.auth.getJiraPat();

        const response = await fetch(
            `https://myjira.disney.com/rest/api/2/issue/${ticketId}/comment`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${pat}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ body: comment }),
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
        const pat = await this.auth.getJiraPat();

        const baseFields = [
            "summary",
            "status",
            "assignee",
            "priority",
            "issuetype",
            "project",
            "created",
            "updated",
        ];
        const fields = [...new Set([...baseFields, ...extraFields])];

        const response = await fetch(
            `https://myjira.disney.com/rest/api/2/search`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${pat}`,
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

    async createJiraIssue(
        projectKey: string,
        summary: string,
        issueType: string,
        description?: string,
        assignee?: string,
        epicLink?: string,
        components?: string[],
        labels?: string[],
        sprint?: string,
        customFields?: Record<string, unknown>,
    ): Promise<any> {
        const pat = await this.auth.getJiraPat();

        const fields: any = {
            project: { key: projectKey },
            summary,
            issuetype: { name: issueType },
        };

        if (description) {
            fields.description = description;
        }

        if (assignee) {
            fields.assignee = { name: assignee };
        }

        if (epicLink) {
            console.error(
                `Warning: Epic Link "${epicLink}" provided but field ID not configured for this JIRA instance`,
            );
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

        const response = await fetch(
            `https://myjira.disney.com/rest/api/2/issue`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${pat}`,
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

        return await response.json();
    }

    async getJiraProjects(): Promise<any> {
        const pat = await this.auth.getJiraPat();

        const response = await fetch(
            `https://myjira.disney.com/rest/api/2/project`,
            {
                headers: {
                    Authorization: `Bearer ${pat}`,
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
        const pat = await this.auth.getJiraPat();

        const response = await fetch(
            `https://myjira.disney.com/rest/api/2/issuetype`,
            {
                headers: {
                    Authorization: `Bearer ${pat}`,
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
        const pat = await this.auth.getJiraPat();

        const params = new URLSearchParams({
            startAt: startAt.toString(),
            maxResults: maxResults.toString(),
        });

        if (projectKey) params.append("projectKeyOrId", projectKey);
        if (boardType) params.append("type", boardType);
        if (name) params.append("name", name);

        const response = await fetch(
            `https://myjira.disney.com/rest/agile/1.0/board?${params}`,
            {
                headers: {
                    Authorization: `Bearer ${pat}`,
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
        const pat = await this.auth.getJiraPat();

        const params = new URLSearchParams({
            startAt: startAt.toString(),
            maxResults: maxResults.toString(),
        });

        if (state) params.append("state", state);

        const response = await fetch(
            `https://myjira.disney.com/rest/agile/1.0/board/${boardId}/sprint?${params}`,
            {
                headers: {
                    Authorization: `Bearer ${pat}`,
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
        const pat = await this.auth.getJiraPat();

        const response = await fetch(
            `https://myjira.disney.com/rest/api/2/issue/${ticketId}?fields=attachment`,
            {
                headers: {
                    Authorization: `Bearer ${pat}`,
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
        const pat = await this.auth.getJiraPat();

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${pat}`,
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
        const pat = await this.auth.getJiraPat();

        const params = new URLSearchParams({
            startAt: startAt.toString(),
            maxResults: maxResults.toString(),
            fields: "summary,status,assignee,priority,issuetype,project,created,updated",
        });

        const response = await fetch(
            `https://myjira.disney.com/rest/agile/1.0/sprint/${sprintId}/issue?${params}`,
            {
                headers: {
                    Authorization: `Bearer ${pat}`,
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

    /**
     * Get all test steps for a Test issue
     * GET /rest/raven/2.0/api/test/{testKey}/step
     */
    async getXrayTestSteps(testKey: string): Promise<any[]> {
        const pat = await this.auth.getJiraPat();

        const response = await fetch(
            `https://myjira.disney.com/rest/raven/2.0/api/test/${testKey}/step`,
            {
                headers: {
                    Authorization: `Bearer ${pat}`,
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
        const pat = await this.auth.getJiraPat();

        const response = await fetch(
            `https://myjira.disney.com/rest/raven/2.0/api/test/${testKey}/step/${stepId}`,
            {
                headers: {
                    Authorization: `Bearer ${pat}`,
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
        const pat = await this.auth.getJiraPat();

        const params = new URLSearchParams();
        if (detailed) params.append("detailed", "true");
        if (page !== undefined) params.append("page", page.toString());
        if (limit !== undefined) params.append("limit", limit.toString());

        const queryString = params.toString();
        const url = `https://myjira.disney.com/rest/raven/2.0/api/testexec/${testExecKey}/test${queryString ? `?${queryString}` : ""}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${pat}`,
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
        const pat = await this.auth.getJiraPat();

        const response = await fetch(
            `https://myjira.disney.com/rest/raven/2.0/api/test/${testKey}/precondition`,
            {
                headers: {
                    Authorization: `Bearer ${pat}`,
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
        const pat = await this.auth.getJiraPat();

        const response = await fetch(
            `https://myjira.disney.com/rest/raven/2.0/api/test/${testKey}/testset`,
            {
                headers: {
                    Authorization: `Bearer ${pat}`,
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
        const pat = await this.auth.getJiraPat();

        const params = new URLSearchParams();
        if (page !== undefined) params.append("page", page.toString());
        if (limit !== undefined) params.append("limit", limit.toString());

        const queryString = params.toString();
        const url = `https://myjira.disney.com/rest/raven/2.0/api/test/${testKey}/testexecution${queryString ? `?${queryString}` : ""}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${pat}`,
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
        const pat = await this.auth.getJiraPat();

        const response = await fetch(
            `https://myjira.disney.com/rest/raven/2.0/api/test/${testKey}/testplan`,
            {
                headers: {
                    Authorization: `Bearer ${pat}`,
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
        const pat = await this.auth.getJiraPat();

        const params = new URLSearchParams();
        if (page !== undefined) params.append("page", page.toString());
        if (limit !== undefined) params.append("limit", limit.toString());

        const queryString = params.toString();
        const url = `https://myjira.disney.com/rest/raven/2.0/api/testplan/${testPlanKey}/test${queryString ? `?${queryString}` : ""}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${pat}`,
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
        const pat = await this.auth.getJiraPat();

        const params = new URLSearchParams();
        if (page !== undefined) params.append("page", page.toString());
        if (limit !== undefined) params.append("limit", limit.toString());

        const queryString = params.toString();
        const url = `https://myjira.disney.com/rest/raven/2.0/api/testset/${testSetKey}/test${queryString ? `?${queryString}` : ""}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${pat}`,
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
        const pat = await this.auth.getJiraPat();

        const params = new URLSearchParams();
        if (testExecKey) params.append("testExecKey", testExecKey);
        if (testKey) params.append("testKey", testKey);
        if (testPlanKey) params.append("testPlanKey", testPlanKey);
        if (testEnvironments)
            params.append("testEnvironments", testEnvironments);
        if (page !== undefined) params.append("page", page.toString());
        if (limit !== undefined) params.append("limit", limit.toString());

        const queryString = params.toString();
        const url = `https://myjira.disney.com/rest/raven/2.0/api/testruns${queryString ? `?${queryString}` : ""}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${pat}`,
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
        const pat = await this.auth.getJiraPat();

        const response = await fetch(
            `https://myjira.disney.com/rest/raven/2.0/api/settings/teststatuses`,
            {
                headers: {
                    Authorization: `Bearer ${pat}`,
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
        const pat = await this.auth.getJiraPat();

        // Fetch the Jira issue with all fields
        const issueResponse = await fetch(
            `https://myjira.disney.com/rest/api/2/issue/${testKey}`,
            {
                headers: {
                    Authorization: `Bearer ${pat}`,
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
        const pat = await this.auth.getJiraPat();

        const response = await fetch(
            `https://myjira.disney.com/rest/raven/2.0/api/precondition/${preConditionKey}/test`,
            {
                headers: {
                    Authorization: `Bearer ${pat}`,
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
}
