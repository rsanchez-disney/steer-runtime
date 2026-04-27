export interface JiraTicket {
    id?: string;
    key: string;
    fields: {
        summary: string;
        description?: string;
        status?: { name: string };
        assignee?: { displayName: string };
        reporter?: { displayName: string };
        priority?: { name: string };
        created?: string;
        updated?: string;
        labels?: string[];
        components?: Array<{ name: string }>;
        issuetype?: { name: string };
        parent?: { key: string; fields?: { summary?: string } };
        subtasks?: Array<{ key: string; fields?: { summary?: string; status?: { name: string } } }>;
        issuelinks?: Array<{
            type?: { outward?: string; inward?: string };
            outwardIssue?: { key: string; fields?: { summary?: string; status?: { name: string } } };
            inwardIssue?: { key: string; fields?: { summary?: string; status?: { name: string } } };
        }>;
        fixVersions?: Array<{ name: string }>;
        comment?: {
            comments: Array<{
                author?: { displayName: string };
                body?: string;
                created?: string;
            }>;
        };
    };
}
