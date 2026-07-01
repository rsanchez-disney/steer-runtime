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

        // Step 1: Update the test type
        const typeMutation = `mutation UpdateTestType($issueId: String!, $testType: UpdateTestTypeInput!) {
            updateTestType(issueId: $issueId, testType: $testType) {
                warnings
            }
        }`;

        const typeResult = await xrayCloudGraphQL(typeMutation, {
            issueId: testKey,
            testType: { name: testType },
        });

        const warnings = typeResult?.updateTestType?.warnings || [];
        let text = `**Updated Test Type:** ${testKey} → ${testType}`;

        // Step 2: If Cucumber, update gherkin definition
        if (testType === "Cucumber" && gherkin) {
            const gherkinMutation = `mutation UpdateGherkin($issueId: String!, $gherkin: String!) {
                updateGherkinDefinition(issueId: $issueId, gherkin: $gherkin) {
                    warnings
                }
            }`;

            const gherkinResult = await xrayCloudGraphQL(gherkinMutation, {
                issueId: testKey,
                gherkin,
            });

            const gWarnings = gherkinResult?.updateGherkinDefinition?.warnings || [];
            warnings.push(...gWarnings);
            text += `\n**Gherkin:** updated`;
        }

        // Step 3: If Manual/Generic with steps, replace steps
        if ((testType === "Manual" || testType === "Generic") && steps?.length) {
            // Remove existing steps first, then add new ones
            const removeQuery = `query GetSteps($jql: String!, $limit: Int!) {
                getTests(jql: $jql, limit: $limit) {
                    results { steps { id } }
                }
            }`;

            const existing = await xrayCloudGraphQL(removeQuery, { jql: `key = ${testKey}`, limit: 1 });
            const existingSteps = existing?.getTests?.results?.[0]?.steps || [];

            if (existingSteps.length > 0) {
                const removeIds = existingSteps.map((s: any) => s.id);
                const removeMutation = `mutation RemoveSteps($issueId: String!, $stepIds: [String!]!) {
                    removeTestSteps(issueId: $issueId, stepIds: $stepIds) {
                        warnings
                    }
                }`;
                await xrayCloudGraphQL(removeMutation, { issueId: testKey, stepIds: removeIds });
            }

            // Add new steps
            const addMutation = `mutation AddSteps($issueId: String!, $steps: [CreateStepInput!]!) {
                addTestSteps(issueId: $issueId, steps: $steps) {
                    warnings
                }
            }`;

            await xrayCloudGraphQL(addMutation, {
                issueId: testKey,
                steps: steps.map((s: any) => ({ action: s.action, data: s.data || "", result: s.result })),
            });

            text += `\n**Steps:** ${steps.length} (replaced)`;
        }

        if (warnings.length) text += `\n**Warnings:** ${warnings.join(", ")}`;

        return { content: [{ type: "text", text }] };
    } catch (error: any) {
        return { content: [{ type: "text", text: `Error updating XRay Cloud test type: ${error.message}` }], isError: true };
    }
}
