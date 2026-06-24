import { xrayCloudGraphQL } from "../utils/xrayCloudApi.js";

export const xrayCloudLinkTestToStorySchema = {
    name: "xray_cloud_link_test_to_story",
    description: "Link a test case to a user story (or any issue) in XRay Cloud via issue link.",
    inputSchema: {
        type: "object",
        properties: {
            testKey: { type: "string", description: "Test issue key (e.g., DPAY-100)" },
            storyKey: { type: "string", description: "Story/requirement issue key to link (e.g., DPAY-50)" },
        },
        required: ["testKey", "storyKey"],
    },
};

export async function handleXrayCloudLinkTestToStory(args: any): Promise<any> {
    try {
        const { testKey, storyKey } = args;

        const mutation = `
            mutation {
                addTestToIssue(
                    testIssueIds: { issueKey: "${testKey}" }
                    issueId: { issueKey: "${storyKey}" }
                ) {
                    addedTests
                    warning
                }
            }
        `;

        const result = await xrayCloudGraphQL(mutation);
        const added = result?.addTestToIssue?.addedTests ?? 0;
        const warning = result?.addTestToIssue?.warning || "";

        let text = `**Linked:** ${testKey} → ${storyKey}\n\n**Tests linked:** ${added}`;
        if (warning) text += `\n**Warning:** ${warning}`;

        return { content: [{ type: "text", text }] };
    } catch (error: any) {
        return { content: [{ type: "text", text: `Error linking test to story: ${error.message}` }], isError: true };
    }
}
