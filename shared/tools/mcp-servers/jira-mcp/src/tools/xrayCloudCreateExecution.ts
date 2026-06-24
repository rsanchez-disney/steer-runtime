import { xrayCloudPost } from "../utils/xrayCloudApi.js";

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
        },
        required: ["projectKey", "summary"],
    },
};

export async function handleXrayCloudCreateExecution(args: any): Promise<any> {
    try {
        const { projectKey, summary, testPlanKey, testKeys, environment } = args;

        const info: any = { summary, project: projectKey };
        if (testPlanKey) info.testPlanKey = testPlanKey;
        if (environment) info.testEnvironments = [environment];

        const payload: any = { info };
        if (testKeys?.length) {
            payload.tests = testKeys.map((k: string) => ({ testKey: k }));
        }

        const result = await xrayCloudPost("/api/v2/import/execution", payload);
        const key = result?.key || result?.testExecIssue?.key || JSON.stringify(result);

        return {
            content: [{ type: "text", text: `**Test Execution Created:** ${key}\n\n**Summary:** ${summary}\n**Tests:** ${testKeys?.length || 0}\n${testPlanKey ? `**Plan:** ${testPlanKey}\n` : ""}${environment ? `**Environment:** ${environment}` : ""}` }],
        };
    } catch (error: any) {
        return { content: [{ type: "text", text: `Error creating XRay Cloud execution: ${error.message}` }], isError: true };
    }
}
