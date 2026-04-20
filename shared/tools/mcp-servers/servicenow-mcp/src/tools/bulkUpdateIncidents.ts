import { apiClient } from "../utils/apiClient.js";

export const bulkUpdateIncidentsSchema = {
    name: "bulk_update_incidents",
    description: "Update multiple incidents at once with the same fields (e.g. add same work note, change state). Use during outages for mass operations.",
    inputSchema: {
        type: "object",
        properties: {
            incidentNumbers: { type: "string", description: "Comma-separated incident numbers (e.g. 'INC001,INC002,INC003')" },
            fieldsJson: { type: "string", description: "JSON string of fields to apply to all incidents (e.g. '{\"work_notes\": \"Bulk update: linked to parent INC000\"}')" },
        },
        required: ["incidentNumbers", "fieldsJson"],
    },
};

export async function handleBulkUpdateIncidents(args: any) {
    const { incidentNumbers, fieldsJson } = args;

    let fields: Record<string, any>;
    try {
        fields = JSON.parse(fieldsJson);
    } catch {
        return {
            content: [{ type: "text", text: JSON.stringify({ status: "error", message: `Invalid JSON: ${fieldsJson}` }) }],
        };
    }

    if (!fields || typeof fields !== "object" || Array.isArray(fields) || !Object.keys(fields).length) {
        return {
            content: [{ type: "text", text: JSON.stringify({ status: "error", message: "fieldsJson must be a non-empty JSON object" }) }],
        };
    }

    const numbers = incidentNumbers.split(",").map((n: string) => n.trim()).filter(Boolean);
    const results: any[] = [];

    for (const num of numbers) {
        try {
            const sysId = await apiClient.getSysId("incident", "number", num);
            await apiClient.patch(`/table/incident/${sysId}`, fields);
            results.push({ number: num, status: "success" });
        } catch (err: any) {
            results.push({ number: num, status: "error", message: err.message });
        }
    }

    const successCount = results.filter((r) => r.status === "success").length;
    return {
        content: [{ type: "text", text: JSON.stringify({
            status: "complete",
            total: numbers.length,
            succeeded: successCount,
            failed: numbers.length - successCount,
            updatedFields: Object.keys(fields),
            results,
        }, null, 2) }],
    };
}
