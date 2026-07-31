import { xrayCloudGraphQL } from "../utils/xrayCloudApi.js";

export const xrayCloudMoveTestsToFolderSchema = {
    name: "xray_cloud_move_tests_to_folder",
    description:
        "Move test cases to a specific folder in the XRay Test Repository. Use xray_cloud_get_folders first to verify the folder path exists.",
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
                    "Target folder path (e.g., '/Passport - UI' or '/Passport - BE')",
            },
            testKeys: {
                type: "array",
                items: { type: "string" },
                description:
                    "Array of test issue keys to move (e.g., ['PAS2-100', 'PAS2-101'])",
            },
        },
        required: ["projectKey", "path", "testKeys"],
    },
};

export async function handleXrayCloudMoveTestsToFolder(args: any): Promise<any> {
    try {
        const { projectKey, path, testKeys } = args;

        if (!testKeys || testKeys.length === 0) {
            return {
                content: [{ type: "text", text: "Error: testKeys array must not be empty." }],
                isError: true,
            };
        }

        // Step 1: Resolve test keys to issue IDs using getTests query
        const resolveQuery = `
            query GetTests($jql: String!, $limit: Int!) {
                getTests(jql: $jql, limit: $limit) {
                    results {
                        issueId
                        jira(fields: ["key"])
                    }
                }
            }
        `;

        const jql = `key in (${testKeys.join(",")})`;
        const resolveData = await xrayCloudGraphQL(resolveQuery, {
            jql,
            limit: testKeys.length,
        });

        const tests = resolveData?.getTests?.results || [];
        if (tests.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No tests found for keys: ${testKeys.join(", ")}. Verify the keys exist and are XRay test issues.`,
                    },
                ],
                isError: true,
            };
        }

        const testIssueIds = tests.map((t: any) => t.issueId);
        const resolvedKeys = tests.map((t: any) => {
            const jiraData =
                typeof t.jira === "string" ? JSON.parse(t.jira) : t.jira;
            return jiraData?.key || t.issueId;
        });

        // Step 2: Move tests to folder
        const mutation = `
            mutation AddTestsToFolder($projectId: String!, $path: String!, $testIssueIds: [String!]!) {
                addTestsToFolder(projectId: $projectId, path: $path, testIssueIds: $testIssueIds)
            }
        `;

        await xrayCloudGraphQL(mutation, {
            projectId: projectKey,
            path,
            testIssueIds,
        });

        const movedList = resolvedKeys
            .map((k: string) => `  - ${k}`)
            .join("\n");

        return {
            content: [
                {
                    type: "text",
                    text: `✅ Successfully moved ${resolvedKeys.length} test(s) to folder "${path}":\n${movedList}`,
                },
            ],
        };
    } catch (error: any) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error moving tests to folder: ${error.message}`,
                },
            ],
            isError: true,
        };
    }
}
