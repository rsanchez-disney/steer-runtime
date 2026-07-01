import { xrayCloudGraphQL, validateIssueKey } from "../utils/xrayCloudApi.js";

export const xrayCloudAddPreconditionSchema = {
    name: "xray_cloud_add_precondition",
    description: "Create a precondition in XRay Cloud and link it to test cases. Preconditions define setup requirements that must be met before test execution.",
    inputSchema: {
        type: "object",
        properties: {
            projectKey: { type: "string", description: "Jira project key (e.g., POS)" },
            summary: { type: "string", description: "Precondition title/summary" },
            preconditionType: { type: "string", enum: ["Manual", "Cucumber"], description: "Precondition type (default: Manual)" },
            definition: { type: "string", description: "Precondition definition text (plain text for Manual, Gherkin Background for Cucumber)" },
            testKeys: {
                type: "array",
                items: { type: "string" },
                description: "Test issue keys to link this precondition to (e.g., [\"POS-100\", \"POS-101\"])",
            },
        },
        required: ["projectKey", "summary"],
    },
};

export async function handleXrayCloudAddPrecondition(args: any): Promise<any> {
    try {
        const { projectKey, summary, preconditionType = "Manual", definition, testKeys } = args;

        const mutation = `mutation CreatePrecondition($jira: JSON!, $preconditionType: UpdatePreconditionTypeInput, $definition: String, $testIssueIds: [String!]) {
            createPrecondition(jira: $jira, preconditionType: $preconditionType, definition: $definition, testIssueIds: $testIssueIds) {
                precondition { issueId jira(fields: ["key"]) preconditionType { name } }
                warnings
            }
        }`;

        const variables: any = {
            jira: { fields: { summary, project: { key: projectKey } } },
            preconditionType: { name: preconditionType },
        };

        if (definition) variables.definition = definition;
        if (testKeys?.length) {
            testKeys.forEach((k: string) => validateIssueKey(k, "testKeys"));
            variables.testIssueIds = testKeys;
        }

        const data = await xrayCloudGraphQL(mutation, variables);
        const key = data?.createPrecondition?.precondition?.jira?.key || "unknown";
        const warnings = data?.createPrecondition?.warnings || [];

        let text = `**Precondition Created:** ${key}\n\n**Summary:** ${summary}\n**Type:** ${preconditionType}`;
        if (definition) text += `\n**Definition:** included`;
        if (testKeys?.length) text += `\n**Linked to:** ${testKeys.join(", ")}`;
        if (warnings.length) text += `\n**Warnings:** ${warnings.join(", ")}`;

        return { content: [{ type: "text", text }] };
    } catch (error: any) {
        return { content: [{ type: "text", text: `Error creating XRay Cloud precondition: ${error.message}` }], isError: true };
    }
}
