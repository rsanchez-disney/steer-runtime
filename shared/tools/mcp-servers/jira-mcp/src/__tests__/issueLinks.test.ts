import * as fc from "fast-check";
import { handleJiraGetIssue } from "../tools/jiraGetIssue.js";
import { buildFormattedSummary } from "../utils/formatting.js";
import type { JiraTicket } from "../utils/types.js";

process.env.JIRA_PAT = "test-token";

const nonEmptyString = fc.stringMatching(/^[a-zA-Z0-9 _-]+$/).filter((s) => s.length > 0);
const ticketKey = fc.stringMatching(/^[A-Z]+-\d+$/).filter((s) => s.length >= 4);

function makeIssueLink(direction: "inward" | "outward", overrides?: Partial<{ typeName: string; label: string; key: string; status: string; summary: string }>) {
    const typeName = overrides?.typeName ?? "Split";
    const label = overrides?.label ?? (direction === "inward" ? "split from" : "split to");
    const key = overrides?.key ?? "TEST-100";
    const status = overrides?.status ?? "In Progress";
    const summary = overrides?.summary ?? "Some linked issue";

    const link: any = {
        type: { name: typeName, inward: direction === "inward" ? label : "other direction", outward: direction === "outward" ? label : "other direction" },
    };
    if (direction === "inward") {
        link.inwardIssue = { key, fields: { summary, status: { name: status } } };
    } else {
        link.outwardIssue = { key, fields: { summary, status: { name: status } } };
    }
    return link;
}

function makeMockTicket(issuelinks: any[]): JiraTicket {
    return {
        key: "PROJ-1",
        fields: {
            summary: "Test ticket",
            status: { name: "Open" },
            assignee: { displayName: "Dev" },
            reporter: { displayName: "Reporter" },
            priority: { name: "Medium" },
            created: "2025-01-01T00:00:00.000Z",
            description: "A description",
            issuelinks,
        },
    };
}

describe("Issue Links — buildFormattedSummary", () => {
    it("formats inward links as: {inward label} {key} ({status}) — {summary}", () => {
        const link = makeIssueLink("inward", { label: "split from", key: "CL-17297", status: "Not Started", summary: "Outbound Authentication" });
        const ticket = makeMockTicket([link]);
        const output = buildFormattedSummary(ticket, ["issuelinks"]);

        expect(output).toContain("**Issue Links (1):**");
        expect(output).toContain("- split from CL-17297 (Not Started) — Outbound Authentication");
    });

    it("formats outward links as: {outward label} {key} ({status}) — {summary}", () => {
        const link = makeIssueLink("outward", { label: "blocks", key: "CL-500", status: "In Progress", summary: "Downstream task" });
        const ticket = makeMockTicket([link]);
        const output = buildFormattedSummary(ticket, ["issuelinks"]);

        expect(output).toContain("- blocks CL-500 (In Progress) — Downstream task");
    });

    it("renders multiple links on separate lines", () => {
        const links = [
            makeIssueLink("inward", { label: "split from", key: "A-1", status: "Done", summary: "First" }),
            makeIssueLink("outward", { label: "is dependency upon", key: "B-2", status: "Open", summary: "Second" }),
        ];
        const ticket = makeMockTicket(links);
        const output = buildFormattedSummary(ticket, ["issuelinks"]);

        expect(output).toContain("- split from A-1 (Done) — First");
        expect(output).toContain("- is dependency upon B-2 (Open) — Second");
    });

    it("omits issue links section when issuelinks is not in requestedFields", () => {
        const link = makeIssueLink("inward");
        const ticket = makeMockTicket([link]);
        const output = buildFormattedSummary(ticket, ["summary", "status"]);

        expect(output).not.toContain("Issue Links");
    });

    it("omits issue links section when issuelinks array is empty", () => {
        const ticket = makeMockTicket([]);
        const output = buildFormattedSummary(ticket, ["issuelinks"]);

        expect(output).not.toContain("Issue Links");
    });

    it("falls back to 'Unknown' when status or summary is missing", () => {
        const link: any = {
            type: { name: "Blocks", inward: "is blocked by", outward: "blocks" },
            outwardIssue: { key: "X-1", fields: {} },
        };
        const ticket = makeMockTicket([link]);
        const output = buildFormattedSummary(ticket, ["issuelinks"]);

        expect(output).toContain("- blocks X-1 (Unknown) — Unknown");
    });

    it("falls back to 'relates to' when type labels are missing", () => {
        const link: any = {
            type: {},
            inwardIssue: { key: "Z-9", fields: { summary: "No type", status: { name: "Open" } } },
        };
        const ticket = makeMockTicket([link]);
        const output = buildFormattedSummary(ticket, ["issuelinks"]);

        expect(output).toContain("- relates to Z-9 (Open) — No type");
    });
});

