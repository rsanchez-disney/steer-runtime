import { xrayCloudGraphQL } from "../utils/xrayCloudApi.js";

export const xrayCloudCreateTestSchema = {
    name: "xray_cloud_create_test",
    description: "Create a test case in XRay Cloud via GraphQL. Supports Manual (structured steps), Cucumber (Gherkin), and Generic types. Optionally places the test in a repository folder.",
    inputSchema: {
        type: "object",
        properties: {
            projectKey: { type: "string", description: "Jira project key (e.g., DPAY)" },
            summary: { type: "string", description: "Test case title/summary" },
            testType: { type: "string", enum: ["Manual", "Cucumber", "Generic"], description: "Test type (default: Manual)" },
            steps: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        action: { type: "string", description: "Step action/instruction" },
                        data: { type: "string", description: "Test data (optional)" },
                        result: { type: "string", description: "Expected result" },
                    },
                    required: ["action", "result"],
                },
                description: "Array of test steps (for Manual/Generic types)",
            },
            gherkin: { type: "string", description: "Gherkin definition (Given/When/Then) for Cucumber test type" },
            labels: { type: "array", items: { type: "string" }, description: "Labels to apply (optional)" },
            customFields: { type: "object", description: "Custom Jira fields to set (e.g., {\"customfield_13912\": \"EPIC-1\"})" },
            folderPath: {
                type: "string",
                description: "Optional. Repository folder path to place the test in (e.g., '/Passport - UI'). If omitted, test is created at repository root.",
            },
        },
        required: ["projectKey", "summary"],
    },
};

export async function handleXrayCloudCreateTest(args: any): Promise<any> {
    try {
        const { projectKey, summary, testType = "Manual", steps, gherkin, labels, customFields, folderPath } = args;

        const mutation = `mutation CreateTest($jira: JSON!, $testType: UpdateTestTypeInput, $steps: [CreateStepInput], $gherkin: String) {
            createTest(jira: $jira, testType: $testType, steps: $steps, gherkin: $gherkin) {
                test { issueId jira(fields: ["key"]) testType { name } }
                warnings
            }
        }`;

        const jiraFields: any = { summary, project: { key: projectKey }, ...customFields };
        if (labels?.length) jiraFields.labels = labels;

        const variables: any = {
            jira: { fields: jiraFields },
            testType: { name: testType },
        };

        if (gherkin && testType === "Cucumber") {
            variables.gherkin = gherkin;
        } else if (steps?.length) {
            variables.steps = steps.map((s: any) => ({ action: s.action, data: s.data || "", result: s.result }));
        }

        const data = await xrayCloudGraphQL(mutation, variables);
        const key = data?.createTest?.test?.jira?.key || JSON.stringify(data);
        const issueId = data?.createTest?.test?.issueId;
        const warnings = data?.createTest?.warnings;

        let text = `**Test Created:** ${key}\n\n**Summary:** ${summary}\n**Type:** ${testType}`;
        if (steps?.length) text += `\n**Steps:** ${steps.length}`;
        if (gherkin) text += `\n**Gherkin:** included`;
        if (warnings?.length) text += `\n**Warnings:** ${warnings.join(", ")}`;

        // Move test to folder if folderPath is provided
        if (folderPath && issueId) {
            try {
                const folderMutation = `mutation AddTestsToFolder($projectId: String!, $path: String!, $testIssueIds: [String!]!) {
                    addTestsToFolder(projectId: $projectId, path: $path, testIssueIds: $testIssueIds)
                }`;

                await xrayCloudGraphQL(folderMutation, {
                    projectId: projectKey,
                    path: folderPath,
                    testIssueIds: [issueId],
                });

                text += `\n**Folder:** moved to ${folderPath}`;
            } catch (folderError: any) {
                text += `\n⚠️ Test created but folder move failed: ${folderError.message}. Move manually or use xray_cloud_move_tests_to_folder.`;
            }
        }

        return { content: [{ type: "text", text }] };
    } catch (error: any) {
        return { content: [{ type: "text", text: `Error creating XRay Cloud test: ${error.message}` }], isError: true };
    }
}
