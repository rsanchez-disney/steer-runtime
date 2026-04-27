import { graphql } from "../utils/graphqlClient.js";

export const githubUpdateProjectItemFieldSchema = {
    name: "github_update_project_item_field",
    description: "Update a field value on a GitHub Project (v2) item. Use github_get_project to get field IDs and option IDs first.",
    inputSchema: {
        type: "object",
        properties: {
            projectId: { type: "string", description: "Project node ID" },
            itemId: { type: "string", description: "Project item node ID" },
            fieldId: { type: "string", description: "Field node ID (from github_get_project fields)" },
            value: {
                type: "object",
                description: "Field value object. Use ONE of: { text: '...' }, { number: 5 }, { date: '2026-01-15' }, { singleSelectOptionId: '...' }, { iterationId: '...' }",
            },
        },
        required: ["projectId", "itemId", "fieldId", "value"],
    },
};

const MUTATION = `
mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: ProjectV2FieldValue!) {
  updateProjectV2ItemFieldValue(input: { projectId: $projectId, itemId: $itemId, fieldId: $fieldId, value: $value }) {
    projectV2Item { id }
  }
}`;

export async function handleGithubUpdateProjectItemField(args: any) {
    const { projectId, itemId, fieldId, value } = args as {
        projectId: string; itemId: string; fieldId: string; value: Record<string, any>;
    };
    await graphql(MUTATION, { projectId, itemId, fieldId, value });
    return { content: [{ type: "text", text: `Field updated successfully on item ${itemId}` }] };
}
