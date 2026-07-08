import { xrayCloudGraphQL, validateIssueKey } from "../utils/xrayCloudApi.js";

export const xrayCloudUpdateTestDatasetsSchema = {
    name: "xray_cloud_update_test_datasets",
    description: "Create or update the dataset (parameterized test data) for a test case in XRay Cloud. Defines parameters and iteration rows.",
    inputSchema: {
        type: "object",
        properties: {
            testKey: { type: "string", description: "Test issue key (e.g., DPAY-100)" },
            parameters: {
                type: "array",
                items: { type: "string" },
                description: "Parameter names (column headers) for the dataset (e.g., ['username', 'password', 'expectedResult'])",
            },
            values: {
                type: "array",
                items: {
                    type: "array",
                    items: { type: "string" },
                },
                description: "Rows of values. Each row is an array of strings matching the parameters order (e.g., [['admin', 'pass123', 'success'], ['guest', '', 'failure']])",
            },
            datasetName: {
                type: "string",
                description: "Optional dataset name (defaults to 'Default')",
            },
        },
        required: ["testKey", "parameters", "values"],
    },
};

export async function handleXrayCloudUpdateTestDatasets(args: any): Promise<any> {
    try {
        const { testKey, parameters, values, datasetName } = args;
        validateIssueKey(testKey, "testKey");

        if (!parameters?.length) {
            return { content: [{ type: "text", text: "Error: parameters array must have at least one entry." }], isError: true };
        }
        if (!values?.length) {
            return { content: [{ type: "text", text: "Error: values array must have at least one row." }], isError: true };
        }

        // Validate each row has correct number of values
        for (let i = 0; i < values.length; i++) {
            if (!Array.isArray(values[i]) || values[i].length !== parameters.length) {
                return {
                    content: [{ type: "text", text: `Error: Row ${i + 1} has ${values[i]?.length ?? 0} values but expected ${parameters.length} (matching parameters: ${parameters.join(", ")})` }],
                    isError: true,
                };
            }
        }

        // First get the test internal ID
        const idQuery = `
            query($jql: String!, $limit: Int!) {
                getTests(jql: $jql, limit: $limit) {
                    results {
                        issueId
                    }
                }
            }
        `;
        const idData = await xrayCloudGraphQL(idQuery, { jql: `key = ${testKey}`, limit: 1 });
        const testId = idData?.getTests?.results?.[0]?.issueId;
        if (!testId) {
            return { content: [{ type: "text", text: `No test found for key: ${testKey}` }] };
        }

        // Build dataset input
        const datasetInput = {
            name: datasetName || "Default",
            parameters: parameters.map((name: string) => ({ name })),
            values: values.map((row: string[]) => {
                const obj: Record<string, string> = {};
                parameters.forEach((param: string, idx: number) => {
                    obj[param] = row[idx];
                });
                return obj;
            }),
        };

        const mutation = `
            mutation($issueId: String!, $datasets: [DatasetInput!]!) {
                updateTestDatasets(issueId: $issueId, datasets: $datasets) {
                    issueId
                    datasets {
                        name
                        parameters { name }
                        values
                    }
                }
            }
        `;

        const data = await xrayCloudGraphQL(mutation, {
            issueId: String(testId),
            datasets: [datasetInput],
        });

        const updated = data?.updateTestDatasets?.datasets || [];
        let text = `**Dataset updated for ${testKey}**\n\n`;
        text += `⚠️ Note: Entire dataset was replaced (previous iterations overwritten).\n\n`;
        text += `**Dataset:** ${datasetName || "Default"}\n`;
        text += `**Parameters:** ${parameters.join(", ")}\n`;
        text += `**Iterations:** ${values.length} rows\n\n`;

        // Show the data as table
        text += `| # | ${parameters.join(" | ")} |\n`;
        text += `|---|${parameters.map(() => "---").join("|") }|\n`;
        values.forEach((row: string[], i: number) => {
            text += `| ${i + 1} | ${row.join(" | ")} |\n`;
        });

        return { content: [{ type: "text", text }] };
    } catch (error: any) {
        return { content: [{ type: "text", text: `Error updating XRay Cloud test datasets: ${error.message}` }], isError: true };
    }
}
