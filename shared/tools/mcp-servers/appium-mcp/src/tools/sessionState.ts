import { appiumRequest, sessionPath, getSessionId } from "../utils/appiumClient.js";

export const getSessionStateSchema = {
  name: "appium_get_session_state",
  description: "Get a lightweight summary of the current session state including platform, app, screen context, and alert presence. Useful for orienting after reconnection or between actions.",
  inputSchema: {
    type: "object" as const,
    properties: {},
  },
};

export async function handleGetSessionState() {
  const sessionId = getSessionId();
  if (!sessionId) {
    return { content: [{ type: "text", text: JSON.stringify({ active: false, message: "No active session" }) }] };
  }

  const result: Record<string, unknown> = { active: true, sessionId };

  // Get session capabilities
  try {
    const capsData = await appiumRequest<any>({ path: `/session/${sessionId}` });
    const caps = capsData.value || {};
    result.platform = caps.platformName;
    result.device = caps.deviceName;
    result.bundleId = caps.bundleId || caps.appPackage;
    result.automationName = caps.automationName;
  } catch {
    // Session may have expired
    return { content: [{ type: "text", text: JSON.stringify({ active: false, sessionId, message: "Session expired or unreachable" }) }] };
  }

  // Check for alerts
  try {
    const alertData = await appiumRequest<any>({ path: sessionPath("/alert/text") });
    result.isAlertPresent = true;
    result.alertText = alertData.value;
  } catch {
    result.isAlertPresent = false;
  }

  // Get current context (NATIVE_APP vs WEBVIEW)
  try {
    const ctxData = await appiumRequest<any>({ path: sessionPath("/context") });
    result.currentContext = ctxData.value;
  } catch {
    result.currentContext = "unknown";
  }

  // Get orientation
  try {
    const orientData = await appiumRequest<any>({ path: sessionPath("/orientation") });
    result.orientation = orientData.value;
  } catch {
    result.orientation = "unknown";
  }

  // Get a brief screen summary (navigation bar title if present)
  try {
    const source = await appiumRequest<any>({ path: sessionPath("/source") });
    const xml = source.value || "";
    // Extract navigation bar title
    const navMatch = xml.match(/XCUIElementTypeNavigationBar[^>]*name="([^"]+)"/)
      || xml.match(/XCUIElementTypeStaticText[^>]*label="([^"]+)"[^>]*type="XCUIElementTypeNavigationBar"/);
    result.screenTitle = navMatch ? navMatch[1] : null;

    // Extract tab bar items
    const tabMatches = [...xml.matchAll(/XCUIElementTypeButton[^>]*label="([^"]+)"[^/]*\/>/g)]
      .filter((m) => xml.slice(Math.max(0, xml.indexOf(m[0]) - 200), xml.indexOf(m[0])).includes("TabBar"));
    if (tabMatches.length > 0) {
      result.visibleTabs = tabMatches.map((m) => m[1]);
    }
  } catch {
    result.screenTitle = null;
  }

  return { content: [{ type: "text", text: JSON.stringify(result) }] };
}
