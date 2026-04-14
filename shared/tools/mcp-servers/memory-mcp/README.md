# memory-mcp

Persistent memory MCP server for AI agents. Combines semantic search (Redis vector search) with structured observations (sessions, typed observations, dedup by topic).

## How it works

Unlike other MCP servers in steer-runtime (Node.js stdio), memory-mcp runs as a Docker service (Python + Redis). Koda manages its lifecycle automatically.

## Tools

| Tool | Description |
|------|-------------|
| `mem_save` | Save observation (decision, bugfix, pattern, etc.) |
| `mem_search` | Semantic search across memories |
| `mem_context` | Get recent context by project (chronological) |
| `mem_get_observation` | Get observation by ID |
| `mem_update` | Update existing observation |
| `mem_delete` | Delete observation (soft/hard) |
| `mem_session_start` | Start a work session |
| `mem_session_end` | Close session with summary |
| `mem_session_summary` | Save session summary |
| `mem_save_prompt` | Save user prompt |
| `health` | Redis connectivity status |

## Requirements

- A container runtime: Docker, Podman, nerdctl, or Colima
- ~500MB disk for Redis + Python image + ONNX model

## Manual usage

```bash
cd shared/tools/mcp-servers/memory-mcp
docker compose up -d
curl http://localhost:9377/health
```

When managed by Koda, use `koda memory start/stop/status`.
