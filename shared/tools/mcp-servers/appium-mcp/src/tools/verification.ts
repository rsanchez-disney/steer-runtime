import { appiumRequest, sessionPath } from "../utils/appiumClient.js";
import { SCREENSHOT_DIR } from "../config.js";
import fs from "node:fs";
import path from "node:path";

export const screenshotSchema = {
  name: "appium_screenshot",
  description: "Take a screenshot of the current screen",
  inputSchema: {
    type: "object" as const,
    properties: {
      filename: { type: "string", description: "Custom filename (optional, auto-generated if omitted)" },
    },
  },
};

export async function handleScreenshot(args: Record<string, unknown>) {
  const data = await appiumRequest<any>({ path: sessionPath("/screenshot") });
  const base64 = data.value;
  const filename = (args.filename as string) || `screenshot_${Date.now()}.png`;
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const filePath = path.join(SCREENSHOT_DIR, filename);
  fs.writeFileSync(filePath, Buffer.from(base64, "base64"));
  return { content: [{ type: "text", text: JSON.stringify({ path: filePath, filename }) }] };
}

export const isElementDisplayedSchema = {
  name: "appium_is_element_displayed",
  description: "Check if an element is currently visible on screen",
  inputSchema: {
    type: "object" as const,
    properties: {
      elementId: { type: "string", description: "Element ID" },
    },
    required: ["elementId"],
  },
};

export async function handleIsElementDisplayed(args: Record<string, unknown>) {
  const data = await appiumRequest<any>({ path: sessionPath(`/element/${args.elementId}/displayed`) });
  return { content: [{ type: "text", text: JSON.stringify({ displayed: data.value }) }] };
}

export const getElementAttributeSchema = {
  name: "appium_get_element_attribute",
  description: "Get an attribute value from an element",
  inputSchema: {
    type: "object" as const,
    properties: {
      elementId: { type: "string", description: "Element ID" },
      attribute: { type: "string", description: "Attribute name (e.g., 'text', 'enabled', 'label')" },
    },
    required: ["elementId", "attribute"],
  },
};

export async function handleGetElementAttribute(args: Record<string, unknown>) {
  const data = await appiumRequest<any>({ path: sessionPath(`/element/${args.elementId}/attribute/${args.attribute}`) });
  return { content: [{ type: "text", text: JSON.stringify({ value: data.value }) }] };
}
