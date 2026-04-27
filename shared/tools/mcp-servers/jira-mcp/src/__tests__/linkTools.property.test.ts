import * as fc from "fast-check";
import { JiraApiClient } from "../utils/jiraApi.js";
import { handleJiraLinkIssues } from "../tools/jiraLinkIssues.js";
import { handleJiraGetLinkTypes } from "../tools/jiraGetLinkTypes.js";

process.env.JIRA_PAT = "test-token";

const nonEmptyAlphaNum = fc.stringMatching(/^[a-zA-Z0-9]+$/).filter((s) => s.length > 0);
const nonEmptyString = fc.stringMatching(/^[^\n\r]+$/).filter((s) => s.trim().length > 0);

describe("Link Tools Property Tests", () => {
    let originalFetch: typeof globalThis.fetch;

    beforeEach(() => { originalFetch = globalThis.fetch; });
    afterEach(() => { globalThis.fetch = originalFetch; vi.restoreAllMocks(); });

    it("Property 1: linkJiraIssues request body preserves all inputs", async () => {
        await fc.assert(
            fc.asyncProperty(nonEmptyAlphaNum, nonEmptyAlphaNum, nonEmptyAlphaNum, async (inward, outward, linkType) => {
                vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 201, text: async () => "" }));
                const fetchMock = globalThis.fetch as ReturnType<typeof vi.fn>;

                const apiClient = new JiraApiClient();
                await apiClient.linkJiraIssues(inward, outward, linkType);

                expect(fetchMock).toHaveBeenCalledOnce();
                const body = JSON.parse(fetchMock.mock.calls[0][1].body);
                expect(body.type.name).toBe(linkType);
                expect(body.inwardIssue.key).toBe(inward);
                expect(body.outwardIssue.key).toBe(outward);
            }),
            { numRuns: 100 },
        );
    });

    it("Property 2: handleJiraLinkIssues success result contains all inputs", async () => {
        await fc.assert(
            fc.asyncProperty(nonEmptyString, nonEmptyString, nonEmptyString, async (inward, outward, linkType) => {
                vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 201, text: async () => "" }));

                const result = await handleJiraLinkIssues({ inwardTicketId: inward, outwardTicketId: outward, linkType, outputDir: false });
                expect(result.isError).toBeFalsy();
                const text = result.content[0].text;
                expect(text).toContain(inward);
                expect(text).toContain(outward);
                expect(text).toContain(linkType);
            }),
            { numRuns: 100 },
        );
    });

    it("Property 3: handleJiraLinkIssues propagates error status and body", async () => {
        await fc.assert(
            fc.asyncProperty(fc.integer({ min: 400, max: 599 }), nonEmptyString, async (statusCode, errorBody) => {
                vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: statusCode, statusText: "Error", text: async () => errorBody }));

                const result = await handleJiraLinkIssues({ inwardTicketId: "TEST-1", outwardTicketId: "TEST-2", linkType: "Test", outputDir: false });
                expect(result.isError).toBe(true);
                const text = result.content[0].text;
                expect(text).toContain(String(statusCode));
                expect(text).toContain(errorBody);
            }),
            { numRuns: 100 },
        );
    });

    it("Property 4: handleJiraGetLinkTypes output contains every name, inward, and outward", async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(fc.record({ name: nonEmptyString, inward: nonEmptyString, outward: nonEmptyString }), { minLength: 1 }),
                async (linkTypes) => {
                    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ issueLinkTypes: linkTypes }) }));

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
