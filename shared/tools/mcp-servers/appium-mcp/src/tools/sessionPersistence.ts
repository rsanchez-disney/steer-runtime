import { appiumRequest, getSessionId, setSessionId } from "../utils/appiumClient.js";
import { APPIUM_URL } from "../config.js";

export const listSessionsSchema = {
  name: "appium_list_sessions",
  description: "List all active Appium sessions on the server. Useful for reconnecting to an existing session.",
  inputSchema: {
    type: "object" as const,
    properties: {},
  },
};

export async function handleListSessions() {
  const data = await appiumRequest<any>({ path: "/sessions" });
  const sessions = data.value || [];
  const currentId = getSessionId();
  const result = sessions.map((s: any) => ({
    id: s.id,
    capabilities: {
      platformName: s.capabilities?.platformName,
      deviceName: s.capabilities?.deviceName,
      bundleId: s.capabilities?.bundleId || s.capabilities?.appPackage,
      app: s.capabilities?.app,
    },
    isCurrent: s.id === currentId,
  }));
  return { content: [{ type: "text", text: JSON.stringify({ sessions: result, count: result.length }) }] };
}

export const reconnectSessionSchema = {
  name: "appium_reconnect_session",
  description: "Reconnect to an existing Appium session by ID. Use appium_list_sessions first to find active sessions.",
  inputSchema: {
    type: "object" as const,
    properties: {
      sessionId: { type: "string", description: "Session ID to reconnect to" },
    },
    required: ["sessionId"],
  },
};

export async function handleReconnectSession(args: Record<string, unknown>) {
  const sessionId = args.sessionId as string;

  // Verify the session is still alive
  try {
    const data = await appiumRequest<any>({ path: `/session/${sessionId}` });
    setSessionId(sessionId);

    const caps = data.value || {};
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: true,
          sessionId,
          platform: caps.platformName,
          device: caps.deviceName,
          app: caps.bundleId || caps.appPackage || caps.app,
        }),
      }],
    };
  } catch (err: any) {
    return {
      content: [{ type: "text", text: JSON.stringify({ success: false, error: `Session ${sessionId} not found or expired: ${err.message}` }) }],
      isError: true,
    };
  }
}