describe("Issue Links — handleJiraGetIssue integration", () => {
    let originalFetch: typeof globalThis.fetch;

    beforeEach(() => { originalFetch = globalThis.fetch; });
    afterEach(() => { globalThis.fetch = originalFetch; vi.restoreAllMocks(); });

    it("includes issuelinks in default fetch (no fields param)", async () => {
        const issuelinks = [makeIssueLink("inward", { label: "depends on", key: "DEP-1", status: "Done", summary: "Dependency" })];

        vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => ({
            ok: true,
            status: 200,
            json: async () => ({
                key: "PROJ-1",
                fields: {
                    summary: "Test",
                    status: { name: "Open" },
                    assignee: null,
                    reporter: null,
                    priority: { name: "Medium" },
                    created: "2025-01-01T00:00:00.000Z",
                    description: "",
                    comment: { comments: [] },
                    issuelinks,
                },
            }),
            text: async () => "{}",
        })));

        const result = await handleJiraGetIssue({ ticketId: "PROJ-1", outputDir: false });
        const text = result.content[0].text;

        expect(text).toContain("**Issue Links (1):**");
        expect(text).toContain("- depends on DEP-1 (Done) — Dependency");
    });

    it("returns only issuelinks when fields: ['issuelinks']", async () => {
        const issuelinks = [makeIssueLink("outward", { label: "split to", key: "SP-5", status: "In Progress", summary: "Split target" })];

        vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => ({
            ok: true,
            status: 200,
            json: async () => ({
                key: "PROJ-2",
                fields: { summary: "Filtered", issuelinks },
            }),
            text: async () => "{}",
        })));

        const result = await handleJiraGetIssue({ ticketId: "PROJ-2", fields: ["issuelinks"], outputDir: false });
        const text = result.content[0].text;

        expect(text).toContain("**Issue Links (1):**");
        expect(text).toContain("- split to SP-5 (In Progress) — Split target");
        // Should not contain other default sections
        expect(text).not.toContain("**Status:**");
        expect(text).not.toContain("**Assignee:**");
    });

    it("requests issuelinks field from Jira API", async () => {
        const fetchMock = vi.fn().mockImplementation(async () => ({
            ok: true,
            status: 200,
            json: async () => ({ key: "PROJ-3", fields: { summary: "Check fields", issuelinks: [] } }),
            text: async () => "{}",
        }));
        vi.stubGlobal("fetch", fetchMock);

        await handleJiraGetIssue({ ticketId: "PROJ-3", outputDir: false });

        const calledUrl = fetchMock.mock.calls[0][0] as string;
        expect(calledUrl).toContain("issuelinks");
    });
});

describe("Issue Links — Property: every generated link appears in output", () => {
    let originalFetch: typeof globalThis.fetch;

    beforeEach(() => { originalFetch = globalThis.fetch; });
    afterEach(() => { globalThis.fetch = originalFetch; vi.restoreAllMocks(); });

    it("Property: all inward/outward links are rendered with key, status, and summary", async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(
                    fc.record({
                        direction: fc.constantFrom("inward", "outward") as fc.Arbitrary<"inward" | "outward">,
                        key: ticketKey,
                        status: nonEmptyString,
                        summary: nonEmptyString,
                        label: nonEmptyString,
                    }),
                    { minLength: 1, maxLength: 10 },
                ),
                async (linkDefs) => {
                    const issuelinks = linkDefs.map((def) => makeIssueLink(def.direction, { label: def.label, key: def.key, status: def.status, summary: def.summary }));

                    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => ({
                        ok: true,
                        status: 200,
                        json: async () => ({ key: "PROP-1", fields: { summary: "Prop test", issuelinks } }),
                        text: async () => "{}",
                    })));

                    const result = await handleJiraGetIssue({ ticketId: "PROP-1", fields: ["issuelinks"], outputDir: false });
                    const text = result.content[0].text;

                    for (const def of linkDefs) {
                        expect(text).toContain(def.key);
                        expect(text).toContain(def.status);
                        expect(text).toContain(def.summary);
                        expect(text).toContain(def.label);
                    }
                },
            ),
            { numRuns: 50 },
        );
    });
});
