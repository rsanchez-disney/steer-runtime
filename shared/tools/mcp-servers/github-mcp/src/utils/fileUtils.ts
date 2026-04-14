import fs from "fs/promises";
import path from "path";

export async function saveToFile(
    data: any,
    filename: string,
    outputDir?: string | false | null,
): Promise<string> {
    if (outputDir === false || outputDir === null) {
        return "";
    }

    const saveDir =
        typeof outputDir === "string" ? outputDir : "/tmp/github-mcp";
    await fs.mkdir(saveDir, { recursive: true });
    const filepath = path.join(saveDir, filename);
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    return filepath;
}
