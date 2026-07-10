import { appiumRequest, sessionPath } from "../utils/appiumClient.js";

export const scrollSchema = {
  name: "appium_scroll",
  description: "Scroll the screen in a direction by a specified distance. Does not require a target element — useful for exploring content below the fold.",
  inputSchema: {
    type: "object" as const,
    properties: {
      direction: {
        type: "string",
        enum: ["up", "down", "left", "right"],
        description: "Scroll direction",
      },
      distance: {
        type: "number",
        description: "Scroll distance as percentage of screen (1-100, default: 50)",
      },
      elementId: {
        type: "string",
        description: "Optional: scroll within a specific scrollable container element",
      },
    },
    required: ["direction"],
  },
};

export async function handleScroll(args: Record<string, unknown>) {
  const direction = args.direction as string;
  const distance = ((args.distance as number) || 50) / 100;
  const elementId = args.elementId as string | undefined;

  const scrollArgs: Record<string, unknown> = { direction };

  if (elementId) {
    scrollArgs.elementId = elementId;
  }

  // Use mobile: scroll for iOS and mobile: scrollGesture for Android
  // Try scroll first, fall back to swipe
  try {
    await appiumRequest({
      method: "POST",
      path: sessionPath("/execute"),
      body: {
        script: "mobile: scroll",
        args: [{ direction, distance, ...(elementId ? { elementId } : {}) }],
      },
    });
  } catch {
    // Fallback: use swipe with calculated coordinates
    const duration = 800;
    await appiumRequest({
      method: "POST",
      path: sessionPath("/execute"),
      body: { script: "mobile: swipe", args: [{ direction, duration }] },
    });
  }

  return {
    content: [{ type: "text", text: JSON.stringify({ success: true, direction, distance: Math.round(distance * 100) }) }],
  };
}
