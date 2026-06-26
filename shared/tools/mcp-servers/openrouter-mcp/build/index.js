import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
const API_BASE = "https://openrouter.ai/api/v1";
const API_KEY = process.env.OPENROUTER_API_KEY || "";
const DEFAULT_MODEL = process.env.OPENROUTER_DEFAULT_MODEL || "anthropic/claude-sonnet-4";
const MAX_TOKENS = parseInt(process.env.OPENROUTER_MAX_TOKENS_PER_CALL || "4096", 10);
function headers() {
    return {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.disney.com/SANCR225/steer-runtime",
        "X-Title": "steer-runtime",
    };
}
// --- Tool schemas ---
const chatSchema = {
    name: "openrouter_chat",
    description: "Send a prompt to an alternative LLM via OpenRouter. This calls an external paid API — use judiciously.",
    inputSchema: {
        type: "object",
        properties: {
            prompt: { type: "string", description: "The prompt to send" },
            model: { type: "string", description: `Model ID (e.g., openai/gpt-4o, google/gemini-2.5-pro). Default: ${DEFAULT_MODEL}` },
            systemPrompt: { type: "string", description: "System message (optional)" },
            maxTokens: { type: "number", description: `Max response tokens (default: ${MAX_TOKENS})` },
            temperature: { type: "number", description: "Temperature 0-2 (default: 0.7)" },
        },
        required: ["prompt"],
    },
};
const listModelsSchema = {
    name: "openrouter_list_models",
    description: "List available models on OpenRouter with pricing info.",
    inputSchema: {
        type: "object",
        properties: {
            query: { type: "string", description: "Filter models by name (optional)" },
            limit: { type: "number", description: "Max models to return (default: 20)" },
        },
        required: [],
    },
};
// --- Handlers ---
async function handleChat(args) {
    if (!API_KEY) {
        return { content: [{ type: "text", text: "Error: OPENROUTER_API_KEY is not configured. Set it in ~/.kiro/tokens.env" }], isError: true };
    }
    const { prompt, model, systemPrompt, maxTokens, temperature = 0.7 } = args;
    const selectedModel = model || DEFAULT_MODEL;
    const tokens = Math.min(maxTokens || MAX_TOKENS, MAX_TOKENS);
    const messages = [];
    if (systemPrompt)
        messages.push({ role: "system", content: systemPrompt });
    messages.push({ role: "user", content: prompt });
    const res = await fetch(`${API_BASE}/chat/completions`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
            model: selectedModel,
            messages,
            max_tokens: tokens,
            temperature,
        }),
    });
    if (!res.ok) {
        const text = await res.text();
        return { content: [{ type: "text", text: `OpenRouter API error (${res.status}): ${text}` }], isError: true };
    }
    const json = await res.json();
    const reply = json.choices?.[0]?.message?.content || "(empty response)";
    const usage = json.usage;
    let text = `**Model:** ${selectedModel}\n\n${reply}`;
    if (usage) {
        text += `\n\n---\n*Tokens: ${usage.prompt_tokens} in / ${usage.completion_tokens} out*`;
    }
    return { content: [{ type: "text", text }] };
}
async function handleListModels(args) {
    if (!API_KEY) {
        return { content: [{ type: "text", text: "Error: OPENROUTER_API_KEY is not configured." }], isError: true };
    }
    const { query, limit = 20 } = args;
    const res = await fetch(`${API_BASE}/models`, { headers: headers() });
    if (!res.ok) {
        const text = await res.text();
        return { content: [{ type: "text", text: `OpenRouter API error (${res.status}): ${text}` }], isError: true };
    }
    const json = await res.json();
    let models = json.data || [];
    if (query) {
        const q = query.toLowerCase();
        models = models.filter((m) => m.id.toLowerCase().includes(q) || m.name?.toLowerCase().includes(q));
    }
    models = models.slice(0, limit);
    let text = `**Available Models** (${models.length} shown)\n\n`;
    text += "| Model | Context | Prompt $/1M | Completion $/1M |\n|-------|---------|-------------|------------------|\n";
    for (const m of models) {
        const ctx = m.context_length ? `${Math.round(m.context_length / 1000)}k` : "?";
        const promptPrice = m.pricing?.prompt ? `$${(parseFloat(m.pricing.prompt) * 1_000_000).toFixed(2)}` : "?";
        const compPrice = m.pricing?.completion ? `$${(parseFloat(m.pricing.completion) * 1_000_000).toFixed(2)}` : "?";
        text += `| ${m.id} | ${ctx} | ${promptPrice} | ${compPrice} |\n`;
    }
    return { content: [{ type: "text", text }] };
}
// --- Server ---
const server = new Server({ name: "openrouter-mcp", version: "1.0.0" }, { capabilities: { tools: {} } });
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [chatSchema, listModelsSchema],
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    switch (name) {
        case "openrouter_chat": return handleChat(args);
        case "openrouter_list_models": return handleListModels(args);
        default: return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
    }
});
const transport = new StdioServerTransport();
(async () => { await server.connect(transport); })();
