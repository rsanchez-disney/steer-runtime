import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
export async function saveToFile(data, outputDir, filename) {
    if (outputDir === false || outputDir === null)
        return null;
    const saveDir = typeof outputDir === "string" ? outputDir : "/tmp/confluence-mcp";
    await mkdir(saveDir, { recursive: true });
    const filePath = join(saveDir, filename);
    await writeFile(filePath, JSON.stringify(data, null, 2));
    return filePath;
}
//# sourceMappingURL=fileUtils.js.map