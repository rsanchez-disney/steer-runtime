import { xrayCloudGraphQL, validateIssueKey } from "../utils/xrayCloudApi.js";

export const xrayCloudGetTestDatasetsSchema = {
    name: "xray_cloud_get_test_datasets",
    description: "Get the dataset (parameterized test data) for a test case from XRay Cloud. Returns all iteration rows with their parameter values.",
    inputSchema: {
        type: "object",
        properties: {
            testKey: { type: "string", description: "Test issue key (e.g., DPAY-100)" },
        },
        required: ["testKey"],
    },
};

export async function handleXrayCloudGetTestDatasets(args: any): Promise<any> {
    try {
        const { testKey } = args;
        validateIssueKey(testKey, "testKey");

        const query = `
            query($jql: String!, $limit: Int!) {
                getTests(jql: $jql, limit: $limit) {
                    results {
                        issueId
                        testType { name }
                        datasets {
                            name
                            parameters { name }
                            values
                        }
                    }
                }
            }
        `;

        const data = await xrayCloudGraphQL(query, { jql: `key = ${testKey}`, limit: 1 });
        const test = data?.getTests?.results?.[0];
        if (!test) return { content: [{ type: "text", text: `No test found for key: ${testKey}` }] };

        const datasets = test.datasets || [];
        if (datasets.length === 0) {
            return { content: [{ type: "text", text: `**No datasets configured for ${testKey}**\n\nThis test case has no parameterized dataset defined. You can add one using the xray_cloud_update_test_datasets tool.` }] };
        }

        let text = `**Datasets for ${testKey}**\n**Test Type:** ${test.testType?.name || "Unknown"}\n\n`;

        for (const dataset of datasets) {
            const dsName = dataset.name || "Default";
            const params = dataset.parameters?.map((p: any) => p.name) || [];
            const values = dataset.values || [];

            text += `### Dataset: ${dsName}\n`;
            text += `**Parameters:** ${params.join(", ")}\n`;
            text += `**Iterations:** ${values.length}\n\n`;

            if (params.length > 0 && values.length > 0) {
                // Build markdown table
                text += `| # | ${params.join(" | ")} |\n`;
                text += `|---|${params.map(() => "---").join("|") }|\n`;

                values.forEach((row: any, i: number) => {
                    if (Array.isArray(row)) {
                        text += `| ${i + 1} | ${row.join(" | ")} |\n`;
                    } else if (typeof row === "object" && row !== null) {
                        const cells = params.map((p: string) => row[p] ?? "");
                        text += `| ${i + 1} | ${cells.join(" | ")} |\n`;
                    }
                });
                text += "\n";
            }
        }

        return { content: [{ type: "text", text }] };
    } catch (error: any) {
        return { content: [{ type: "text", text: `Error getting XRay Cloud test datasets: ${error.message}` }], isError: true };
    }
}
