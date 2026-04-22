import { apiClient } from "../utils/apiClient.js";

export const getDatamodelsSchema = {
    name: "get_datamodels",
    description: "List available data models (CIM-compliant datasets) with acceleration status",
    inputSchema: {
        type: "object",
        properties: {
            app: { type: "string", description: "Splunk app to search in (optional — lists all if omitted)" },
            count: { type: "number", description: "Maximum data models to return (default 50)", default: 50 },
        },
        required: [],
    },
};

export async function handleGetDatamodels(args: any) {
    const { app, count = 50 } = args;

    const path = app
        ? `/servicesNS/-/${app}/datamodel/model`
        : "/services/datamodel/model";

    const data = await apiClient.get(path, { count: String(count) });
    const entries = data?.entry ?? [];

    const models = entries.map((e: any) => ({
        name: e.name,
        displayName: e.content?.displayName || e.name,
        description: e.content?.description || "",
        accelerated: e.content?.["acceleration.enabled"] === "1",
        app: e.acl?.app,
    }));

    return {
        content: [{ type: "text", text: JSON.stringify({ count: models.length, datamodels: models }, null, 2) }],
    };
}
