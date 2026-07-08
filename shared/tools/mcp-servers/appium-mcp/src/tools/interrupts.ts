import { appiumRequest, sessionPath } from "../utils/appiumClient.js";

export const dismissIfPresentSchema = {
  name: "appium_dismiss_if_present",
  description: "Check if an element is present and interact with it (tap, dismiss). Short timeout — designed for handling popups and interrupts without blocking.",
  inputSchema: {
    type: "object" as const,
    properties: {
      strategy: { type: "string", description: "Locator strategy (accessibility_id, xpath, ios_predicate, id)" },
      value: { type: "string", description: "Locator value" },
      action: {
        type: "string",
        enum: ["tap", "dismiss_alert", "swipe_away"],
        description: "Action to take if element is found (default: tap)",
      },
      timeout: { type: "number", description: "Max wait time in ms (default: 3000 — keep short for interrupts)" },
    },
    required: ["strategy", "value"],
  },
};

export async function handleDismissIfPresent(args: Record<string, unknown>) {
  const timeout = (args.timeout as number) || 3000;
  const action = (args.action as string) || "tap";
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

      // Element found — perform action
      if (action === "tap") {
        await appiumRequest({ method: "POST", path: sessionPath(`/element/${elementId}/click`), body: {} });
      } else if (action === "dismiss_alert") {
        await appiumRequest({ method: "POST", path: sessionPath("/execute"), body: { script: "mobile: alert", args: [{ action: "dismiss" }] } });
      } else if (action === "swipe_away") {
        await appiumRequest({ method: "POST", path: sessionPath("/execute"), body: { script: "mobile: swipe", args: [{ direction: "down", duration: 500 }] } });
      }

      return { content: [{ type: "text", text: JSON.stringify({ wasPresent: true, actionTaken: action, elementId }) }] };
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return { content: [{ type: "text", text: JSON.stringify({ wasPresent: false, actionTaken: "none" }) }] };
}

export const handleInterruptsSchema = {
  name: "appium_handle_interrupts",
  description: "Process a list of potential interrupts (popups, dialogs, onboarding screens). Checks each one with a short timeout and handles it if present. Useful at the start of a flow or before assertions.",
  inputSchema: {
    type: "object" as const,
    properties: {
      interrupts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            strategy: { type: "string", description: "Locator strategy" },
            value: { type: "string", description: "Locator value" },
            action: { type: "string", enum: ["tap", "dismiss_alert", "swipe_away"], description: "Action to take (default: tap)" },
            label: { type: "string", description: "Human-readable label for logging" },
          },
          required: ["strategy", "value"],
        },
        description: "Array of potential interrupts to check and handle",
      },
      timeout: { type: "number", description: "Timeout per interrupt check in ms (default: 2000)" },
    },
    required: ["interrupts"],
  },
};

export async function handleHandleInterrupts(args: Record<string, unknown>) {
  const interrupts = args.interrupts as Array<{ strategy: string; value: string; action?: string; label?: string }>;
  const timeout = (args.timeout as number) || 2000;
  const handled: string[] = [];
  const skipped: string[] = [];

  for (const interrupt of interrupts) {
    const label = interrupt.label || `${interrupt.strategy}:${interrupt.value}`;
    const deadline = Date.now() + timeout;
    let found = false;

    while (Date.now() < deadline) {
      try {
        const data = await appiumRequest<any>({
          method: "POST",
          path: sessionPath("/element"),
          body: { using: interrupt.strategy, value: interrupt.value },
        });
        const el = data.value;
        const elementId = typeof el === "object" ? Object.values(el)[0] as string : el as string;
        const action = interrupt.action || "tap";

        if (action === "tap") {
          await appiumRequest({ method: "POST", path: sessionPath(`/element/${elementId}/click`), body: {} });
        } else if (action === "dismiss_alert") {
          await appiumRequest({ method: "POST", path: sessionPath("/execute"), body: { script: "mobile: alert", args: [{ action: "dismiss" }] } });
        } else if (action === "swipe_away") {
          await appiumRequest({ method: "POST", path: sessionPath("/execute"), body: { script: "mobile: swipe", args: [{ direction: "down", duration: 500 }] } });
        }

        handled.push(label);
        found = true;
        // Small delay after handling to let UI settle
        await new Promise((r) => setTimeout(r, 500));
        break;
      } catch {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    if (!found) {
      skipped.push(label);
    }
  }

  return { content: [{ type: "text", text: JSON.stringify({ handled, skipped, total: interrupts.length }) }] };
}
