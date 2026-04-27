import { graphql } from "../utils/graphqlClient.js";

export const githubGetProjectSchema = {
    name: "github_get_project",
    description: "Fetch a GitHub Project (v2) by owner and project number. Returns title, description, fields, status options, and item count.",
    inputSchema: {
        type: "object",
        properties: {
            owner: { type: "string", description: "Project owner (user or org login)" },
            projectNumber: { type: "number", description: "Project number (from the URL, e.g., 2 for /projects/2)" },
            ownerType: { type: "string", enum: ["user", "organization"], description: "Owner type (default: user)", default: "user" },
        },
        required: ["owner", "projectNumber"],
    },
};

const QUERY = `
query($owner: String!, $number: Int!) {
  user(login: $owner) {
    projectV2(number: $number) {
      id title shortDescription url closed
      items { totalCount }
      fields(first: 30) {
        nodes {
          ... on ProjectV2Field { id name dataType }
          ... on ProjectV2IterationField { id name dataType configuration { iterations { id title startDate duration } } }
          ... on ProjectV2SingleSelectField { id name dataType options { id name color description } }
        }
      }
    }
  }
}`;

const ORG_QUERY = QUERY.replace("user(login: $owner)", "organization(login: $owner)");

export async function handleGithubGetProject(args: any) {
    const { owner, projectNumber, ownerType = "user" } = args as {
        owner: string; projectNumber: number; ownerType?: string;
    };
    const query = ownerType === "organization" ? ORG_QUERY : QUERY;
    const data = await graphql(query, { owner, number: projectNumber });
    const project = (data.user || data.organization)?.projectV2;
    if (!project) {
        return { content: [{ type: "text", text: `Project #${projectNumber} not found for ${ownerType} ${owner}` }] };
    }

    const fields = project.fields.nodes.map((f: any) => {
        let info = `${f.name} (${f.dataType})`;
        if (f.options) info += `: ${f.options.map((o: any) => o.name).join(", ")}`;
        if (f.configuration?.iterations) info += `: ${f.configuration.iterations.map((i: any) => i.title).join(", ")}`;
        return { id: f.id, name: f.name, type: f.dataType, detail: info };
    });

    const text = [
        `Project: ${project.title}`,
        `ID: ${project.id}`,
        `URL: ${project.url}`,
        `Status: ${project.closed ? "Closed" : "Open"}`,
        project.shortDescription ? `Description: ${project.shortDescription}` : null,
        `Items: ${project.items.totalCount}`,
        `\nFields (${fields.length}):`,
        ...fields.map((f: any) => `  - ${f.detail}`),
    ].filter(Boolean).join("\n");

    return { content: [{ type: "text", text }] };
}
