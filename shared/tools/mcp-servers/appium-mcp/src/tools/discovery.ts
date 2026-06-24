import { appiumRequest, sessionPath } from "../utils/appiumClient.js";

export const getPageSourceSchema = {
  name: "appium_get_page_source",
  description: "Get the full UI tree as XML. Use for element discovery before interacting.",
  inputSchema: { type: "object" as const, properties: {} },
};

export async function handleGetPageSource() {
  const data = await appiumRequest<any>({ path: sessionPath("/source") });
  return { content: [{ type: "text", text: data.value }] };
}

export const findElementSchema = {
  name: "appium_find_element",
  description: "Find a single element on screen",
  inputSchema: {
    type: "object" as const,
    properties: {
      strategy: { type: "string", description: "Locator strategy: 'accessibility id', 'id', 'xpath', 'class name', '-ios predicate string', '-android uiautomator'" },
      value: { type: "string", description: "Locator value" },
    },
    required: ["strategy", "value"],
  },
};

export async function handleFindElement(args: Record<string, unknown>) {
  const data = await appiumRequest<any>({
    method: "POST",
    path: sessionPath("/element"),
    body: { using: args.strategy, value: args.value },
  });
  const el = data.value;
  const elementId = typeof el === "object" ? Object.values(el)[0] : el;
  return { content: [{ type: "text", text: JSON.stringify({ elementId }) }] };
}

export const findElementsSchema = {
  name: "appium_find_elements",
  description: "Find multiple elements matching criteria",
  inputSchema: {
    type: "object" as const,
    properties: {
      strategy: { type: "string", description: "Locator strategy" },
      value: { type: "string", description: "Locator value" },
    },
    required: ["strategy", "value"],
  },
};

export async function handleFindElements(args: Record<string, unknown>) {
  const data = await appiumRequest<any>({
    method: "POST",
    path: sessionPath("/elements"),
    body: { using: args.strategy, value: args.value },
  });
  const elements = (data.value || []).map((el: any) => ({
    elementId: typeof el === "object" ? Object.values(el)[0] : el,
  }));
  return { content: [{ type: "text", text: JSON.stringify({ elements }, null, 2) }] };
}

export const getContextsSchema = {
    name: "appium_get_contexts",
    description: "Get available contexts (NATIVE_APP, WEBVIEW_*, etc.)",
    inputSchema: { type: "object" as const, properties: {}, required: [] as string[] },
};

export async function handleGetContexts() {
    const path = sessionPath("/contexts");
    const res = await appiumRequest<{ value: string[] }>({ path });
    return { content: [{ type: "text", text: JSON.stringify(res.value) }] };
}

export const setContextSchema = {
    name: "appium_set_context",
    description: "Switch between NATIVE_APP and WEBVIEW contexts for hybrid app testing",
    inputSchema: {
        type: "object" as const,
        properties: {
            context: { type: "string", description: "Context name (e.g. NATIVE_APP, WEBVIEW_*)" },
        },
        required: ["context"],
    },
};

export async function handleSetContext(args: Record<string, unknown>) {
    const path = sessionPath("/context");
    await appiumRequest({ method: "POST", path, body: { name: args.context as string } });
    return { content: [{ type: "text", text: JSON.stringify({ context: args.context, switched: true }) }] };
}
