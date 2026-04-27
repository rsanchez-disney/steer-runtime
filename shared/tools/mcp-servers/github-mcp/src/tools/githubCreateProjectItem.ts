import { graphql } from "../utils/graphqlClient.js";

export const githubCreateProjectItemSchema = {
    name: "github_create_project_item",
    description: "Add an existing issue or PR to a GitHub Project (v2). Returns the new project item ID.",
    inputSchema: {
        type: "object",
        properties: {
            projectId: { type: "string", description: "Project node ID (from github_get_project)" },
            contentId: { type: "string", description: "Issue or PR node ID to add to the project" },
        },
        required: ["projectId", "contentId"],
    },
};

const MUTATION = `
mutation($projectId: ID!, $contentId: ID!) {
  addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
    item { id }
  }
}`;

export async function handleGithubCreateProjectItem(args: any) {
    const { projectId, contentId } = args as { projectId: string; contentId: string };
    const data = await graphql(MUTATION, { projectId, contentId });
    const itemId = data.addProjectV2ItemById.item.id;
    return { content: [{ type: "text", text: `Item added to project. Item ID: ${itemId}` }] };
}
