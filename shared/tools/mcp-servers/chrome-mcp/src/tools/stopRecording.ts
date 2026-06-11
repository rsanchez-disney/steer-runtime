import { getRecorder, stopRecording as stop, getOutputPath } from "../utils/recorder.js";
import { convertToMp4 } from "../utils/convert.js";

export const stopRecordingSchema = {
    name: "chrome_stop_recording",
    description: "Stop the current browser tab recording and save the video. Supports WebM (default) or MP4 (optimized for Jira/GitHub attachments).",
    inputSchema: {
        type: "object",
        properties: {
            format: { type: "string", enum: ["webm", "mp4"], description: "Output format (default: mp4). MP4 is optimized for Jira and GitHub PR attachments." },
        },
    },
};

export async function handleStopRecording(args: any): Promise<any> {
    try {
        if (!getRecorder()) {
            return { content: [{ type: "text", text: "No recording in progress." }], isError: true };
        }
        const { format = "mp4" } = args as { format?: string };
        const webmPath = getOutputPath();
        await stop();

        if (format === "mp4") {
            const mp4Path = webmPath.replace(/\.webm$/, ".mp4");
            const result = await convertToMp4(webmPath, mp4Path);
            if (result.success) {
                return { content: [{ type: "text", text: `Recording saved (MP4, optimized for Jira/GitHub): ${mp4Path}` }] };
            }
            return { content: [{ type: "text", text: `Recording saved as WebM (MP4 conversion failed: ${result.error}): ${webmPath}` }] };
        }

        return { content: [{ type: "text", text: `Recording saved: ${webmPath}` }] };
    } catch (error) {
        return { content: [{ type: "text", text: `Error stopping recording: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
}
