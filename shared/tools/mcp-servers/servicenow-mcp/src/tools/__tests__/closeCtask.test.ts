/**
 * Read-only unit tests for closeCtask.
 * Run: npm test
 */
import assert from "node:assert";
import { handleCloseCtask, closeCtaskSchema } from "../closeCtask.js";
import { apiClient } from "../../utils/apiClient.js";

// ── Override apiClient methods with mocks ───────────────────────
const calls: { method: string; args: any[] }[] = [];
let getResponses: any[] = [];

(apiClient as any).getSysId = async () => "sys-mock-123";
(apiClient as any).loadConfig = async () => {};
(apiClient as any).get = async (...args: any[]) => {
    calls.push({ method: "get", args });
    return getResponses.shift() ?? {};
};
(apiClient as any).patch = async (...args: any[]) => {
    calls.push({ method: "patch", args });
    return {};
};

// ── Helpers ─────────────────────────────────────────────────────
function reset(responses: any[]) {
    calls.length = 0;
    getResponses = [...responses];
}

function stateResp(value: string, label: string, parentSysId = "p-123") {
    return {
        result: {
            state: { value, display_value: label },
            number: { value: "CTASK001" },
            change_request: { value: parentSysId },
        },
    };
}
function parentResp(label: string) {
    return { result: { state: { display_value: label }, number: { value: "CHG001" } } };
}
function closedResp(value: string, label: string) {
    return { result: { state: { value, display_value: label } } };
}
function parse(r: any) {
    return JSON.parse(r.content[0].text);
}

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void> | void) {
    try {
        await fn();
        console.log(`  ✅ ${name}`);
        passed++;
    } catch (e: any) {
        console.log(`  ❌ ${name}: ${e.message}`);
        failed++;
    }
}

async function run() {
    // ── Schema ──────────────────────────────────────────────────
    console.log("\n📋 Schema tests:");

    await test("name is close_ctask", () => {
        assert.strictEqual(closeCtaskSchema.name, "close_ctask");
    });

    await test("requires ctaskNumber", () => {
        assert.ok(closeCtaskSchema.inputSchema.required.includes("ctaskNumber"));
    });

    await test("closeCode enum has Disney values", () => {
        const codes = closeCtaskSchema.inputSchema.properties.closeCode.enum;
        assert.deepStrictEqual(codes, ["successful", "unsuccessful", "issues", "supplier", "disney"]);
    });

    await test("targetState enum has all close states", () => {
        const states = closeCtaskSchema.inputSchema.properties.targetState.enum;
        assert.deepStrictEqual(states, ["closed_complete", "closed_cancelled", "closed_skipped", "successful"]);
    });

    // ── Handler ─────────────────────────────────────────────────
    console.log("\n🔧 Handler tests:");

    await test("error for invalid targetState", async () => {
        assert.strictEqual(parse(await handleCloseCtask({ ctaskNumber: "C1", targetState: "bogus" })).status, "error");
    });

    await test("skips if Closed Complete (3)", async () => {
        reset([stateResp("3", "Closed Complete")]);
        assert.strictEqual(parse(await handleCloseCtask({ ctaskNumber: "C1" })).status, "skipped");
        assert.ok(!calls.some(c => c.method === "patch"));
    });

    await test("skips if Successful (8)", async () => {
        reset([stateResp("8", "Successful")]);
        assert.strictEqual(parse(await handleCloseCtask({ ctaskNumber: "C1" })).status, "skipped");
    });

    await test("skips if Closed Cancelled (4)", async () => {
        reset([stateResp("4", "Closed Cancelled")]);
        assert.strictEqual(parse(await handleCloseCtask({ ctaskNumber: "C1" })).status, "skipped");
    });

    await test("blocks when parent CHG Complete", async () => {
        reset([stateResp("-5", "Scheduled"), parentResp("Complete")]);
        const r = parse(await handleCloseCtask({ ctaskNumber: "C1" }));
        assert.strictEqual(r.status, "blocked");
        assert.strictEqual(r.parentState, "Complete");
    });

    await test("blocks when parent CHG Closed", async () => {
        reset([stateResp("1", "In Progress"), parentResp("Closed")]);
        assert.strictEqual(parse(await handleCloseCtask({ ctaskNumber: "C1" })).status, "blocked");
    });

    await test("blocks when parent CHG Cancelled", async () => {
        reset([stateResp("2", "WIP"), parentResp("Cancelled")]);
        assert.strictEqual(parse(await handleCloseCtask({ ctaskNumber: "C1" })).status, "blocked");
    });

    await test("closes successfully with defaults", async () => {
        reset([stateResp("2", "WIP"), parentResp("In Progress"), closedResp("3", "Closed Complete"), closedResp("3", "Closed Complete")]);
        const r = parse(await handleCloseCtask({ ctaskNumber: "C1" }));
        assert.strictEqual(r.status, "success");
        assert.strictEqual(r.state, "Closed Complete");
        assert.strictEqual(r.closeCode, "Successful");
    });

    await test("sends u_close_code in PATCH", async () => {
        reset([stateResp("2", "WIP"), parentResp("In Progress"), closedResp("3", "Closed Complete"), closedResp("3", "Closed Complete")]);
        await handleCloseCtask({ ctaskNumber: "C1", closeCode: "unsuccessful", closeNotes: "Failed" });
        const p = calls.find(c => c.method === "patch");
        assert.strictEqual(p!.args[1].u_close_code, "unsuccessful");
        assert.strictEqual(p!.args[1].u_close_notes, "Failed");
    });

    await test("state 8 for targetState=successful", async () => {
        reset([stateResp("2", "WIP"), parentResp("In Progress"), closedResp("8", "Successful"), closedResp("8", "Successful")]);
        const r = parse(await handleCloseCtask({ ctaskNumber: "C1", targetState: "successful" }));
        assert.strictEqual(r.state, "Successful");
        assert.strictEqual(calls.find(c => c.method === "patch")!.args[1].state, "8");
    });

    await test("all Disney close code labels map correctly", async () => {
        const map: Record<string, string> = { successful: "Successful", unsuccessful: "Unsuccessful", issues: "With Issues", supplier: "Per Supplier", disney: "Per Disney" };
        for (const [code, label] of Object.entries(map)) {
            reset([stateResp("2", "WIP"), parentResp("In Progress"), closedResp("3", "Closed Complete"), closedResp("3", "Closed Complete")]);
            assert.strictEqual(parse(await handleCloseCtask({ ctaskNumber: "C1", closeCode: code })).closeCode, label);
        }
    });

    // ── Summary ─────────────────────────────────────────────────
    console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
    process.exit(failed > 0 ? 1 : 0);
}

run();
