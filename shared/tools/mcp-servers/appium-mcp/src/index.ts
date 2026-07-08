import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Session tools
import { createSessionSchema, handleCreateSession, endSessionSchema, handleEndSession, getSessionInfoSchema, handleGetSessionInfo } from "./tools/session.js";
import { listSessionsSchema, handleListSessions, reconnectSessionSchema, handleReconnectSession } from "./tools/sessionPersistence.js";
import { getSessionStateSchema, handleGetSessionState } from "./tools/sessionState.js";

// Discovery tools
import { getPageSourceSchema, handleGetPageSource, findElementSchema, handleFindElement, findElementsSchema, handleFindElements, getContextsSchema, handleGetContexts, setContextSchema, handleSetContext } from "./tools/discovery.js";

// Action tools
import { tapSchema, handleTap, typeSchema, handleType, swipeSchema, handleSwipe, backSchema, handleBack, longPressSchema, handleLongPress, scrollToSchema, handleScrollTo, launchAppSchema, handleLaunchApp, setPermissionSchema, handleSetPermission } from "./tools/actions.js";
import { scrollSchema, handleScroll } from "./tools/scroll.js";

// Verification tools
import { screenshotSchema, handleScreenshot, isElementDisplayedSchema, handleIsElementDisplayed, getElementAttributeSchema, handleGetElementAttribute } from "./tools/verification.js";

// Wait tools
import { waitForElementSchema, handleWaitForElement } from "./tools/waits.js";

// Interrupt handling tools
import { dismissIfPresentSchema, handleDismissIfPresent, handleInterruptsSchema, handleHandleInterrupts } from "./tools/interrupts.js";

const allSchemas = [
  // Session management
  createSessionSchema,
  endSessionSchema,
  getSessionInfoSchema,
  listSessionsSchema,
  reconnectSessionSchema,
  getSessionStateSchema,
  // Discovery
  getPageSourceSchema,
  findElementSchema,
  findElementsSchema,
  getContextsSchema,
  setContextSchema,
  // Actions
  tapSchema,
  typeSchema,
  swipeSchema,
  backSchema,
  longPressSchema,
  scrollToSchema,
  scrollSchema,
  launchAppSchema,
  setPermissionSchema,
  // Verification
  screenshotSchema,
  isElementDisplayedSchema,
  getElementAttributeSchema,
  // Waits
  waitForElementSchema,
  // Interrupt handling
  dismissIfPresentSchema,
  handleInterruptsSchema,
];

const toolHandlers: Record<string, (args: Record<string, unknown>) => Promise<any>> = {
  // Session management
  appium_create_session: handleCreateSession,
  appium_end_session: handleEndSession,
  appium_get_session_info: handleGetSessionInfo,
  appium_list_sessions: handleListSessions,
  appium_reconnect_session: handleReconnectSession,
  appium_get_session_state: handleGetSessionState,
  // Discovery
  appium_get_page_source: handleGetPageSource,
  appium_find_element: handleFindElement,
  appium_find_elements: handleFindElements,
  appium_get_contexts: handleGetContexts,
  appium_set_context: handleSetContext,
  // Actions
  appium_tap: handleTap,
  appium_type: handleType,
  appium_swipe: handleSwipe,
  appium_back: handleBack,
  appium_long_press: handleLongPress,
  appium_scroll_to: handleScrollTo,
  appium_scroll: handleScroll,
  appium_launch_app: handleLaunchApp,
  appium_set_permission: handleSetPermission,
  // Verification
  appium_screenshot: handleScreenshot,
  appium_is_element_displayed: handleIsElementDisplayed,
  appium_get_element_attribute: handleGetElementAttribute,
  // Waits
  appium_wait_for_element: handleWaitForElement,
  // Interrupt handling
  appium_dismiss_if_present: handleDismissIfPresent,
  appium_handle_interrupts: handleHandleInterrupts,
};

const server = new Server({ name: "appium-mcp", version: "1.1.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: allSchemas }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const handler = toolHandlers[req.params.name];
  if (!handler) return { content: [{ type: "text", text: `Unknown tool: ${req.params.name}` }], isError: true };
  return handler(req.params.arguments as Record<string, unknown>);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("Appium MCP server v1.1.0 running on stdio\n");
}

main().catch((err) => { process.stderr.write(`Fatal: ${err.message}\n`); process.exit(1); });
