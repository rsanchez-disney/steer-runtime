import { xrayCloudGraphQL, validateIssueKey } from "../utils/xrayCloudApi.js";

export const xrayCloudUpdateTestTypeSchema = {
    name: "xray_cloud_update_test_type",
    description: "Update the Test Type of an existing test case in XRay Cloud (Manual, Cucumber, Generic). Also supports updating Gherkin definition or manual steps.",
    inputSchema: {
        type: "object",
        properties: {
            testKey: { type: "string", description: "Test issue key (e.g., POS-1234)" },
            testType: { type: "string", enum: ["Manual", "Cucumber", "Generic"], description: "New test type" },
            gherkin: { type: "string", description: "Gherkin definition (for Cucumber type). Replaces existing definition." },
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
                description: "Replace test steps (for Manual/Generic types)",
            },
        },
        required: ["testKey", "testType"],
    },
};

export async function handleXrayCloudUpdateTestType(args: any): Promise<any> {
    try {
        const { testKey, testType, gherkin, steps } = args;
        validateIssueKey(testKey, "testKey");

        // Resolve testKey to numeric issueId (required by XRay Cloud GraphQL mutations)
        const resolveQuery = `query($jql: String!, $limit: Int!) {
            getTests(jql: $jql, limit: $limit) {
                results { issueId }
            }
        }`;
        const resolveResult = await xrayCloudGraphQL(resolveQuery, { jql: `key = ${testKey}`, limit: 1 });
        const numericId = resolveResult?.getTests?.results?.[0]?.issueId;
        if (!numericId) {
            return { content: [{ type: "text", text: `Error: Could not resolve numeric issueId for ${testKey}. Ensure the test exists in XRay Cloud.` }], isError: true };
        }

        // Step 1: Update the test type
        const typeMutation = `mutation UpdateTestType($issueId: String!, $testType: UpdateTestTypeInput!) {
            updateTestType(issueId: $issueId, testType: $testType) {
                __typename
            }
        }`;

        await xrayCloudGraphQL(typeMutation, {
            issueId: numericId,
            testType: { name: testType },
        });

        const warnings: string[] = [];
        let text = `**Updated Test Type:** ${testKey} → ${testType}`;

        // Step 2: If Cucumber, update gherkin definition
        if (testType === "Cucumber" && gherkin) {
            const gherkinMutation = `mutation UpdateGherkin($issueId: String!, $gherkin: String!) {
                updateGherkinTestDefinition(issueId: $issueId, gherkin: $gherkin) {
                    __typename
                }
            }`;

            await xrayCloudGraphQL(gherkinMutation, {
                issueId: numericId,
                gherkin,
            });

            text += `\n**Gherkin:** updated`;
        }

        // Step 3: If Manual/Generic with steps, replace steps
        if ((testType === "Manual" || testType === "Generic") && steps?.length) {
            // Remove all existing steps first
            const removeAllMutation = `mutation RemoveAllSteps($issueId: String!, $versionId: Int) {
                removeAllTestSteps(issueId: $issueId, versionId: $versionId)
            }`;
            await xrayCloudGraphQL(removeAllMutation, { issueId: numericId, versionId: null });

            // Add new steps one by one (API only supports singular addTestStep)
            for (const step of steps) {
                const addMutation = `mutation AddStep($issueId: String!, $step: CreateStepInput!) {
                    addTestStep(issueId: $issueId, step: $step) {
                        id
                    }
                }`;
                await xrayCloudGraphQL(addMutation, {
                    issueId: numericId,
                    step: { action: step.action, data: step.data || "", result: step.result },
                });
            }

            text += `\n**Steps:** ${steps.length} (replaced)`;
        }

        if (warnings.length) text += `\n**Warnings:** ${warnings.join(", ")}`;

        return { content: [{ type: "text", text }] };
    } catch (error: any) {
        return { content: [{ type: "text", text: `Error updating XRay Cloud test type: ${error.message}` }], isError: true };
    }
}
