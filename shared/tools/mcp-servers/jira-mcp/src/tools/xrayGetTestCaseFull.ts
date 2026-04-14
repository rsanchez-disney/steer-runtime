import { JiraApiClient } from "../utils/jiraApi.js";

export const xrayGetTestCaseFullSchema = {
    name: "xray_get_test_case_full",
    description:
        "Get a complete XRay Test Case with all details: Jira issue fields (summary, description, priority, status, labels, components, custom fields), test steps, pre-conditions, test sets, test executions, test plans, and recent test runs. This is the most comprehensive tool for inspecting a test case.",
    inputSchema: {
        type: "object",
        properties: {
            testKey: {
                type: "string",
                description:
                    "The JIRA Test issue key (e.g., DPAY-1234)",
            },
            includeTestRuns: {
                type: "boolean",
                description:
                    "If true, also fetches recent test run results for this test (default: true)",
            },
        },
        required: ["testKey"],
    },
};

export async function handleXrayGetTestCaseFull(args: any): Promise<any> {
    try {
        const { testKey, includeTestRuns = true } = args as { testKey: string; includeTestRuns?: boolean };

        const apiClient = new JiraApiClient();
        const result = await apiClient.getXrayTestCaseFull(testKey);

        const issue = result.issue;
        const xray = result.xray;
        const fields = issue.fields || {};

        let text = `**${issue.key}: ${fields.summary || "(no summary)"}**\n\n`;

        // Core Jira fields
        text += `**Type:** ${fields.issuetype?.name || "Unknown"}\n`;
        text += `**Status:** ${fields.status?.name || "Unknown"}\n`;
        text += `**Priority:** ${fields.priority?.name || "Unknown"}\n`;
        text += `**Assignee:** ${fields.assignee?.displayName || "Unassigned"}\n`;
        text += `**Reporter:** ${fields.reporter?.displayName || "Unknown"}\n`;
        text += `**Created:** ${fields.created || "Unknown"}\n`;
        text += `**Updated:** ${fields.updated || "Unknown"}\n`;

        if (fields.labels?.length) {
            text += `**Labels:** ${fields.labels.join(", ")}\n`;
        }
        if (fields.components?.length) {
            text += `**Components:** ${fields.components.map((c: any) => c.name).join(", ")}\n`;
        }
        if (fields.fixVersions?.length) {
            text += `**Fix Versions:** ${fields.fixVersions.map((v: any) => v.name).join(", ")}\n`;
        }

        if (fields.description) {
            text += `\n**Description:**\n${fields.description}\n`;
        }

        // XRay custom fields from the issue (customfield_*)
        const customFieldKeys = Object.keys(fields).filter(
            (k) => k.startsWith("customfield_") && fields[k] != null,
        );
        if (customFieldKeys.length > 0) {
            text += `\n**Custom/XRay Fields:**\n`;
            for (const key of customFieldKeys) {
                const val = fields[key];
                const displayVal =
                    typeof val === "object" ? JSON.stringify(val) : String(val);
                // Skip very long values (like manual test steps JSON embedded in the field)
                if (displayVal.length < 500) {
                    text += `- ${key}: ${displayVal}\n`;
                } else {
                    text += `- ${key}: (large value, ${displayVal.length} chars)\n`;
                }
            }
        }

        // Test Steps
        text += `\n---\n**Test Steps:**\n`;
        if (xray.steps?.error) {
            text += `(Error fetching steps: ${xray.steps.error})\n`;
        } else if (Array.isArray(xray.steps) && xray.steps.length > 0) {
            xray.steps.forEach((step: any, i: number) => {
                const idx = step.index ?? i + 1;
                text += `  ${idx}. Action: ${step.fields?.action || step.action || "(none)"}\n`;
                text += `     Data: ${step.fields?.data || step.data || "(none)"}\n`;
                text += `     Expected: ${step.fields?.["expected result"] || step.fields?.expectedResult || step.result || "(none)"}\n`;
            });
        } else {
            text += "(no steps)\n";
        }

        // Pre-Conditions
        text += `\n**Pre-Conditions:**\n`;
        if (xray.preConditions?.error) {
            text += `(Error: ${xray.preConditions.error})\n`;
        } else if (
            Array.isArray(xray.preConditions) &&
            xray.preConditions.length > 0
        ) {
            xray.preConditions.forEach((pc: any) => {
                text += `- ${pc.key}: ${pc.condition || pc.summary || "(no description)"} (Type: ${pc.type || "Unknown"})\n`;
            });
        } else {
            text += "(none)\n";
        }

        // Test Sets
        text += `\n**Test Sets:**\n`;
        if (xray.testSets?.error) {
            text += `(Error: ${xray.testSets.error})\n`;
        } else if (
            Array.isArray(xray.testSets) &&
            xray.testSets.length > 0
        ) {
            xray.testSets.forEach((ts: any) => {
                text += `- ${ts.key}: ${ts.summary || "(no summary)"}\n`;
            });
        } else {
            text += "(none)\n";
        }

        // Test Executions
        text += `\n**Test Executions:**\n`;
        if (xray.testExecutions?.error) {
            text += `(Error: ${xray.testExecutions.error})\n`;
        } else {
            const execs = Array.isArray(xray.testExecutions)
                ? xray.testExecutions
                : xray.testExecutions?.issues || xray.testExecutions;
            if (Array.isArray(execs) && execs.length > 0) {
                execs.forEach((te: any) => {
                    text += `- ${te.key}: ${te.summary || "(no summary)"} — Status: ${te.status || "Unknown"}\n`;
                });
            } else {
                text += "(none)\n";
            }
        }

        // Test Plans
        text += `\n**Test Plans:**\n`;
        if (xray.testPlans?.error) {
            text += `(Error: ${xray.testPlans.error})\n`;
        } else if (
            Array.isArray(xray.testPlans) &&
            xray.testPlans.length > 0
        ) {
            xray.testPlans.forEach((tp: any) => {
                text += `- ${tp.key}: ${tp.summary || "(no summary)"}\n`;
            });
        } else {
            text += "(none)\n";
        }

        // Test Runs (recent execution results)
        if (includeTestRuns) {
            text += `\n**Recent Test Runs:**\n`;
            try {
                const runs = await apiClient.getXrayTestRuns(undefined, testKey, undefined, undefined, undefined, 10);
                const runList = Array.isArray(runs) ? runs : runs?.testRuns || runs;
                if (Array.isArray(runList) && runList.length > 0) {
                    runList.forEach((run: any, i: number) => {
                        text += `- ${run.testExecKey || "Unknown Exec"}: ${run.status || "Unknown"} (${run.executedBy || "Unknown"}, ${run.finishedOn || run.startedOn || "Unknown date"})`;
                        if (run.defects?.length) {
                            text += ` — Defects: ${run.defects.map((d: any) => d.key || d).join(", ")}`;
                        }
                        text += "\n";
                    });
                } else {
                    text += "(no test runs)\n";
                }
            } catch {
                text += "(unable to fetch test runs)\n";
            }
        }

        return {
            content: [{ type: "text", text }],
        };
    } catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error getting XRay test case: ${error instanceof Error ? error.message : "Unknown error"}`,
                },
            ],
            isError: true,
        };
    }
}
