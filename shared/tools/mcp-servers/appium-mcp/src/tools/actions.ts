import { appiumRequest, sessionPath } from "../utils/appiumClient.js";

export const tapSchema = {
  name: "appium_tap",
  description: "Tap on an element by its ID",
  inputSchema: {
    type: "object" as const,
    properties: {
      elementId: { type: "string", description: "Element ID from find_element" },
    },
    required: ["elementId"],
  },
};

export async function handleTap(args: Record<string, unknown>) {
  await appiumRequest({ method: "POST", path: sessionPath(`/element/${args.elementId}/click`), body: {} });
  return { content: [{ type: "text", text: JSON.stringify({ success: true }) }] };
}

export const typeSchema = {
  name: "appium_type",
  description: "Type text into a field",
  inputSchema: {
    type: "object" as const,
    properties: {
      elementId: { type: "string", description: "Element ID" },
      text: { type: "string", description: "Text to type" },
      clear: { type: "boolean", description: "Clear field first (default: true)" },
    },
    required: ["elementId", "text"],
  },
};

export async function handleType(args: Record<string, unknown>) {
  if (args.clear !== false) {
    await appiumRequest({ method: "POST", path: sessionPath(`/element/${args.elementId}/clear`), body: {} });
  }
  await appiumRequest({
    method: "POST",
    path: sessionPath(`/element/${args.elementId}/value`),
    body: { text: args.text },
  });
  return { content: [{ type: "text", text: JSON.stringify({ success: true }) }] };
}

export const swipeSchema = {
  name: "appium_swipe",
  description: "Swipe in a direction on the screen",
  inputSchema: {
    type: "object" as const,
    properties: {
      direction: { type: "string", enum: ["up", "down", "left", "right"], description: "Swipe direction" },
      duration: { type: "number", description: "Duration in ms (default: 800)" },
    },
    required: ["direction"],
  },
};

export async function handleSwipe(args: Record<string, unknown>) {
  const direction = args.direction as string;
  const duration = (args.duration as number) || 800;
  await appiumRequest({
    method: "POST",
    path: sessionPath("/execute"),
    body: { script: "mobile: swipe", args: [{ direction, duration }] },
  });
  return { content: [{ type: "text", text: JSON.stringify({ success: true, direction }) }] };
}

export const backSchema = {
  name: "appium_back",
  description: "Press the back/navigation button",
  inputSchema: { type: "object" as const, properties: {} },
};

export async function handleBack() {
  await appiumRequest({ method: "POST", path: sessionPath("/back"), body: {} });
  return { content: [{ type: "text", text: JSON.stringify({ success: true }) }] };
}

export const longPressSchema = {
  name: "appium_long_press",
  description: "Long press on an element",
  inputSchema: {
    type: "object" as const,
    properties: {
      elementId: { type: "string", description: "Element ID" },
      duration: { type: "number", description: "Duration in ms (default: 1500)" },
    },
    required: ["elementId"],
  },
};

export async function handleLongPress(args: Record<string, unknown>) {
  const duration = (args.duration as number) || 1500;
  await appiumRequest({
    method: "POST",
    path: sessionPath("/execute"),
    body: { script: "mobile: longClickGesture", args: [{ elementId: args.elementId, duration }] },
  });
  return { content: [{ type: "text", text: JSON.stringify({ success: true }) }] };
}

export const scrollToSchema = {
  name: "appium_scroll_to",
  description: "Scroll until an element is found on screen",
  inputSchema: {
    type: "object" as const,
    properties: {
      strategy: { type: "string", description: "Locator strategy" },
      value: { type: "string", description: "Locator value" },
      direction: { type: "string", enum: ["up", "down"], description: "Scroll direction (default: down)" },
      maxSwipes: { type: "number", description: "Max swipe attempts (default: 5)" },
    },
    required: ["strategy", "value"],
  },
};

export async function handleScrollTo(args: Record<string, unknown>) {
  const direction = (args.direction as string) || "down";
  const maxSwipes = (args.maxSwipes as number) || 5;

  for (let i = 0; i < maxSwipes; i++) {
    try {
      const data = await appiumRequest<any>({
        method: "POST",
        path: sessionPath("/element"),
        body: { using: args.strategy, value: args.value },
      });
      const el = data.value;
      const elementId = typeof el === "object" ? Object.values(el)[0] : el;
      return { content: [{ type: "text", text: JSON.stringify({ found: true, elementId, swipes: i }) }] };
    } catch {
      await appiumRequest({
        method: "POST",
        path: sessionPath("/execute"),
        body: { script: "mobile: swipe", args: [{ direction, duration: 800 }] },
      });
    }
  }
  return { content: [{ type: "text", text: JSON.stringify({ found: false, elementId: null, swipes: maxSwipes }) }] };
}

export const launchAppSchema = {
  name: "appium_launch_app",
  description: "Launch or relaunch the app under test",
  inputSchema: {
    type: "object" as const,
    properties: {
      bundleId: { type: "string", description: "iOS bundle ID or Android package (optional, uses session default)" },
    },
  },
};

export async function handleLaunchApp(args: Record<string, unknown>) {
  const body: Record<string, unknown> = args.bundleId ? { bundleId: args.bundleId } : {};
  await appiumRequest({
    method: "POST",
    path: sessionPath("/execute"),
    body: { script: "mobile: activateApp", args: [body] },
  });
  return { content: [{ type: "text", text: JSON.stringify({ success: true }) }] };
}

export const setPermissionSchema = {
  name: "appium_set_permission",
  description: "Handle native permission dialogs (accept or dismiss)",
  inputSchema: {
    type: "object" as const,
    properties: {
      action: { type: "string", enum: ["accept", "dismiss"], description: "Accept or dismiss the dialog" },
    },
    required: ["action"],
  },
};

export async function handleSetPermission(args: Record<string, unknown>) {
  const action = args.action as string;
  await appiumRequest({
    method: "POST",
    path: sessionPath("/execute"),
    body: { script: "mobile: alert", args: [{ action }] },
  });
  return { content: [{ type: "text", text: JSON.stringify({ success: true, action }) }] };
}
