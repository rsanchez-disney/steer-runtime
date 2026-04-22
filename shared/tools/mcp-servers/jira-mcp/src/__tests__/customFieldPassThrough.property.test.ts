import * as fc from "fast-check";
import { handleJiraCreateIssue } from "../tools/jiraCreateIssue.js";
import { handleJiraUpdateIssue } from "../tools/jiraUpdateIssue.js";

// Ensure auth doesn't fail — JiraAuth reads JIRA_PAT from env
process.env.JIRA_PAT = "test-token";

// Generator for custom field values: objects, strings, or integers
const customFieldValue = fc.oneof(fc.object(), fc.string(), fc.integer());

describe("Custom Field Pass-Through Property Tests", () => {
    let originalFetch: typeof globalThis.fetch;

    afterEach(() => {
        if (originalFetch) {
            globalThis.fetch = originalFetch;
        }
        vi.restoreAllMocks();
    });

    // Feature: jira-mcp-link-and-xray-tools, Property 5: Custom field pass-through on create
    it("Property 5: custom field value passes through unchanged on create", async () => {
        await fc.assert(
            fc.asyncProperty(customFieldValue, async (value) => {
                originalFetch = globalThis.fetch;

                const capturedBodies: any[] = [];

                vi.stubGlobal(
                    "fetch",
                    vi.fn().mockImplementation(async (url: string, init?: any) => {
                        const method = init?.method?.toUpperCase() ?? "GET";

                        // Capture POST to /rest/api/2/issue (the create call)
                        if (method === "POST" && typeof url === "string" && url.includes("/rest/api/2/issue")) {
                            if (init?.body) {
                                capturedBodies.push(JSON.parse(init.body));
                            }
                            return {
                                ok: true,
                                status: 201,
                                json: async () => ({ key: "TEST-1", id: "10001", self: "https://myjira.disney.com/rest/api/2/issue/10001" }),
                                text: async () => JSON.stringify({ key: "TEST-1" }),
                            };
                        }

                        // GET requests (fetchJiraTicket after creation)
                        return {
                            ok: true,
                            status: 200,
                            json: async () => ({
                                key: "TEST-1",
                                fields: {
                                    summary: "Test",
                                    status: { name: "Open" },
                                    assignee: null,
                                    priority: { name: "Medium" },
                                    description: "",
                                },
                            }),
                            text: async () => "{}",
                        };
                    }),
                );

                await handleJiraCreateIssue({
                    projectKey: "TEST",
                    summary: "Test issue",
                    issueType: "Task",
                    customFields: { customfield_20100: value },
                    outputDir: false,
                });

                // Find the POST body that was sent to create the issue
                expect(capturedBodies.length).toBeGreaterThanOrEqual(1);
                const createBody = capturedBodies[0];

                // The value at the resolved field ID should be unchanged
                const actual = createBody.fields.customfield_20100;
                expect(JSON.stringify(actual)).toBe(JSON.stringify(value));
            }),
            { numRuns: 100 },
        );
    });

    // Feature: jira-mcp-link-and-xray-tools, Property 6: Custom field pass-through on update
    it("Property 6: custom field value passes through unchanged on update", async () => {
        await fc.assert(
            fc.asyncProperty(customFieldValue, async (value) => {
                originalFetch = globalThis.fetch;

                let capturedPutBody: any = null;

                vi.stubGlobal(
                    "fetch",
                    vi.fn().mockImplementation(async (url: string, init?: any) => {
                        const method = init?.method?.toUpperCase() ?? "GET";

                        // Capture PUT to /rest/api/2/issue/{ticketId} (the update call)
                        if (method === "PUT" && typeof url === "string" && url.includes("/rest/api/2/issue/")) {
                            if (init?.body) {
                                capturedPutBody = JSON.parse(init.body);
                            }
                            return {
                                ok: true,
                                status: 204,
                                text: async () => "",
                            };
                        }

                        // GET requests (fetchJiraTicket after update)
                        return {
                            ok: true,
                            status: 200,
                            json: async () => ({
                                key: "TEST-1",
                                fields: {
                                    summary: "Test",
                                    status: { name: "Open" },
                                    assignee: null,
                                    priority: { name: "Medium" },
                                    description: "",
                                },
                            }),
                            text: async () => "{}",
                        };
                    }),
                );

                await handleJiraUpdateIssue({
                    ticketId: "TEST-1",
                    customFields: { customfield_20100: value },
                    outputDir: false,
                });

                // The PUT body should contain the value unchanged
                expect(capturedPutBody).not.toBeNull();
                const actual = capturedPutBody.fields.customfield_20100;
                expect(JSON.stringify(actual)).toBe(JSON.stringify(value));
            }),
            { numRuns: 100 },
        );
    });
});
