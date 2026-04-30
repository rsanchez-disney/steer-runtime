import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";

// Mock the apiClient module before importing handlers
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockAddLabels = vi.fn();
const mockAddAssignees = vi.fn();
const mockRequestReviewers = vi.fn();

vi.mock("../utils/apiClient.js", () => ({
    getClient: () => ({
        pulls: {
            create: mockCreate,
            update: mockUpdate,
            requestReviewers: mockRequestReviewers,
        },
        issues: {
            addLabels: mockAddLabels,
            addAssignees: mockAddAssignees,
        },
    }),
    parseRepo: (repo: string) => {
        const [owner, repoName] = repo.split("/");
        return { owner, repo: repoName };
    },
}));

vi.mock("../utils/fileUtils.js", () => ({
    saveToFile: vi.fn().mockResolvedValue("/tmp/test.json"),
}));

vi.mock("../utils/formatting.js", () => ({
    formatTimestamp: () => "2026-04-29T00-00-00",
    formatRepoId: (id: string) => id.replace("/", "-"),
}));

let handleGithubCreatePr: (args: any) => Promise<any>;
let handleGithubUpdatePr: (args: any) => Promise<any>;

beforeAll(async () => {
    const createMod = await import("../tools/githubCreatePr.js");
    handleGithubCreatePr = createMod.handleGithubCreatePr;
    const updateMod = await import("../tools/githubUpdatePr.js");
    handleGithubUpdatePr = updateMod.handleGithubUpdatePr;
});

beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({
        data: {
            number: 99,
            title: "test PR",
            html_url: "https://github.example.com/org/repo/pull/99",
            head: { ref: "feat/test" },
            base: { ref: "main" },
        },
    });
    mockUpdate.mockResolvedValue({
        data: {
            number: 46,
            title: "updated PR",
            state: "open",
        },
    });
    mockAddLabels.mockResolvedValue({ data: [] });
});

describe("githubCreatePr — labels", () => {
    it("does not call addLabels when labels are not provided", async () => {
        await handleGithubCreatePr({
            repo: "org/repo",
            title: "test",
            head: "feat/test",
            outputDir: false,
        });

        expect(mockCreate).toHaveBeenCalledOnce();
        expect(mockAddLabels).not.toHaveBeenCalled();
    });

    it("does not call addLabels when labels array is empty", async () => {
        await handleGithubCreatePr({
            repo: "org/repo",
            title: "test",
            head: "feat/test",
            labels: [],
            outputDir: false,
        });

        expect(mockCreate).toHaveBeenCalledOnce();
        expect(mockAddLabels).not.toHaveBeenCalled();
    });

    it("calls addLabels with correct params when labels are provided", async () => {
        await handleGithubCreatePr({
            repo: "org/repo",
            title: "test",
            head: "feat/test",
            labels: ["upstream-candidate", "feature"],
            outputDir: false,
        });

        expect(mockCreate).toHaveBeenCalledOnce();
        expect(mockAddLabels).toHaveBeenCalledWith({
            owner: "org",
            repo: "repo",
            issue_number: 99,
            labels: ["upstream-candidate", "feature"],
        });
    });

    it("includes labels in the response text", async () => {
        const result = await handleGithubCreatePr({
            repo: "org/repo",
            title: "test",
            head: "feat/test",
            labels: ["upstream-candidate"],
            outputDir: false,
        });

        expect(result.content[0].text).toContain("Labels: upstream-candidate");
    });

    it("does not include labels line in response when no labels", async () => {
        const result = await handleGithubCreatePr({
            repo: "org/repo",
            title: "test",
            head: "feat/test",
            outputDir: false,
        });

        expect(result.content[0].text).not.toContain("Labels:");
    });
});

describe("githubUpdatePr — labels", () => {
    it("does not call addLabels when labels are not provided", async () => {
        await handleGithubUpdatePr({
            repo: "org/repo",
            prNumber: "46",
            title: "new title",
            outputDir: false,
        });

        expect(mockUpdate).toHaveBeenCalledOnce();
        expect(mockAddLabels).not.toHaveBeenCalled();
    });

    it("does not call addLabels when labels array is empty", async () => {
        await handleGithubUpdatePr({
            repo: "org/repo",
            prNumber: "46",
            labels: [],
            outputDir: false,
        });

        expect(mockUpdate).toHaveBeenCalledOnce();
        expect(mockAddLabels).not.toHaveBeenCalled();
    });

    it("calls addLabels with correct params when labels are provided", async () => {
        await handleGithubUpdatePr({
            repo: "org/repo",
            prNumber: "46",
            labels: ["upstream-candidate"],
            outputDir: false,
        });

        expect(mockAddLabels).toHaveBeenCalledWith({
            owner: "org",
            repo: "repo",
            issue_number: 46,
            labels: ["upstream-candidate"],
        });
    });

    it("calls addLabels alongside assignees and reviewers", async () => {
        await handleGithubUpdatePr({
            repo: "org/repo",
            prNumber: "46",
            assignees: ["user1"],
            reviewers: ["user2"],
            labels: ["bugfix", "P1"],
            outputDir: false,
        });

        expect(mockAddAssignees).toHaveBeenCalledWith({
            owner: "org",
            repo: "repo",
            issue_number: 46,
            assignees: ["user1"],
        });
        expect(mockRequestReviewers).toHaveBeenCalledWith({
            owner: "org",
            repo: "repo",
            pull_number: 46,
            reviewers: ["user2"],
        });
        expect(mockAddLabels).toHaveBeenCalledWith({
            owner: "org",
            repo: "repo",
            issue_number: 46,
            labels: ["bugfix", "P1"],
        });
    });

    it("includes labels in the response text", async () => {
        const result = await handleGithubUpdatePr({
            repo: "org/repo",
            prNumber: "46",
            labels: ["upstream-candidate"],
            outputDir: false,
        });

        expect(result.content[0].text).toContain("Labels added: upstream-candidate");
    });
});
