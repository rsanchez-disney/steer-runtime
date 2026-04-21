import { apiClient } from "../utils/apiClient.js";

export const getReportResultsSchema = {
    name: "get_report_results",
    description: "Get the latest results from a scheduled report without re-running it (uses cached/pre-computed results)",
    inputSchema: {
        type: "object",
        properties: {
            reportName: { type: "string", description: "Name of the scheduled report" },
            app: { type: "string", description: "Splunk app containing the report", default: "search" },
            maxResults: { type: "number", description: "Maximum results to return (default 100)", default: 100 },
        },
        required: ["reportName"],
    },
};

export async function handleGetReportResults(args: any) {
    const { reportName, app = "search", maxResults = 100 } = args;

    // Get the report's latest dispatch history
    const historyData = await apiClient.get(
        `/servicesNS/-/${app}/saved/searches/${encodeURIComponent(reportName)}/history`,
        { count: "1" },
    );
    const historyEntries = historyData?.entry ?? [];

    if (!historyEntries.length) {
        return {
            content: [{ type: "text", text: JSON.stringify({
                report: reportName,
                error: "No recent results found. The report may not have run yet or results have expired.",
            }) }],
        };
    }

    const latestRun = historyEntries[0];
    const sid = latestRun.name;
    const runTime = latestRun.published;
    const isDone = latestRun.content?.isDone;
    const resultCount = latestRun.content?.resultCount;

    if (!isDone) {
        return {
            content: [{ type: "text", text: JSON.stringify({
                report: reportName,
                sid,
                status: "still running",
                message: "The latest report run is still in progress.",
            }) }],
        };
    }

    // Get results from the latest run
    const results = await apiClient.getSearchResults(sid, maxResults);
    const events = results?.results ?? [];

    return {
        content: [{ type: "text", text: JSON.stringify({
            report: reportName,
            sid,
            runTime,
            totalResults: resultCount,
            returnedResults: events.length,
            results: events,
        }, null, 2) }],
    };
}
