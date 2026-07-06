import { JiraApiClient } from "../utils/jiraApi.js";
import { validateIssueKey } from "../utils/xrayCloudApi.js";

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
        validateIssueKey(testKey, "testKey");
        validateIssueKey(storyKey, "storyKey");

        const apiClient = new JiraApiClient();
        // XRay test-to-story link type is "Test"
        // inward: "is tested by" (story), outward: "tests" (test)
        await apiClient.linkJiraIssues(storyKey, testKey, "Test");

        const text = `**Linked:** ${testKey} → ${storyKey}\n\n**Link Type:** Test\n**Test (outward):** ${testKey} — tests\n**Story (inward):** ${storyKey} — is tested by`;

        return { content: [{ type: "text", text }] };
    } catch (error: any) {
        return { content: [{ type: "text", text: `Error linking test to story: ${error.message}` }], isError: true };
    }
}
