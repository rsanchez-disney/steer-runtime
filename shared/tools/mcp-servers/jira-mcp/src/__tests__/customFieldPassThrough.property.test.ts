import * as fc from "fast-check";
import { handleJiraCreateIssue } from "../tools/jiraCreateIssue.js";
import { handleJiraUpdateIssue } from "../tools/jiraUpdateIssue.js";

process.env.JIRA_PAT = "test-token";

const customFieldValue = fc.oneof(fc.object(), fc.string(), fc.integer());

describe("Custom Field Pass-Through Property Tests", () => {
    let originalFetch: typeof globalThis.fetch;

    afterEach(() => { if (originalFetch) globalThis.fetch = originalFetch; vi.restoreAllMocks(); });

    it("Property 5: custom field value passes through unchanged on create", async () => {
        await fc.assert(
            fc.asyncProperty(customFieldValue, async (value) => {
                originalFetch = globalThis.fetch;
                const capturedBodies: any[] = [];

                vi.stubGlobal("fetch", vi.fn().mockImplementation(async (url: string, init?: any) => {
                    const method = init?.method?.toUpperCase() ?? "GET";
                    if (method === "POST" && typeof url === "string" && url.includes("/rest/api/")) {
                        if (init?.body) capturedBodies.push(JSON.parse(init.body));
                        return { ok: true, status: 201, json: async () => ({ key: "TEST-1", id: "10001", self: "https://jira.example.com/rest/api/2/issue/10001" }), text: async () => JSON.stringify({ key: "TEST-1" }) };
                    }
                    return { ok: true, status: 200, json: async () => ({ key: "TEST-1", fields: { summary: "Test", status: { name: "Open" }, assignee: null, priority: { name: "Medium" }, description: "" } }), text: async () => "{}" };
                }));

                await handleJiraCreateIssue({ projectKey: "TEST", summary: "Test issue", issueType: "Task", customFields: { customfield_20100: value }, outputDir: false });

                expect(capturedBodies.length).toBeGreaterThanOrEqual(1);
                expect(JSON.stringify(capturedBodies[0].fields.customfield_20100)).toBe(JSON.stringify(value));
            }),
            { numRuns: 100 },
        );
    });

    it("Property 6: custom field value passes through unchanged on update", async () => {
        await fc.assert(
            fc.asyncProperty(customFieldValue, async (value) => {
                originalFetch = globalThis.fetch;
                let capturedPutBody: any = null;

                vi.stubGlobal("fetch", vi.fn().mockImplementation(async (url: string, init?: any) => {
                    const method = init?.method?.toUpperCase() ?? "GET";
                    if (method === "PUT" && typeof url === "string" && url.includes("/rest/api/")) {
                        if (init?.body) capturedPutBody = JSON.parse(init.body);
                        return { ok: true, status: 204, text: async () => "" };
                    }
                    return { ok: true, status: 200, json: async () => ({ key: "TEST-1", fields: { summary: "Test", status: { name: "Open" }, assignee: null, priority: { name: "Medium" }, description: "" } }), text: async () => "{}" };
                }));

                await handleJiraUpdateIssue({ ticketId: "TEST-1", customFields: { customfield_20100: value }, outputDir: false });

                expect(capturedPutBody).not.toBeNull();
                expect(JSON.stringify(capturedPutBody.fields.customfield_20100)).toBe(JSON.stringify(value));
            }),
            { numRuns: 100 },
        );
    });
});
