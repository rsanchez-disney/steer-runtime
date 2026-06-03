import * as fc from "fast-check";
import { handleJiraUpdateIssue } from "../tools/jiraUpdateIssue.js";

process.env.JIRA_PAT = "test-token";

const versionName = fc.stringMatching(/^[a-zA-Z0-9 .]+$/).filter((s) => s.trim().length > 0);

describe("Fix Versions — jira_update_issue", () => {
    let originalFetch: typeof globalThis.fetch;

    beforeEach(() => { originalFetch = globalThis.fetch; });
    afterEach(() => { globalThis.fetch = originalFetch; vi.restoreAllMocks(); });

    it("fixVersions replaces via fields.fixVersions with name objects", async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(versionName, { minLength: 1, maxLength: 5 }),
                async (versions) => {
                    let capturedBody: any = null;

                    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (_url: string, init?: any) => {
                        const method = init?.method?.toUpperCase() ?? "GET";
                        if (method === "PUT") {
                            if (init?.body) capturedBody = JSON.parse(init.body);
                            return { ok: true, status: 204, text: async () => "" };
                        }
                        return { ok: true, status: 200, json: async () => ({ key: "TEST-1", fields: { summary: "Test", status: { name: "Open" }, assignee: null, priority: { name: "Medium" }, description: "" } }), text: async () => "{}" };
                    }));

                    await handleJiraUpdateIssue({ ticketId: "TEST-1", fixVersions: versions, outputDir: false });

                    expect(capturedBody).not.toBeNull();
                    expect(capturedBody.fields.fixVersions).toEqual(
                        versions.map((name) => ({ name })),
                    );
                    // Should NOT have update.fixVersions when using replace mode
                    expect(capturedBody.update).toBeUndefined();
                },
            ),
            { numRuns: 50 },
        );
    });

    it("addFixVersions uses update.fixVersions with add operations", async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(versionName, { minLength: 1, maxLength: 5 }),
                async (versions) => {
                    let capturedBody: any = null;

                    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (_url: string, init?: any) => {
                        const method = init?.method?.toUpperCase() ?? "GET";
                        if (method === "PUT") {
                            if (init?.body) capturedBody = JSON.parse(init.body);
                            return { ok: true, status: 204, text: async () => "" };
                        }
                        return { ok: true, status: 200, json: async () => ({ key: "TEST-1", fields: { summary: "Test", status: { name: "Open" }, assignee: null, priority: { name: "Medium" }, description: "" } }), text: async () => "{}" };
                    }));

                    await handleJiraUpdateIssue({ ticketId: "TEST-1", addFixVersions: versions, outputDir: false });

                    expect(capturedBody).not.toBeNull();
                    expect(capturedBody.update).toBeDefined();
                    expect(capturedBody.update.fixVersions).toEqual(
                        versions.map((name) => ({ add: { name } })),
                    );
                },
            ),
            { numRuns: 50 },
        );
    });

    it("removeFixVersions uses update.fixVersions with remove operations", async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(versionName, { minLength: 1, maxLength: 5 }),
                async (versions) => {
                    let capturedBody: any = null;

                    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (_url: string, init?: any) => {
                        const method = init?.method?.toUpperCase() ?? "GET";
                        if (method === "PUT") {
                            if (init?.body) capturedBody = JSON.parse(init.body);
                            return { ok: true, status: 204, text: async () => "" };
                        }
                        return { ok: true, status: 200, json: async () => ({ key: "TEST-1", fields: { summary: "Test", status: { name: "Open" }, assignee: null, priority: { name: "Medium" }, description: "" } }), text: async () => "{}" };
                    }));

                    await handleJiraUpdateIssue({ ticketId: "TEST-1", removeFixVersions: versions, outputDir: false });

                    expect(capturedBody).not.toBeNull();
                    expect(capturedBody.update).toBeDefined();
                    expect(capturedBody.update.fixVersions).toEqual(
                        versions.map((name) => ({ remove: { name } })),
                    );
                },
            ),
            { numRuns: 50 },
        );
    });

    it("combined add + remove produces interleaved update operations", async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(versionName, { minLength: 1, maxLength: 3 }),
                fc.array(versionName, { minLength: 1, maxLength: 3 }),
                async (addVersions, removeVersions) => {
                    let capturedBody: any = null;

                    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (_url: string, init?: any) => {
                        const method = init?.method?.toUpperCase() ?? "GET";
                        if (method === "PUT") {
                            if (init?.body) capturedBody = JSON.parse(init.body);
                            return { ok: true, status: 204, text: async () => "" };
                        }
                        return { ok: true, status: 200, json: async () => ({ key: "TEST-1", fields: { summary: "Test", status: { name: "Open" }, assignee: null, priority: { name: "Medium" }, description: "" } }), text: async () => "{}" };
                    }));

                    await handleJiraUpdateIssue({ ticketId: "TEST-1", addFixVersions: addVersions, removeFixVersions: removeVersions, outputDir: false });

                    expect(capturedBody).not.toBeNull();
                    const ops = capturedBody.update.fixVersions;
                    const expectedOps = [
                        ...addVersions.map((name) => ({ add: { name } })),
                        ...removeVersions.map((name) => ({ remove: { name } })),
                    ];
                    expect(ops).toEqual(expectedOps);
                },
            ),
            { numRuns: 50 },
        );
    });
});
