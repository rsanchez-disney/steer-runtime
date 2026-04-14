import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function saveData(
  outputDir: string | false | null | undefined,
  toolName: string,
  identifier: string,
  rawData: any,
  formattedSummary: string,
): Promise<string | null> {
  // If false or null, skip saving
  if (outputDir === false || outputDir === null) return null;

  // Use provided directory or default to /tmp/qtest-mcp/
  const finalDir = typeof outputDir === "string" ? outputDir : "/tmp/qtest-mcp";

  // Create directory recursively if it doesn't exist
  await mkdir(finalDir, { recursive: true });

  // Build filename: <toolName>-<identifier>-<ISO-timestamp>.json
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${toolName}-${identifier}-${timestamp}.json`;

  const data = {
    fetchedAt: new Date().toISOString(),
    rawData,
    formattedSummary,
  };

  const filepath = join(finalDir, filename);
  await writeFile(filepath, JSON.stringify(data, null, 2));
  return filepath;
}
