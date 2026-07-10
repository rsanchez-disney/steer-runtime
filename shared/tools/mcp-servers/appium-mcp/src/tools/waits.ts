import { appiumRequest, sessionPath } from "../utils/appiumClient.js";

export const waitForElementSchema = {
  name: "appium_wait_for_element",
  description: "Wait until an element meets a condition (present, visible, clickable, or gone)",
  inputSchema: {
    type: "object" as const,
    properties: {
      strategy: { type: "string", description: "Locator strategy (accessibility_id, xpath, class_chain, ios_predicate, id)" },
      value: { type: "string", description: "Locator value" },
      timeout: { type: "number", description: "Timeout in ms (default: 10000)" },
      condition: {
        type: "string",
        enum: ["present", "visible", "clickable", "gone"],
        description: "Wait condition: present (element exists in DOM), visible (displayed), clickable (enabled+displayed), gone (element disappears). Default: present",
      },
    },
    required: ["strategy", "value"],
  },
};

export async function handleWaitForElement(args: Record<string, unknown>) {
  const timeout = (args.timeout as number) || 10000;
  const condition = (args.condition as string) || "present";
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
      const elementId = typeof el === "object" ? Object.values(el)[0] as string : el as string;

      if (condition === "gone") {
        // Element still exists, keep waiting for it to disappear
        await new Promise((r) => setTimeout(r, interval));
        continue;
      }

      if (condition === "present") {
        return { content: [{ type: "text", text: JSON.stringify({ found: true, elementId, condition, waitedMs: Date.now() - (deadline - timeout) }) }] };
      }

      if (condition === "visible" || condition === "clickable") {
        const dispData = await appiumRequest<any>({ path: sessionPath(`/element/${elementId}/displayed`) });
        const displayed = dispData.value === true;

        if (condition === "visible" && displayed) {
          return { content: [{ type: "text", text: JSON.stringify({ found: true, elementId, condition, waitedMs: Date.now() - (deadline - timeout) }) }] };
        }

        if (condition === "clickable") {
          const enabledData = await appiumRequest<any>({ path: sessionPath(`/element/${elementId}/enabled`) });
          const enabled = enabledData.value === true;
          if (displayed && enabled) {
            return { content: [{ type: "text", text: JSON.stringify({ found: true, elementId, condition, waitedMs: Date.now() - (deadline - timeout) }) }] };
          }
        }
      }

      await new Promise((r) => setTimeout(r, interval));
    } catch {
      if (condition === "gone") {
        return { content: [{ type: "text", text: JSON.stringify({ found: false, elementId: null, condition, waitedMs: Date.now() - (deadline - timeout) }) }] };
      }
      await new Promise((r) => setTimeout(r, interval));
    }
  }

  if (condition === "gone") {
    return { content: [{ type: "text", text: JSON.stringify({ found: true, elementId: null, condition, timedOut: true, message: "Element still present after timeout" }) }] };
  }

  return { content: [{ type: "text", text: JSON.stringify({ found: false, elementId: null, condition, timedOut: true }) }] };
}
