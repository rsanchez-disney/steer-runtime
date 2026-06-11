import { Page, ScreenRecorder } from "puppeteer";

let recorder: ScreenRecorder | null = null;
let outputPath: string = "/tmp/chrome-recording.webm";

export function getRecorder(): ScreenRecorder | null {
    return recorder;
}

export function getOutputPath(): string {
    return outputPath;
}

export async function startRecording(page: Page, path: string): Promise<void> {
    outputPath = path;
    recorder = await page.screencast({ path: outputPath as `${string}.webm` });
}

export async function stopRecording(): Promise<void> {
    if (recorder) {
        await recorder.stop();
        recorder = null;
    }
}
