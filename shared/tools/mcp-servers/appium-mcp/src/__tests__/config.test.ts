import { describe, it, expect } from "vitest";

describe("config", () => {
    it("exports APPIUM_URL with default value", async () => {
        const { APPIUM_URL } = await import("../config.js");
        expect(APPIUM_URL).toBe("http://localhost:4723");
    });

    it("exports APPIUM_TIMEOUT with default value", async () => {
        const { APPIUM_TIMEOUT } = await import("../config.js");
        expect(APPIUM_TIMEOUT).toBe(60000);
    });

    it("exports SCREENSHOT_DIR with default value", async () => {
        const { SCREENSHOT_DIR } = await import("../config.js");
        expect(SCREENSHOT_DIR).toBe("/tmp/appium-screenshots");
    });
});
