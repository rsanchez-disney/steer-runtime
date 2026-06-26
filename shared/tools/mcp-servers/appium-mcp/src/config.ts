import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = (() => {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return __dirname;
  }
})();

config({ path: path.join(scriptDir, "..", "..", ".env") });

export const APPIUM_URL = (process.env.APPIUM_URL || "http://localhost:4723").replace(/\/$/, "");
export const APPIUM_TIMEOUT = parseInt(process.env.APPIUM_TIMEOUT || "60000", 10);
export const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || "/tmp/appium-screenshots";
