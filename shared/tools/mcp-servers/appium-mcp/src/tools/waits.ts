import { appiumRequest, sessionPath } from "../utils/appiumClient.js";

export const waitForElementSchema = {
  name: "appium_wait_for_element",
  description: "Wait until an element appears on screen (polls every 500ms)",
  inputSchema: {
    type: "object" as const,
    properties: {
      strategy: { type: "string", description: "Locator strategy" },
      value: { type: "string", description: "Locator value" },
      timeout: { type: "number", description: "Timeout in ms (default: 10000)" },
    },
    required: ["strategy", "value"],
  },
};

export async function handleWaitForElement(args: Record<string, unknown>) {
  const timeout = (args.timeout as number) || 10000;
  const interval = 500;
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    try {
      const data = await appiumRequest<any>({
        method: "POST",
        path: sessionPath("/element"),
        body: { using: args.strategy, value: args.value },
      });
      const el = data.value;
      const elementId = typeof el === "object" ? Object.values(el)[0] : el;
      return { content: [{ type: "text", text: JSON.stringify({ found: true, elementId }) }] };
    } catch {
      await new Promise((r) => setTimeout(r, interval));
    }
  }

  return { content: [{ type: "text", text: JSON.stringify({ found: false, elementId: null }) }] };
}
