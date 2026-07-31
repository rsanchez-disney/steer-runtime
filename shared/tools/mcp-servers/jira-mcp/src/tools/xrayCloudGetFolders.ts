import { xrayCloudGraphQL } from "../utils/xrayCloudApi.js";

export const xrayCloudGetFoldersSchema = {
    name: "xray_cloud_get_folders",
    description:
        "List XRay Test Repository folders for a project. Returns folder tree with names, paths, and test counts. Use to discover folder paths before moving tests.",
    inputSchema: {
        type: "object" as const,
        properties: {
            projectKey: {
                type: "string",
                description: "Jira project key (e.g., PAS2)",
            },
            path: {
                type: "string",
                description:
                    "Folder path to list (e.g., '/Passport - UI'). Omit or use '/' for root.",
            },
        },
        required: ["projectKey"],
    },
};

export async function handleXrayCloudGetFolders(args: any): Promise<any> {
    try {
        const { projectKey, path } = args;

        const query = `
            query GetFolder($projectId: String!, $path: String) {
                getFolder(projectId: $projectId, path: $path) {
                    name
                    path
                    testsCount
                    folders {
                        name
                        path
                        testsCount
                        folders {
                            name
                            path
                            testsCount
                        }
                    }
                }
            }
        `;

        const variables: Record<string, unknown> = { projectId: projectKey };
        if (path) variables.path = path;

        const data = await xrayCloudGraphQL(query, variables);
        const folder = data?.getFolder;

        if (!folder) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No folder found for project ${projectKey} at path: ${path || "/"}`,
                    },
                ],
            };
        }

        const formatFolder = (f: any, indent = 0): string => {
            const prefix = "  ".repeat(indent);
            let output = `${prefix}📁 ${f.name} (${f.testsCount ?? 0} tests) — path: ${f.path}\n`;
            if (f.folders) {
                for (const sub of f.folders) {
                    output += formatFolder(sub, indent + 1);
                }
            }
            return output;
        };

        const text = `**Test Repository for ${projectKey}** (path: ${path || "/"})\n\n${formatFolder(folder)}`;

        return { content: [{ type: "text", text }] };
    } catch (error: any) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error listing XRay Cloud folders: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
}
