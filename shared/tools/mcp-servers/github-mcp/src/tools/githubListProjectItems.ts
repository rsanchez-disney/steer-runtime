import { graphql } from "../utils/graphqlClient.js";

export const githubListProjectItemsSchema = {
    name: "github_list_project_items",
    description: "List items in a GitHub Project (v2) with field values. Supports pagination and optional status filter.",
    inputSchema: {
        type: "object",
        properties: {
            owner: { type: "string", description: "Project owner (user or org login)" },
            projectNumber: { type: "number", description: "Project number" },
            ownerType: { type: "string", enum: ["user", "organization"], description: "Owner type (default: user)", default: "user" },
            first: { type: "number", description: "Number of items to fetch (default: 50, max: 100)", default: 50 },
            after: { type: "string", description: "Cursor for pagination (from previous response)" },
            statusFilter: { type: "string", description: "Optional: filter items by status field value (e.g., 'In Progress', 'Done')" },
        },
        required: ["owner", "projectNumber"],
    },
};

const QUERY = `
query($owner: String!, $number: Int!, $first: Int!, $after: String) {
  user(login: $owner) {
    projectV2(number: $number) {
      title
      items(first: $first, after: $after) {
        totalCount
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          content {
            ... on Issue { title number state url repository { nameWithOwner } labels(first:5) { nodes { name } } assignees(first:3) { nodes { login } } }
            ... on PullRequest { title number state url repository { nameWithOwner } labels(first:5) { nodes { name } } assignees(first:3) { nodes { login } } }
            ... on DraftIssue { title }
          }
          fieldValues(first: 15) {
            nodes {
              ... on ProjectV2ItemFieldTextValue { text field { ... on ProjectV2Field { name } } }
              ... on ProjectV2ItemFieldNumberValue { number field { ... on ProjectV2Field { name } } }
              ... on ProjectV2ItemFieldDateValue { date field { ... on ProjectV2Field { name } } }
              ... on ProjectV2ItemFieldSingleSelectValue { name field { ... on ProjectV2SingleSelectField { name } } }
              ... on ProjectV2ItemFieldIterationValue { title startDate duration field { ... on ProjectV2IterationField { name } } }
            }
          }
        }
      }
    }
  }
}`;

const ORG_QUERY = QUERY.replace("user(login: $owner)", "organization(login: $owner)");

export async function handleGithubListProjectItems(args: any) {
    const { owner, projectNumber, ownerType = "user", first = 50, after, statusFilter } = args as {
        owner: string; projectNumber: number; ownerType?: string; first?: number; after?: string; statusFilter?: string;
    };
    const query = ownerType === "organization" ? ORG_QUERY : QUERY;
    const data = await graphql(query, { owner, number: projectNumber, first: Math.min(first, 100), after: after || null });
    const project = (data.user || data.organization)?.projectV2;
    if (!project) {
        return { content: [{ type: "text", text: `Project #${projectNumber} not found for ${ownerType} ${owner}` }] };
    }

    const { items } = project;
    let rows = items.nodes.map((item: any) => {
        const c = item.content || {};
        const fields: Record<string, any> = {};
        for (const fv of item.fieldValues.nodes) {
            const fieldName = fv.field?.name;
            if (!fieldName) continue;
            fields[fieldName] = fv.name || fv.text || fv.title || fv.date || fv.number;
        }
        return {
            id: item.id, title: c.title || "(draft)",
            type: c.number ? (c.url?.includes("/pull/") ? "PR" : "Issue") : "Draft",
            number: c.number, state: c.state, repo: c.repository?.nameWithOwner, url: c.url,
            assignees: c.assignees?.nodes?.map((a: any) => a.login) || [],
            labels: c.labels?.nodes?.map((l: any) => l.name) || [],
            fields,
        };
    });

    if (statusFilter) {
        rows = rows.filter((r: any) => r.fields.Status === statusFilter);
    }

    const lines = [
        `Project: ${project.title} — ${rows.length}${statusFilter ? ` (filtered: ${statusFilter})` : ""} of ${items.totalCount} items`,
        "",
    ];
    for (const r of rows) {
        const assignees = r.assignees.length ? ` [${r.assignees.join(", ")}]` : "";
        const status = r.fields.Status ? ` | ${r.fields.Status}` : "";
        const labels = r.labels.length ? ` {${r.labels.join(", ")}}` : "";
        const ref = r.number ? `#${r.number}` : "";
        lines.push(`${r.type} ${ref} ${r.title}${status}${assignees}${labels}`);
        if (r.repo) lines.push(`  repo: ${r.repo}  url: ${r.url}`);
        const extra = Object.entries(r.fields).filter(([k]) => k !== "Status" && k !== "Title").map(([k, v]) => `${k}: ${v}`);
        if (extra.length) lines.push(`  ${extra.join(" | ")}`);
        lines.push(`  itemId: ${r.id}`);
    }

    if (items.pageInfo.hasNextPage) {
        lines.push(`\n--- More items available. Use after: "${items.pageInfo.endCursor}" to fetch next page ---`);
    }

    return { content: [{ type: "text", text: lines.join("\n") }] };
}
