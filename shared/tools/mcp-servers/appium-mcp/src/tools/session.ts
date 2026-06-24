import { appiumRequest, getSessionId, setSessionId, sessionPath } from "../utils/appiumClient.js";

export const createSessionSchema = {
  name: "appium_create_session",
  description: "Create a new Appium session on a connected device",
  inputSchema: {
    type: "object" as const,
    properties: {
      platformName: { type: "string", enum: ["iOS", "Android"], description: "Target platform" },
      deviceName: { type: "string", description: "Device name or UDID" },
      app: { type: "string", description: "Path to .app/.apk or bundle ID (optional)" },
      bundleId: { type: "string", description: "iOS bundle ID (if app already installed)" },
      appPackage: { type: "string", description: "Android package name" },
      appActivity: { type: "string", description: "Android activity name" },
      automationName: { type: "string", description: "XCUITest or UiAutomator2 (auto-detected if omitted)" },
      noReset: { type: "boolean", description: "Don't reinstall app (default: true)" },
      udid: { type: "string", description: "Device UDID for targeting a specific simulator or device" },
      additionalCapabilities: { type: "object", description: "Additional Appium capabilities to merge" },
    },
    required: ["platformName", "deviceName"],
  },
};

export async function handleCreateSession(args: Record<string, unknown>) {
  const platform = args.platformName as string;
  const automation = (args.automationName as string) || (platform === "iOS" ? "XCUITest" : "UiAutomator2");

  const caps: Record<string, unknown> = {
    platformName: platform,
    "appium:automationName": automation,
    "appium:deviceName": args.deviceName,
    "appium:noReset": args.noReset !== false,
  };
  if (args.app) caps["appium:app"] = args.app;
  if (args.bundleId) caps["appium:bundleId"] = args.bundleId;
  if (args.appPackage) caps["appium:appPackage"] = args.appPackage;
  if (args.appActivity) caps["appium:appActivity"] = args.appActivity;
  if (args.udid) caps["appium:udid"] = args.udid;
  if (args.additionalCapabilities && typeof args.additionalCapabilities === "object") {
    Object.assign(caps, args.additionalCapabilities);
  }

  const data = await appiumRequest<any>({
    method: "POST",
    path: "/session",
    body: { capabilities: { alwaysMatch: caps } },
  });

  const sessionId = data.value?.sessionId || data.sessionId;
  setSessionId(sessionId);
  return { content: [{ type: "text", text: JSON.stringify({ sessionId, capabilities: data.value?.capabilities || caps }, null, 2) }] };
}

export const endSessionSchema = {
  name: "appium_end_session",
  description: "End the current Appium session",
  inputSchema: { type: "object" as const, properties: {} },
};

export async function handleEndSession() {
  await appiumRequest({ method: "DELETE", path: sessionPath() });
  setSessionId(null);
  return { content: [{ type: "text", text: JSON.stringify({ success: true }) }] };
}

export const getSessionInfoSchema = {
  name: "appium_get_session_info",
  description: "Get current session details",
  inputSchema: { type: "object" as const, properties: {} },
};

export async function handleGetSessionInfo() {
  const sid = getSessionId();
  if (!sid) return { content: [{ type: "text", text: JSON.stringify({ active: false }) }] };
  const data = await appiumRequest<any>({ path: sessionPath() });
  return { content: [{ type: "text", text: JSON.stringify({ sessionId: sid, ...data.value }, null, 2) }] };
}
