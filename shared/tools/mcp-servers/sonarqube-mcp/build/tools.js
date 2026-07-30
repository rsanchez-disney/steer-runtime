"use strict";
/**
 * SonarQube MCP tools — code quality, security, and coverage metrics.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tools = void 0;
exports.handleToolCall = handleToolCall;
exports.tools = [
    {
        name: "sq_validate_connection",
        description: "Test SonarQube API connectivity and authentication.",
        inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
        },
    },
    {
        name: "sq_list_projects",
        description: "List projects in SonarQube. Optionally filter by name query.",
        inputSchema: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "Filter projects by name (partial match)",
                },
                page_size: {
                    type: "number",
                    description: "Max results (default: 25, max: 100)",
                    minimum: 1,
                    maximum: 100,
                },
            },
            additionalProperties: false,
        },
    },
    {
        name: "sq_get_issues",
        description: "Search for code quality issues (bugs, vulnerabilities, code smells) in a project or file. Returns issue details with severity, location, and message.",
        inputSchema: {
            type: "object",
            properties: {
                project_key: {
                    type: "string",
                    description: "SonarQube project key (e.g., 'my-org:my-project')",
                },
                file: {
                    type: "string",
                    description: "Filter by file path (component key, e.g., 'src/main/App.java')",
                },
                severities: {
                    type: "string",
                    description: "Comma-separated: BLOCKER, CRITICAL, MAJOR, MINOR, INFO",
                },
                types: {
                    type: "string",
                    description: "Comma-separated: BUG, VULNERABILITY, CODE_SMELL",
                },
                statuses: {
                    type: "string",
                    description: "Comma-separated: OPEN, CONFIRMED, REOPENED, RESOLVED, CLOSED",
                },
                page_size: {
                    type: "number",
                    description: "Max results (default: 25)",
                    minimum: 1,
                    maximum: 100,
                },
            },
            required: ["project_key"],
            additionalProperties: false,
        },
    },
    {
        name: "sq_get_measures",
        description: "Get code quality metrics for a project — coverage, bugs, vulnerabilities, code smells, duplications, technical debt, and more.",
        inputSchema: {
            type: "object",
            properties: {
                component: {
                    type: "string",
                    description: "Project or component key",
                },
                metrics: {
                    type: "string",
                    description: "Comma-separated metric keys. Common: coverage, bugs, vulnerabilities, code_smells, duplicated_lines_density, ncloc, sqale_debt_ratio, reliability_rating, security_rating",
                },
            },
            required: ["component"],
            additionalProperties: false,
        },
    },
    {
        name: "sq_get_hotspots",
        description: "Search for security hotspots in a project. Hotspots are potential security issues that need manual review.",
        inputSchema: {
            type: "object",
            properties: {
                project_key: {
                    type: "string",
                    description: "SonarQube project key",
                },
                status: {
                    type: "string",
                    description: "Filter: TO_REVIEW, REVIEWED (default: all)",
                },
                page_size: {
                    type: "number",
                    description: "Max results (default: 25)",
                    minimum: 1,
                    maximum: 100,
                },
            },
            required: ["project_key"],
            additionalProperties: false,
        },
    },
    {
        name: "sq_get_quality_gate",
        description: "Get the quality gate status for a project (pass/fail). Shows which conditions passed or failed (e.g., coverage threshold, new bugs).",
        inputSchema: {
            type: "object",
            properties: {
                project_key: {
                    type: "string",
                    description: "SonarQube project key",
                },
            },
            required: ["project_key"],
            additionalProperties: false,
        },
    },
    {
        name: "sq_get_source",
        description: "Get source code lines for a file with issue annotations. Useful for seeing issues in context.",
        inputSchema: {
            type: "object",
            properties: {
                key: {
                    type: "string",
                    description: "Component key (project:path/to/file.java)",
                },
                from: {
                    type: "number",
                    description: "Start line number",
                },
                to: {
                    type: "number",
                    description: "End line number",
                },
            },
            required: ["key"],
            additionalProperties: false,
        },
    },
];
async function handleToolCall(client, name, args) {
    try {
        let result;
        switch (name) {
            case "sq_validate_connection":
                result = await client.validate();
                if (result.ok) {
                    return text(`SonarQube connection successful. Status: ${JSON.stringify(result.data)}`);
                }
                return text(`Connection failed: ${result.error}`);
            case "sq_list_projects":
                result = await client.listProjects({
                    query: args.query,
                    pageSize: args.page_size,
                });
                break;
            case "sq_get_issues":
                result = await client.getIssues({
                    projectKey: args.project_key,
                    componentKeys: args.file,
                    severities: args.severities,
                    types: args.types,
                    statuses: args.statuses,
                    pageSize: args.page_size,
                });
                break;
            case "sq_get_measures":
                result = await client.getMeasures({
                    component: args.component,
                    metricKeys: args.metrics || "coverage,bugs,vulnerabilities,code_smells,duplicated_lines_density,ncloc,sqale_debt_ratio",
                });
                break;
            case "sq_get_hotspots":
                result = await client.getHotspots({
                    projectKey: args.project_key,
                    status: args.status,
                    pageSize: args.page_size,
                });
                break;
            case "sq_get_quality_gate":
                result = await client.getQualityGate({
                    projectKey: args.project_key,
                });
                break;
            case "sq_get_source":
                result = await client.getSource({
                    key: args.key,
                    from: args.from,
                    to: args.to,
                });
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
