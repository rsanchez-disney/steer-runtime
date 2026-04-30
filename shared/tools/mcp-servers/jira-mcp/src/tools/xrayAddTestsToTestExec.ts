import { JiraApiClient } from "../utils/jiraApi.js";

export const xrayAddTestsToTestExecSchema = {
    name: "xray_add_tests_to_test_exec",
    description:
        "Add one or more Test issues to an XRay Test Execution. Server-only (XRay REST API).",
    inputSchema: {
        type: "object",
        properties: {
            testExecKey: {
                type: "string",
                description: "The Test Execution issue key (e.g., PROJ-100)",
            },
            testKeys: {
                type: "array",
                items: { type: "string" },
                description: 'Array of Test issue keys to add (e.g., ["PROJ-101", "PROJ-102"])',
            },
        },
        required: ["testExecKey", "testKeys"],
    },
};

export async function handleXrayAddTestsToTestExec(args: any): Promise<any> {
    try {
        const { testExecKey, testKeys: rawTestKeys } = args as {
            testExecKey: string;
            testKeys: string[] | string;
        };

        // Handle case where testKeys arrives as a JSON string instead of array
        const testKeys: string[] = typeof rawTestKeys === "string"
            ? JSON.parse(rawTestKeys)
            : rawTestKeys;

        if (!testKeys || testKeys.length === 0) {
            return { content: [{ type: "text", text: "No test keys provided." }] };
        }

        const apiClient = new JiraApiClient();
        await apiClient.addTestsToTestExec(testExecKey, testKeys);

        return {
            content: [{
                type: "text",
                text: `**Tests Added to Test Execution ${testExecKey}**\n\nAdded ${testKeys.length} test(s): ${testKeys.join(", ")}`,
            }],
        };
    } catch (error: any) {
        return {
            content: [{ type: "text", text: `Error adding tests to test execution: ${error.message}` }],
            isError: true,
        };
    }
}
