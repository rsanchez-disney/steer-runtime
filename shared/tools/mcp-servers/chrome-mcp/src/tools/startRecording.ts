import { getPage } from "../utils/browser.js";
import { getRecorder, startRecording as start } from "../utils/recorder.js";

export const startRecordingSchema = {
    name: "chrome_start_recording",
    description: "Start recording the browser tab as a video (WebM). Call chrome_stop_recording to finish and get the file path.",
    inputSchema: {
        type: "object",
        properties: {
            output: { type: "string", description: "Output file path (default: /tmp/chrome-recording.webm)" },
        },
    },
};

export async function handleStartRecording(args: any): Promise<any> {
    try {
        if (getRecorder()) {
            return { content: [{ type: "text", text: "Recording already in progress. Stop it first with chrome_stop_recording." }], isError: true };
        }
        const { output = "/tmp/chrome-recording.webm" } = args as { output?: string };
        const page = await getPage();
        await start(page, output);
        return { content: [{ type: "text", text: `Recording started. Output will be saved to: ${output}` }] };
    } catch (error) {
        return { content: [{ type: "text", text: `Error starting recording: ${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
}
