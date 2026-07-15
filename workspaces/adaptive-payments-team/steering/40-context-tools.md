# Context tools — when to use what

## Three layers of context

Agents have access to three complementary context systems. Each answers different questions at different scopes.

## Cortex — platform architecture (`@cortex/*`)

**Scope:** Cross-repo, all services in the workspace

**Use when:**

- "Which services handle payments?"
- "What endpoints does service X expose?"
- "What Kafka topics connect these services?"
- "What DTOs define the contract between A and B?"
- "Which services would be affected if I change this endpoint?"

**Tools:**

- `@cortex/find_relevant_services` — keyword search across all services
- `@cortex/list_endpoints` — endpoint index for one service
- `@cortex/get_service_context` — deep dive (dependencies, contracts, communication)
- `@cortex/get_endpoint_contract` — request/response schema for an endpoint

**Data source:** Extracted from build files, manifests, and source code. Deterministic, no LLMs.

**Freshness:** Updated when user runs `koda cortex extract`. Reflects code at extraction time.

## Graphify — code-level graph (context files)

**Scope:** Single repo, internal code structure

**Use when:**

- "What functions call this method?"
- "What are the main code clusters in this project?"
- "Which files are highly connected (god nodes)?"
- "Are there unexpected dependencies between modules?"

**Access:** Read graphify reports from `~/.kiro/workspaces/<team>/graphify/<project>-GRAPH_REPORT.md`

**Data source:** Regex-based extraction of symbols, imports, and calls from source files.

**Freshness:** Updated when user runs `koda graphify`.

## Yax — session memory (`@yax/*`)

**Scope:** Across time, decisions and learnings

**Use when:**

- "What did we decide about the auth refactor?"
- "What patterns has this team established?"
- "What was the root cause of last week's bug?"
- "What's the context from the previous session?"

**Tools:**

- `@yax/save` — record a decision, pattern, or discovery
- `@yax/search` — find past observations by keyword
- `@yax/context` — recent session context
- `@yax/related` — graph traversal for connected observations

**Data source:** Human-authored observations and agent summaries. Semantic search.

**Freshness:** Real-time — written during each session.

## Composition patterns

### Starting a new feature across services

1. `@cortex/find_relevant_services` — identify which services are involved
2. `@cortex/get_service_context` — understand each service's endpoints and dependencies
3. Read graphify report — understand code structure within the target service
4. `@yax/search` — check if there are past decisions about this area

### Investigating a production issue

1. `@cortex/get_endpoint_contract` — confirm what the endpoint expects/returns
2. `@cortex/get_service_context` with `communication` — see what calls this service
3. `@yax/search` — check for past incidents or patterns in this area

### Planning a refactoring

1. `@cortex/find_relevant_services` — scope what's affected
2. `@cortex/list_endpoints` — inventory of contracts that might break
3. Read graphify reports — find god nodes and tangled dependencies within each service
4. `@yax/save` — record the refactoring decision and rationale

## When Cortex tools are unavailable

If `@cortex/*` tools are not registered (no graph extracted, CORTEX_DIR not set), agents fall back to:

- Reading static context files in `workspaces/<team>/context/`
- Asking the user which services are relevant
- Using `code` and `grep` tools to search across locally available repos

Run `koda cortex extract` to enable Cortex tools for the active workspace.
