export interface JiraTicket {
    id: string;
    key: string;
    fields: {
        summary: string;
        description?: string;
        status?: {
            name: string;
        };
        assignee?: {
            displayName: string;
        };
        priority?: {
            name: string;
        };
        created?: string;
        updated?: string;
        labels?: string[];
        components?: Array<{
            name: string;
        }>;
        comment?: {
            comments: Array<{
                author?: {
                    displayName: string;
                };
                body?: string;
                created?: string;
            }>;
        };
    };
}
