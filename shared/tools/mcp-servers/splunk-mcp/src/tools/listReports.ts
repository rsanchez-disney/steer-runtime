import { apiClient } from "../utils/apiClient.js";

export const listReportsSchema = {
    name: "list_reports",
    description: "List scheduled reports with their last run time, schedule, and status",
    inputSchema: {
        type: "object",
        properties: {
            app: { type: "string", description: "Splunk app to list reports from", default: "search" },
            count: { type: "number", description: "Maximum reports to return (default 50)", default: 50 },
            scheduledOnly: { type: "boolean", description: "Only show scheduled reports (default true)", default: true },
        },
        required: [],
    },
};

export async function handleListReports(args: any) {
    const { app = "search", count = 50, scheduledOnly = true } = args;

    const params: Record<string, string> = { count: String(count) };
    if (scheduledOnly) {
        params.search = "is_scheduled=1";
    }

    const data = await apiClient.get(`/servicesNS/-/${app}/saved/searches`, params);
    const entries = data?.entry ?? [];

    const reports = entries
        .filter((e: any) => !scheduledOnly || e.content?.is_scheduled === "1")
        .map((e: any) => ({
            name: e.name,
            search: e.content?.search,
            cronSchedule: e.content?.cron_schedule,
            isScheduled: e.content?.is_scheduled === "1",
            nextScheduledTime: e.content?.next_scheduled_time,
            lastRunTime: e.content?.["dispatch.latest_time"],
            disabled: e.content?.disabled === "1",
            actions: e.content?.actions,
        }));

    return {
        content: [{ type: "text", text: JSON.stringify({ app, count: reports.length, reports }, null, 2) }],
    };
}
