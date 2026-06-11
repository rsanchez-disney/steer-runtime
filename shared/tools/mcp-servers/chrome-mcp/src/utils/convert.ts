import { execFile } from "child_process";
import { promisify } from "util";
import { unlink } from "fs/promises";
import ffmpegPath from "ffmpeg-static";

const exec = promisify(execFile);

/**
 * Convert WebM to MP4 optimized for Jira/GitHub attachments:
 * - H.264 baseline profile (max compatibility)
 * - AAC audio (or silent)
 * - faststart for streaming preview
 * - Capped at 720p, reasonable bitrate
 */
export async function convertToMp4(
    inputPath: string,
    outputPath: string,
): Promise<{ success: boolean; error?: string }> {
    if (!ffmpegPath) {
        return { success: false, error: "ffmpeg-static binary not found" };
    }
    try {
        await exec(ffmpegPath, [
            "-y",
            "-i", inputPath,
            "-c:v", "libx264",
            "-profile:v", "baseline",
            "-level", "3.1",
            "-pix_fmt", "yuv420p",
            "-vf", "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
            "-crf", "23",
            "-preset", "fast",
            "-movflags", "+faststart",
            "-an",
            outputPath,
        ]);
        // Remove the intermediate WebM
        await unlink(inputPath).catch(() => {});
        return { success: true };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { success: false, error: msg };
    }
}
