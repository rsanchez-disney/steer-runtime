"use strict";
/**
 * BlueDolphin MCP tools — read-only access to enterprise architecture data.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tools = void 0;
exports.handleToolCall = handleToolCall;
exports.tools = [
    {
        name: "bd_validate_connection",
        description: "Test BlueDolphin API connectivity and authentication. Use this to verify credentials are configured correctly.",
        inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
        },
    },
    {
        name: "bd_search_objects",
        description: "Search for objects (applications, capabilities, processes) in BlueDolphin by name or filter. Returns matching objects with their IDs, titles, types, and properties.",
        inputSchema: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "Search term to match against object titles (e.g., BAPP ID, application name)",
                },
                workspace_id: {
                    type: "string",
                    description: "Filter by workspace ID",
                },
                object_type_id: {
                    type: "string",
                    description: "Filter by object type/definition ID",
                },
            },
            additionalProperties: false,
        },
    },
    {
        name: "bd_get_object",
        description: "Get detailed information about a specific BlueDolphin object by its ID. Returns all properties, metadata, and relationships.",
        inputSchema: {
            type: "object",
            properties: {
                object_id: {
                    type: "string",
                    description: "The BlueDolphin object ID to retrieve",
                },
            },
            required: ["object_id"],
            additionalProperties: false,
        },
    },
    {
        name: "bd_list_objects",
        description: "List objects from BlueDolphin with optional filtering by workspace or object type. Returns a paginated list of objects.",
        inputSchema: {
            type: "object",
            properties: {
                workspace_id: {
                    type: "string",
                    description: "Filter by workspace ID",
                },
                object_type_id: {
                    type: "string",
                    description: "Filter by object type/definition ID",
                },
                limit: {
                    type: "number",
                    description: "Maximum number of objects to return (default: 25, max: 100)",
                    minimum: 1,
                    maximum: 100,
                },
            },
            additionalProperties: false,
        },
    },
    {
        name: "bd_list_relations",
        description: "List all relationships for a specific object. Shows how the object connects to other objects in the architecture (dependencies, compositions, associations).",
        inputSchema: {
            type: "object",
            properties: {
                object_id: {
                    type: "string",
                    description: "Object ID to get relationships for",
                },
            },
            required: ["object_id"],
            additionalProperties: false,
        },
    },
    {
        name: "bd_list_workspaces",
        description: "List all available workspaces in BlueDolphin. Workspaces organize objects into logical groups.",
        inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
        },
    },
    {
        name: "bd_list_object_types",
        description: "List all object type definitions (schemas) available in BlueDolphin. Shows what types of objects can exist (Application, Capability, Process, etc.).",
        inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
        },
    },
];
async function handleToolCall(client, name, args) {
    try {
        let result;
        switch (name) {
            case "bd_validate_connection":
                result = await client.validateConnection();
                if (result.ok) {
                    return text("BlueDolphin connection successful. API is reachable and authenticated.");
                }
                return text(`Connection failed: ${result.error}`);
            case "bd_search_objects":
                result = await client.searchObjects({
                    query: args.query,
                    workspaceId: args.workspace_id,
                    objectTypeId: args.object_type_id,
                });
                break;
            case "bd_get_object":
                result = await client.getObject(args.object_id);
                break;
            case "bd_list_objects":
                result = await client.listObjects({
                    workspaceId: args.workspace_id,
                    objectTypeId: args.object_type_id,
                    limit: args.limit,
                });
                break;
            case "bd_list_relations":
                result = await client.listRelations(args.object_id);
                break;
            case "bd_list_workspaces":
                result = await client.listWorkspaces();
                break;
            case "bd_list_object_types":
                result = await client.listObjectTypes();
                break;
            default:
                return text(`Unknown tool: ${name}`);
        }
        if (!result.ok) {
            return text(`Error: ${result.error}`);
        }
        return text(JSON.stringify(result.data, null, 2));
    }
    catch (err) {
        return text(`Error: ${err.message}`);
    }
}
function text(content) {
    return { content: [{ type: "text", text: content }] };
}
