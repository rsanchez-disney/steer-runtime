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
    ): Promise<any> {
        const pat = await this.auth.getJiraPat();

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
                    fields: [
                        "summary",
                        "status",
                        "assignee",
                        "priority",
                        "issuetype",
                        "project",
                        "created",
                        "updated",
                    ],
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
}
