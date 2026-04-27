import { apiClient } from "../utils/apiClient.js";

export const getDatamodelFieldsSchema = {
    name: "get_datamodel_fields",
    description: "Get fields and constraints for a specific data model object — shows what's queryable in the dataset",
    inputSchema: {
        type: "object",
        properties: {
            modelName: { type: "string", description: "Data model name (e.g. 'Authentication', 'Network_Traffic')" },
            app: { type: "string", description: "Splunk app containing the data model", default: "search" },
        },
        required: ["modelName"],
    },
};

export async function handleGetDatamodelFields(args: any) {
    const { modelName, app = "search" } = args;

    const data = await apiClient.get(
        `/servicesNS/-/${app}/datamodel/model/${encodeURIComponent(modelName)}`,
    );
    const entry = data?.entry?.[0];

    if (!entry) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: `Data model '${modelName}' not found` }) }],
        };
    }

    // Parse the model JSON description
    let modelDef: any = {};
    try {
        const rawDescription = entry.content?.description;
        if (rawDescription) {
            modelDef = JSON.parse(rawDescription);
        }
    } catch {
        // If parsing fails, return raw content
    }

    const objects = (modelDef.objects ?? []).map((obj: any) => ({
        name: obj.objectName,
        displayName: obj.displayName,
        parentName: obj.parentName,
        baseSearch: obj.baseSearch,
        fields: (obj.fields ?? []).map((f: any) => ({
            fieldName: f.fieldName,
            displayName: f.displayName,
            type: f.type,
            required: f.required,
            multivalue: f.multivalue,
        })),
        constraints: (obj.constraints ?? []).map((c: any) => ({
            search: c.search,
            owner: c.owner,
        })),
    }));

    return {
        content: [{ type: "text", text: JSON.stringify({
            modelName,
            displayName: modelDef.displayName || modelName,
            description: modelDef.description || "",
            objectCount: objects.length,
            objects,
        }, null, 2) }],
    };
}
