import { z } from "zod";
export declare const tools: {
    readonly search_incidents: {
        readonly description: "Search incidents in ServiceNow using an encoded query";
        readonly schema: z.ZodObject<{
            query: z.ZodOptional<z.ZodString>;
            fields: z.ZodOptional<z.ZodString>;
            limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            query?: string | undefined;
            fields?: string | undefined;
        }, {
            query?: string | undefined;
            fields?: string | undefined;
            limit?: number | undefined;
        }>;
    };
    readonly get_incident: {
        readonly description: "Get a single incident by sys_id";
        readonly schema: z.ZodObject<{
            sys_id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            sys_id: string;
        }, {
            sys_id: string;
        }>;
    };
    readonly create_incident: {
        readonly description: "Create a new incident";
        readonly schema: z.ZodObject<{
            short_description: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            urgency: z.ZodOptional<z.ZodEnum<["1", "2", "3"]>>;
            impact: z.ZodOptional<z.ZodEnum<["1", "2", "3"]>>;
            assignment_group: z.ZodOptional<z.ZodString>;
            caller_id: z.ZodOptional<z.ZodString>;
            category: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            short_description: string;
            description?: string | undefined;
            urgency?: "1" | "2" | "3" | undefined;
            impact?: "1" | "2" | "3" | undefined;
            assignment_group?: string | undefined;
            caller_id?: string | undefined;
            category?: string | undefined;
        }, {
            short_description: string;
            description?: string | undefined;
            urgency?: "1" | "2" | "3" | undefined;
            impact?: "1" | "2" | "3" | undefined;
            assignment_group?: string | undefined;
            caller_id?: string | undefined;
            category?: string | undefined;
        }>;
    };
    readonly update_incident: {
        readonly description: "Update an existing incident";
        readonly schema: z.ZodObject<{
            sys_id: z.ZodString;
            data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, "strip", z.ZodTypeAny, {
            data: Record<string, unknown>;
            sys_id: string;
        }, {
            data: Record<string, unknown>;
            sys_id: string;
        }>;
    };
    readonly get_incident_comments: {
        readonly description: "Get the full comment history (Additional Comments) for an incident";
        readonly schema: z.ZodObject<{
            sys_id: z.ZodString;
            limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            sys_id: string;
        }, {
            sys_id: string;
            limit?: number | undefined;
        }>;
    };
    readonly get_incident_worknotes: {
        readonly description: "Get the full work notes history for an incident";
        readonly schema: z.ZodObject<{
            sys_id: z.ZodString;
            limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            sys_id: string;
        }, {
            sys_id: string;
            limit?: number | undefined;
        }>;
    };
    readonly get_incident_journal: {
        readonly description: "Get both comments and work notes history for an incident";
        readonly schema: z.ZodObject<{
            sys_id: z.ZodString;
            limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            sys_id: string;
        }, {
            sys_id: string;
            limit?: number | undefined;
        }>;
    };
    readonly search_change_requests: {
        readonly description: "Search change requests";
        readonly schema: z.ZodObject<{
            query: z.ZodOptional<z.ZodString>;
            fields: z.ZodOptional<z.ZodString>;
            limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            query?: string | undefined;
            fields?: string | undefined;
        }, {
            query?: string | undefined;
            fields?: string | undefined;
            limit?: number | undefined;
        }>;
    };
    readonly get_change_request: {
        readonly description: "Get a single change request by sys_id";
        readonly schema: z.ZodObject<{
            sys_id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            sys_id: string;
        }, {
            sys_id: string;
        }>;
    };
    readonly create_change_request: {
        readonly description: "Create a new change request";
        readonly schema: z.ZodObject<{
            short_description: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodEnum<["standard", "normal", "emergency"]>>;
            assignment_group: z.ZodOptional<z.ZodString>;
            priority: z.ZodOptional<z.ZodEnum<["1", "2", "3", "4"]>>;
        }, "strip", z.ZodTypeAny, {
            short_description: string;
            type?: "standard" | "normal" | "emergency" | undefined;
            description?: string | undefined;
            assignment_group?: string | undefined;
            priority?: "1" | "2" | "3" | "4" | undefined;
        }, {
            short_description: string;
            type?: "standard" | "normal" | "emergency" | undefined;
            description?: string | undefined;
            assignment_group?: string | undefined;
            priority?: "1" | "2" | "3" | "4" | undefined;
        }>;
    };
    readonly update_change_request: {
        readonly description: "Update an existing change request";
        readonly schema: z.ZodObject<{
            sys_id: z.ZodString;
            data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, "strip", z.ZodTypeAny, {
            data: Record<string, unknown>;
            sys_id: string;
        }, {
            data: Record<string, unknown>;
            sys_id: string;
        }>;
    };
    readonly search_users: {
        readonly description: "Search users in ServiceNow";
        readonly schema: z.ZodObject<{
            query: z.ZodOptional<z.ZodString>;
            fields: z.ZodOptional<z.ZodString>;
            limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            query?: string | undefined;
            fields?: string | undefined;
        }, {
            query?: string | undefined;
            fields?: string | undefined;
            limit?: number | undefined;
        }>;
    };
    readonly search_cmdb_ci: {
        readonly description: "Search Configuration Items in the CMDB";
        readonly schema: z.ZodObject<{
            query: z.ZodOptional<z.ZodString>;
            fields: z.ZodOptional<z.ZodString>;
            limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            query?: string | undefined;
            fields?: string | undefined;
        }, {
            query?: string | undefined;
            fields?: string | undefined;
            limit?: number | undefined;
        }>;
    };
    readonly query_table: {
        readonly description: "Query any ServiceNow table";
        readonly schema: z.ZodObject<{
            table: z.ZodString;
            query: z.ZodOptional<z.ZodString>;
            fields: z.ZodOptional<z.ZodString>;
            limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            table: string;
            limit: number;
            query?: string | undefined;
            fields?: string | undefined;
        }, {
            table: string;
            query?: string | undefined;
            fields?: string | undefined;
            limit?: number | undefined;
        }>;
    };
    readonly create_record: {
        readonly description: "Create a record in any ServiceNow table";
        readonly schema: z.ZodObject<{
            table: z.ZodString;
            data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, "strip", z.ZodTypeAny, {
            data: Record<string, unknown>;
            table: string;
        }, {
            data: Record<string, unknown>;
            table: string;
        }>;
    };
    readonly update_record: {
        readonly description: "Update a record in any ServiceNow table";
        readonly schema: z.ZodObject<{
            table: z.ZodString;
            sys_id: z.ZodString;
            data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        }, "strip", z.ZodTypeAny, {
            data: Record<string, unknown>;
            table: string;
            sys_id: string;
        }, {
            data: Record<string, unknown>;
            table: string;
            sys_id: string;
        }>;
    };
};
export type ToolName = keyof typeof tools;
