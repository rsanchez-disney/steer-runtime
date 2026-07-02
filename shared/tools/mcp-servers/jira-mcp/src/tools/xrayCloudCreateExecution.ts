import { xrayCloudGraphQL, validateIssueKey } from "../utils/xrayCloudApi.js";
import { JiraApiClient } from "../utils/jiraApi.js";

export const xrayCloudCreateExecutionSchema = {
    name: "xray_cloud_create_execution",
    description: "Create a test execution in XRay Cloud, optionally linked to a test plan and specific tests.",
    inputSchema: {
        type: "object",
        properties: {
            projectKey: { type: "string", description: "Jira project key (e.g., DPAY)" },
            summary: { type: "string", description: "Execution summary/title" },
            testPlanKey: { type: "string", description: "Test Plan issue key to link (optional)" },
            testKeys: { type: "array", items: { type: "string" }, description: "Test issue keys to include (optional)" },
            environment: { type: "string", description: "Test environment name (optional)" },
            customFields: { type: "object", description: "Custom Jira fields to set (e.g., {\"description\": \"...\", \"fixVersion\": \"1.0\"})" },
        },
        required: ["projectKey", "summary"],
    },
};

/**
 * Resolve Jira issue keys to numeric IDs via Jira REST API.
 * XRay Cloud GraphQL mutations require numeric Jira issue IDs.
 */
async function resolveIssueIds(apiClient: JiraApiClient, keys: string[]): Promise<string[]> {
    const ids: string[] = [];
    for (const key of keys) {
        validateIssueKey(key, "testKey");
        const issue = await apiClient.fetchJiraTicket(key, ["summary"]);
        if (!issue?.id) {
            throw new Error(`Could not resolve Jira ID for ${key}`);
        }
        ids.push(issue.id);
    }
    return ids;
}

export async function handleXrayCloudCreateExecution(args: any): Promise<any> {
    try {
        const { projectKey, summary, testPlanKey, testKeys, environment, customFields } = args;

        // Validate that at least one of testKeys or testPlanKey is provided
        if ((!testKeys || testKeys.length === 0) && !testPlanKey) {
            return {
                content: [{ type: "text", text: "Error: At least one of `testKeys` or `testPlanKey` must be provided." }],
                isError: true,
            };
        }

        const apiClient = new JiraApiClient();

        // Resolve issue keys to numeric Jira IDs (required by XRay Cloud GraphQL)
        let testIssueIds: string[] = [];
        if (testKeys?.length) {
            testIssueIds = await resolveIssueIds(apiClient, testKeys);
        }

        // Resolve test plan key to numeric ID if provided
        let testPlanId: string | undefined;
        if (testPlanKey) {
            validateIssueKey(testPlanKey, "testPlanKey");
            const planIssue = await apiClient.fetchJiraTicket(testPlanKey, ["summary"]);
            if (!planIssue?.id) {
                throw new Error(`Could not resolve Jira ID for test plan ${testPlanKey}`);
            }
            testPlanId = planIssue.id;
        }

        // Build Jira fields for the new Test Execution issue
        const jiraFields: any = {
            summary,
            project: { key: projectKey },
        };

        // Add optional custom fields
        if (customFields && typeof customFields === "object") {
            const allowed = new Set(["description", "fixVersion", "labels", "priority"]);
            for (const [key, value] of Object.entries(customFields)) {
                if (allowed.has(key)) {
                    jiraFields[key] = value;
                }
            }
        }

        // Build GraphQL mutation
        const mutation = `
            mutation CreateTestExecution(
                $testIssueIds: [String]!
                $jira: JSON!
                ${testPlanId ? "$testPlanId: String" : ""}
                ${environment ? "$testEnvironments: [String]" : ""}
            ) {
                createTestExecution(
                    testIssueIds: $testIssueIds
                    jira: $jira
                    ${testPlanId ? "testPlanId: $testPlanId" : ""}
                    ${environment ? "testEnvironments: $testEnvironments" : ""}
                ) {
                    testExecution {
                        issueId
                        jira(fields: ["key", "summary"])
                    }
                    warnings
                }
            }
        `;

        const variables: any = {
            testIssueIds,
            jira: { fields: jiraFields },
        };
        if (testPlanId) variables.testPlanId = testPlanId;
        if (environment) variables.testEnvironments = [environment];

        const data = await xrayCloudGraphQL(mutation, variables);
        const result = data?.createTestExecution;
        const key = result?.testExecution?.jira?.key || result?.testExecution?.issueId || "unknown";
        const warnings = result?.warnings?.length ? `\n**Warnings:** ${result.warnings.join(", ")}` : "";

        return {
            content: [{
                type: "text",
                text: `**Test Execution Created:** ${key}\n\n**Summary:** ${summary}\n**Tests:** ${testKeys?.join(", ") || "none"} (${testIssueIds.length} linked)\n${testPlanKey ? `**Plan:** ${testPlanKey}\n` : ""}${environment ? `**Environment:** ${environment}\n` : ""}${warnings}`,
            }],
        };
    } catch (error: any) {
        return { content: [{ type: "text", text: `Error creating XRay Cloud execution: ${error.message}` }], isError: true };
    }
}
