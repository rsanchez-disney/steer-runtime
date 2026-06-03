import * as fc from "fast-check";
import { handleXrayListRepositoryFolders } from "../tools/xrayListRepositoryFolders.js";
import { handleXrayCreateRepositoryFolder } from "../tools/xrayCreateRepositoryFolder.js";
import { handleXrayGetFolderTests } from "../tools/xrayGetFolderTests.js";
import { handleXrayMoveTestsToFolder } from "../tools/xrayMoveTestsToFolder.js";
import { handleXrayDeleteRepositoryFolder } from "../tools/xrayDeleteRepositoryFolder.js";

process.env.JIRA_PAT = "test-token";

const projectKey = fc.stringMatching(/^[A-Z]{2,6}$/).filter((s) => s.length >= 2);
const folderId = fc.stringMatching(/^[0-9]+$/).filter((s) => s.length > 0);
const folderName = fc.stringMatching(/^[a-zA-Z0-9 ]+$/).filter((s) => s.trim().length > 0);
const issueKey = fc.tuple(projectKey, fc.integer({ min: 1, max: 99999 })).map(([p, n]) => `${p}-${n}`);

describe("XRay Test Repository Folder Tools", () => {
    let originalFetch: typeof globalThis.fetch;

    beforeEach(() => { originalFetch = globalThis.fetch; });
    afterEach(() => { globalThis.fetch = originalFetch; vi.restoreAllMocks(); });

    describe("xray_list_repository_folders", () => {
        it("renders folder hierarchy with names and IDs", async () => {
            await fc.assert(
                fc.asyncProperty(projectKey, async (project) => {
                    const mockFolders = [
                        { id: 1, name: "All Test Cases", folders: [{ id: 2, name: "Feature A", folders: [] }] },
                    ];

                    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
                        ok: true, status: 200,
                        json: async () => ({ folders: mockFolders }),
                    }));

                    const result = await handleXrayListRepositoryFolders({ projectKey: project });

                    expect(result.isError).toBeFalsy();
                    const text = result.content[0].text;
                    expect(text).toContain("All Test Cases");
                    expect(text).toContain("Feature A");
                    expect(text).toContain(project);
                }),
                { numRuns: 20 },
            );
        });

        it("returns error on API failure", async () => {
            vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
                ok: false, status: 403, statusText: "Forbidden",
                text: async () => "Access denied",
            }));

            const result = await handleXrayListRepositoryFolders({ projectKey: "TEST" });
            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("403");
        });
    });

    describe("xray_create_repository_folder", () => {
        it("sends POST with folder name in body", async () => {
            await fc.assert(
                fc.asyncProperty(projectKey, folderId, folderName, async (project, parentId, name) => {
                    let capturedUrl = "";
                    let capturedBody: any = null;

                    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (url: string, init?: any) => {
                        if (init?.method === "POST") {
                            capturedUrl = url;
                            capturedBody = JSON.parse(init.body);
                        }
                        return { ok: true, status: 200, json: async () => ({ id: 999, name }) };
                    }));

                    const result = await handleXrayCreateRepositoryFolder({ projectKey: project, parentFolderId: parentId, name });

                    expect(result.isError).toBeFalsy();
                    expect(capturedUrl).toContain(`/testrepository/${project}/folders/${parentId}`);
                    expect(capturedBody.name).toBe(name);
                }),
                { numRuns: 30 },
            );
        });
    });

    describe("xray_get_folder_tests", () => {
        it("renders test keys from response", async () => {
            await fc.assert(
                fc.asyncProperty(projectKey, folderId, async (project, folder) => {
                    const mockTests = [
                        { key: "TEST-100", summary: "Login test" },
                        { key: "TEST-101", summary: "Logout test" },
                    ];

                    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
                        ok: true, status: 200,
                        json: async () => ({ tests: mockTests }),
                    }));

                    const result = await handleXrayGetFolderTests({ projectKey: project, folderId: folder });

                    expect(result.isError).toBeFalsy();
                    const text = result.content[0].text;
                    expect(text).toContain("TEST-100");
                    expect(text).toContain("TEST-101");
                }),
                { numRuns: 20 },
            );
        });

        it("pagination params are passed to the API", async () => {
            let capturedUrl = "";

            vi.stubGlobal("fetch", vi.fn().mockImplementation(async (url: string) => {
                capturedUrl = url;
                return { ok: true, status: 200, json: async () => ({ tests: [] }) };
            }));

            await handleXrayGetFolderTests({ projectKey: "CL", folderId: "42", page: 3, limit: 25 });

            expect(capturedUrl).toContain("page=3");
            expect(capturedUrl).toContain("limit=25");
        });
    });

    describe("xray_move_tests_to_folder", () => {
        it("sends PUT with add and remove arrays", async () => {
            await fc.assert(
                fc.asyncProperty(
                    projectKey,
                    folderId,
                    fc.array(issueKey, { minLength: 1, maxLength: 5 }),
                    fc.array(issueKey, { minLength: 1, maxLength: 3 }),
                    async (project, folder, addKeys, removeKeys) => {
                        let capturedBody: any = null;

                        vi.stubGlobal("fetch", vi.fn().mockImplementation(async (_url: string, init?: any) => {
                            if (init?.method === "PUT") {
                                capturedBody = JSON.parse(init.body);
                            }
                            return { ok: true, status: 200, text: async () => "" };
                        }));

                        const result = await handleXrayMoveTestsToFolder({
                            projectKey: project,
                            folderId: folder,
                            add: addKeys,
                            remove: removeKeys,
                        });

                        expect(result.isError).toBeFalsy();
                        expect(capturedBody.add).toEqual(addKeys);
                        expect(capturedBody.remove).toEqual(removeKeys);
                    },
                ),
                { numRuns: 30 },
            );
        });

        it("returns message when no keys provided", async () => {
            const result = await handleXrayMoveTestsToFolder({ projectKey: "CL", folderId: "1" });
            expect(result.content[0].text).toContain("No test keys");
        });
    });

    describe("xray_delete_repository_folder", () => {
        it("sends DELETE to correct URL", async () => {
            await fc.assert(
                fc.asyncProperty(projectKey, folderId, async (project, folder) => {
                    let capturedUrl = "";
                    let capturedMethod = "";

                    vi.stubGlobal("fetch", vi.fn().mockImplementation(async (url: string, init?: any) => {
                        capturedUrl = url;
                        capturedMethod = init?.method ?? "GET";
                        return { ok: true, status: 204, text: async () => "" };
                    }));

                    const result = await handleXrayDeleteRepositoryFolder({ projectKey: project, folderId: folder });

                    expect(result.isError).toBeFalsy();
                    expect(capturedMethod).toBe("DELETE");
                    expect(capturedUrl).toContain(`/testrepository/${project}/folders/${folder}`);
                }),
                { numRuns: 20 },
            );
        });

        it("returns error on API failure", async () => {
            vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
                ok: false, status: 404, statusText: "Not Found",
                text: async () => "Folder not found",
            }));

            const result = await handleXrayDeleteRepositoryFolder({ projectKey: "CL", folderId: "999" });
            expect(result.isError).toBe(true);
            expect(result.content[0].text).toContain("404");
        });
    });
});
