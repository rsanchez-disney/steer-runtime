import { apiClient } from "../utils/apiClient.js";

export const getJobStatusSchema = {
    name: "get_job_status",
    description: "Get the status of a running or completed Splunk search job by SID",
    inputSchema: {
        type: "object",
        properties: {
            sid: { type: "string", description: "Search job ID (SID)" },
        },
        required: ["sid"],
    },
};

export async function handleGetJobStatus(args: any) {
    const { sid } = args;
    const data = await apiClient.getSearchStatus(sid);
    const entry = data?.entry?.[0]?.content;

    const status = {
        sid,
        isDone: entry?.isDone,
        isFailed: entry?.isFailed,
        eventCount: entry?.eventCount,
        resultCount: entry?.resultCount,
        runDuration: entry?.runDuration,
        doneProgress: entry?.doneProgress,
        dispatchState: entry?.dispatchState,
    };

    return {
        content: [{ type: "text", text: JSON.stringify(status, null, 2) }],
    };
}
