import * as fc from "fast-check";
import { JiraApiClient } from "../utils/jiraApi.js";
import { handleJiraLinkIssues } from "../tools/jiraLinkIssues.js";
import { handleJiraGetLinkTypes } from "../tools/jiraGetLinkTypes.js";

// Ensure auth doesn't fail — JiraAuth reads JIRA_PAT from env
process.env.JIRA_PAT = "test-token";

// Reusable generator: non-empty alphanumeric strings
const nonEmptyAlphaNum = fc.stringMatching(/^[a-zA-Z0-9]+$/).filter((s) => s.length > 0);
// Reusable generator: non-empty printable strings (no newlines to keep assertions simple)
const nonEmptyString = fc.stringMatching(/^[^\n\r]+$/).filter((s) => s.trim().length > 0);

describe("Link Tools Property Tests", () => {
    let originalFetch: typeof globalThis.fetch;

    beforeEach(() => {
        originalFetch = globalThis.fetch;
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
        vi.restoreAllMocks();
    });

    // Feature: jira-mcp-link-and-xray-tools, Property 1: Link request body preserves inputs
    it("Property 1: linkJiraIssues request body preserves all inputs", async () => {
        await fc.assert(
            fc.asyncProperty(
                nonEmptyAlphaNum,
                nonEmptyAlphaNum,
                nonEmptyAlphaNum,
                async (inwardTicketId, outwardTicketId, linkType) => {
                    vi.stubGlobal(
                        "fetch",
                        vi.fn().mockResolvedValue({
                            ok: true,
                            status: 201,
                            text: async () => "",
                        }),
                    );

                    const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;

                    const apiClient = new JiraApiClient();
                    await apiClient.linkJiraIssues(inwardTicketId, outwardTicketId, linkType);

                    expect(fetchMock).toHaveBeenCalledOnce();
                    const callArgs = fetchMock.mock.calls[0];
                    const capturedBody = JSON.parse(callArgs[1].body);

                    expect(capturedBody.type.name).toBe(linkType);
                    expect(capturedBody.inwardIssue.key).toBe(inwardTicketId);
                    expect(capturedBody.outwardIssue.key).toBe(outwardTicketId);
                },
            ),
            { numRuns: 100 },
        );
    });

    // Feature: jira-mcp-link-and-xray-tools, Property 2: Link handler success result contains all inputs
    it("Property 2: handleJiraLinkIssues success result contains all inputs", async () => {
        await fc.assert(
            fc.asyncProperty(
                nonEmptyString,
                nonEmptyString,
                nonEmptyString,
                async (inwardTicketId, outwardTicketId, linkType) => {
                    vi.stubGlobal(
                        "fetch",
                        vi.fn().mockResolvedValue({
                            ok: true,
                            status: 201,
                            text: async () => "",
                        }),
                    );

                    const result = await handleJiraLinkIssues({
                        inwardTicketId,
                        outwardTicketId,
                        linkType,
                        outputDir: false,
                    });

                    // isError should be absent or falsy
                    expect(result.isError).toBeFalsy();

                    const text = result.content[0].text;
                    expect(text).toContain(inwardTicketId);
                    expect(text).toContain(outwardTicketId);
                    expect(text).toContain(linkType);
                },
            ),
            { numRuns: 100 },
        );
    });

    // Feature: jira-mcp-link-and-xray-tools, Property 3: Link handler error propagation
    it("Property 3: handleJiraLinkIssues propagates error status and body", async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.integer({ min: 400, max: 599 }),
                nonEmptyString,
                async (statusCode, errorBody) => {
                    vi.stubGlobal(
                        "fetch",
                        vi.fn().mockResolvedValue({
                            ok: false,
                            status: statusCode,
                            statusText: "Error",
                            text: async () => errorBody,
                        }),
                    );

                    const result = await handleJiraLinkIssues({
                        inwardTicketId: "TEST-1",
                        outwardTicketId: "TEST-2",
                        linkType: "Test",
                        outputDir: false,
                    });

                    expect(result.isError).toBe(true);

                    const text = result.content[0].text;
                    expect(text).toContain(String(statusCode));
                    expect(text).toContain(errorBody);
                },
            ),
            { numRuns: 100 },
        );
    });

    // Feature: jira-mcp-link-and-xray-tools, Property 4: Get link types output contains all fields
    it("Property 4: handleJiraGetLinkTypes output contains every name, inward, and outward", async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(
                    fc.record({
                        name: nonEmptyString,
                        inward: nonEmptyString,
                        outward: nonEmptyString,
                    }),
                    { minLength: 1 },
                ),
                async (linkTypes) => {
                    vi.stubGlobal(
                        "fetch",
                        vi.fn().mockResolvedValue({
                            ok: true,
                            status: 200,
                            json: async () => ({ issueLinkTypes: linkTypes }),
                        }),
                    );

                    const result = await handleJiraGetLinkTypes({ outputDir: false });

                    const text = result.content[0].text;
                    for (const lt of linkTypes) {
                        expect(text).toContain(lt.name);
                        expect(text).toContain(lt.inward);
                        expect(text).toContain(lt.outward);
                    }
                },
            ),
            { numRuns: 100 },
        );
    });
});
