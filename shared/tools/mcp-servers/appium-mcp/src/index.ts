import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { createSessionSchema, handleCreateSession, endSessionSchema, handleEndSession, getSessionInfoSchema, handleGetSessionInfo } from "./tools/session.js";
import { getPageSourceSchema, handleGetPageSource, findElementSchema, handleFindElement, findElementsSchema, handleFindElements, getContextsSchema, handleGetContexts, setContextSchema, handleSetContext } from "./tools/discovery.js";
import { tapSchema, handleTap, typeSchema, handleType, swipeSchema, handleSwipe, backSchema, handleBack, longPressSchema, handleLongPress, scrollToSchema, handleScrollTo, launchAppSchema, handleLaunchApp, setPermissionSchema, handleSetPermission } from "./tools/actions.js";
import { screenshotSchema, handleScreenshot, isElementDisplayedSchema, handleIsElementDisplayed, getElementAttributeSchema, handleGetElementAttribute } from "./tools/verification.js";
import { waitForElementSchema, handleWaitForElement } from "./tools/waits.js";

const allSchemas = [
  createSessionSchema,
  endSessionSchema,
  getSessionInfoSchema,
  getPageSourceSchema,
  findElementSchema,
  findElementsSchema,
  tapSchema,
  typeSchema,
  swipeSchema,
  backSchema,
  longPressSchema,
  scrollToSchema,
  launchAppSchema,
  setPermissionSchema,
  screenshotSchema,
  isElementDisplayedSchema,
  getElementAttributeSchema,
  waitForElementSchema,
  getContextsSchema,
  setContextSchema,
];

const toolHandlers: Record<string, (args: Record<string, unknown>) => Promise<any>> = {
  appium_create_session: handleCreateSession,
  appium_end_session: handleEndSession,
  appium_get_session_info: handleGetSessionInfo,
  appium_get_page_source: handleGetPageSource,
  appium_find_element: handleFindElement,
  appium_find_elements: handleFindElements,
  appium_tap: handleTap,
  appium_type: handleType,
  appium_swipe: handleSwipe,
  appium_back: handleBack,
  appium_long_press: handleLongPress,
  appium_scroll_to: handleScrollTo,
  appium_launch_app: handleLaunchApp,
  appium_set_permission: handleSetPermission,
  appium_screenshot: handleScreenshot,
  appium_is_element_displayed: handleIsElementDisplayed,
  appium_get_element_attribute: handleGetElementAttribute,
  appium_wait_for_element: handleWaitForElement,
  appium_get_contexts: handleGetContexts,
  appium_set_context: handleSetContext,
};

const server = new Server(
  { name: "appium-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: allSchemas,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const handler = toolHandlers[name];
  if (!handler) {
    throw new Error(`Unknown tool: ${name}`);
  }
  return await handler(args as Record<string, unknown>);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Appium MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
