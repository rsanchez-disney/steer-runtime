import { z } from "zod";
export const tools = {
    // --- Incidents ---
    search_incidents: {
        description: "Search incidents in ServiceNow using an encoded query",
        schema: z.object({
            query: z.string().optional().describe("Encoded query (e.g. 'priority=1^state=2')"),
            fields: z.string().optional().describe("Comma-separated fields to return"),
            limit: z.number().optional().default(10),
        }),
    },
    get_incident: {
        description: "Get a single incident by sys_id",
        schema: z.object({ sys_id: z.string() }),
    },
    create_incident: {
        description: "Create a new incident",
        schema: z.object({
            short_description: z.string(),
            description: z.string().optional(),
            urgency: z.enum(["1", "2", "3"]).optional().describe("1=High, 2=Medium, 3=Low"),
            impact: z.enum(["1", "2", "3"]).optional(),
            assignment_group: z.string().optional(),
            caller_id: z.string().optional(),
            category: z.string().optional(),
        }),
    },
    update_incident: {
        description: "Update an existing incident",
        schema: z.object({
            sys_id: z.string(),
            data: z.record(z.unknown()).describe("Fields to update"),
        }),
    },
    // --- Incident Journal (Comments & Work Notes) ---
    get_incident_comments: {
        description: "Get the full comment history (Additional Comments) for an incident",
        schema: z.object({
            sys_id: z.string().describe("The sys_id of the incident"),
            limit: z.number().optional().default(50).describe("Max number of comments to return"),
        }),
    },
    get_incident_worknotes: {
        description: "Get the full work notes history for an incident",
        schema: z.object({
            sys_id: z.string().describe("The sys_id of the incident"),
            limit: z.number().optional().default(50).describe("Max number of work notes to return"),
        }),
    },
    get_incident_journal: {
        description: "Get both comments and work notes history for an incident",
        schema: z.object({
            sys_id: z.string().describe("The sys_id of the incident"),
            limit: z.number().optional().default(50).describe("Max number of entries to return"),
        }),
    },
    // --- Change Requests ---
    search_change_requests: {
        description: "Search change requests",
        schema: z.object({
            query: z.string().optional(),
            fields: z.string().optional(),
            limit: z.number().optional().default(10),
        }),
    },
    get_change_request: {
        description: "Get a single change request by sys_id",
        schema: z.object({ sys_id: z.string() }),
    },
    create_change_request: {
        description: "Create a new change request",
        schema: z.object({
            short_description: z.string(),
            description: z.string().optional(),
            type: z.enum(["standard", "normal", "emergency"]).optional(),
            assignment_group: z.string().optional(),
            priority: z.enum(["1", "2", "3", "4"]).optional(),
        }),
    },
    update_change_request: {
        description: "Update an existing change request",
        schema: z.object({
            sys_id: z.string(),
            data: z.record(z.unknown()),
        }),
    },
    // --- Users ---
    search_users: {
        description: "Search users in ServiceNow",
        schema: z.object({
            query: z.string().optional().describe("e.g. 'user_name=admin' or 'nameLIKEjohn'"),
            fields: z.string().optional(),
            limit: z.number().optional().default(10),
        }),
    },
    // --- CMDB ---
    search_cmdb_ci: {
        description: "Search Configuration Items in the CMDB",
        schema: z.object({
            query: z.string().optional(),
            fields: z.string().optional(),
            limit: z.number().optional().default(10),
        }),
    },
    // --- Generic Table ---
    query_table: {
        description: "Query any ServiceNow table",
        schema: z.object({
            table: z.string().describe("Table name (e.g. 'sc_request', 'kb_knowledge')"),
            query: z.string().optional(),
            fields: z.string().optional(),
            limit: z.number().optional().default(10),
        }),
    },
    create_record: {
        description: "Create a record in any ServiceNow table",
        schema: z.object({
            table: z.string(),
            data: z.record(z.unknown()),
        }),
    },
    update_record: {
        description: "Update a record in any ServiceNow table",
        schema: z.object({
            table: z.string(),
            sys_id: z.string(),
            data: z.record(z.unknown()),
        }),
    },
};
