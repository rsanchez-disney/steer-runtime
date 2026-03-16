import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import type { JiraTicket } from "./types.js";

export async function saveData(
    outputDir: string | false | null | undefined,
    filename: string,
    data: any,
    isGetOperation: boolean = true,
): Promise<string | null> {
    // If false or null, don't save
    if (outputDir === false || outputDir === null) return null;
    // Use default directory for all operations if not specified, or if it's a string use that
    const finalOutputDir =
        typeof outputDir === "string" ? outputDir : "/tmp/jira-mcp";

    if (!finalOutputDir) return null;

    await mkdir(finalOutputDir, { recursive: true });
    const filepath = join(finalOutputDir, filename);
    await writeFile(filepath, JSON.stringify(data, null, 2));
    return filepath;
}

export async function saveTicketData(
    outputDir: string | false | null | undefined,
    ticketId: string,
    ticket: JiraTicket,
    summary: string,
    isGetOperation: boolean = true,
): Promise<string | null> {
    if (!shouldSaveOutput(outputDir, isGetOperation)) return null;

    const finalOutputDir =
        typeof outputDir === "string" ? outputDir : "/tmp/jira-mcp";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${ticketId}_${timestamp}.json`;

    const data = {
        ticketId,
        fetchedAt: new Date().toISOString(),
        rawData: ticket,
        formattedSummary: summary,
    };

    return saveData(finalOutputDir, filename, data, isGetOperation);
}

function shouldSaveOutput(
    outputDir: string | false | null | undefined,
    isGetOperation: boolean,
): boolean {
    // If outputDir is explicitly false or null, don't save
    if (outputDir === false || outputDir === null) return false;
    // Otherwise, save by default (undefined or provided path)
    return true;
}
