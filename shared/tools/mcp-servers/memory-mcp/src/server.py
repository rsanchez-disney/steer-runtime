"""CCS Memory MCP Server — FastAPI + fastapi-mcp (estilo JedAI)."""

import argparse
import os

import uvicorn
from fastapi import FastAPI
from fastapi_mcp import FastApiMCP
from pydantic import BaseModel

app = FastAPI(title="CCS Memory MCP", version="0.2.0")


# ── Request/Response models ──

class SaveRequest(BaseModel):
    title: str
    content: str
    type: str = "manual"
    project: str = ""
    scope: str = "project"
    session_id: str = ""
    topic_key: str = ""

class SearchRequest(BaseModel):
    query: str
    project: str = ""
    scope: str = ""
    type: str = ""
    limit: int = 10

class ContextRequest(BaseModel):
    project: str = ""
    scope: str = "project"
    limit: int = 20

class SessionStartRequest(BaseModel):
    id: str
    project: str
    directory: str = ""

class SessionEndRequest(BaseModel):
    id: str
    summary: str = ""

class SummaryRequest(BaseModel):
    content: str
    project: str
    session_id: str = ""

class UpdateRequest(BaseModel):
    title: str = ""
    content: str = ""
    type: str = ""
    project: str = ""

class SavePromptRequest(BaseModel):
    content: str = ""
    project: str = ""
    session_id: str = ""


# ── Endpoints ──

@app.post("/mem_save")
def mem_save(req: SaveRequest):
    """Save an observation to persistent memory. Use: **What** **Why** **Where** **Learned** format."""
    from .models import Observation
    from . import store
    obs = Observation(**req.model_dump())
    result = store.save_observation(obs)
    return {"id": result.id, "title": result.title, "upserted": bool(req.topic_key)}


@app.post("/mem_search")
def mem_search(req: SearchRequest):
    """Search persistent memory using semantic similarity."""
    from . import store
    results = store.search(req.query, project=req.project, scope=req.scope, obs_type=req.type, limit=req.limit)
    return results or {"message": f"No memories found for: \"{req.query}\""}


@app.post("/mem_context")
def mem_context(req: ContextRequest):
    """Get recent memory context from previous sessions, sorted by timestamp."""
    from . import store
    return store.get_recent(project=req.project, scope=req.scope, limit=req.limit)


@app.get("/mem_get/{obs_id}")
def mem_get_observation(obs_id: str):
    """Get full content of a specific observation by ID."""
    from . import store
    result = store.get_observation(obs_id)
    if not result:
        return {"error": "Observation not found"}
    return result


@app.put("/mem_update/{obs_id}")
def mem_update(obs_id: str, req: UpdateRequest):
    """Update an existing observation by ID."""
    from . import store
    fields = {k: v for k, v in req.model_dump().items() if v}
    if not fields:
        return {"error": "No fields to update"}
    result = store.update_observation(obs_id, **fields)
    return result or {"error": "Observation not found"}


@app.delete("/mem_delete/{obs_id}")
def mem_delete(obs_id: str, hard_delete: bool = False):
    """Delete an observation by ID. Soft-delete by default."""
    from . import store
    return {"deleted": store.delete_observation(obs_id, hard=hard_delete)}


@app.post("/mem_session_start")
def mem_session_start(req: SessionStartRequest):
    """Register the start of a new coding session."""
    from .models import Session
    from . import store
    session = Session(**req.model_dump())
    result = store.start_session(session)
    return {"id": result.id, "project": result.project, "status": "active"}


@app.post("/mem_session_end")
def mem_session_end(req: SessionEndRequest):
    """Mark a coding session as completed."""
    from . import store
    result = store.end_session(req.id, summary=req.summary)
    return result or {"error": "Session not found"}


@app.post("/mem_session_summary")
def mem_session_summary(req: SummaryRequest):
    """Save a comprehensive end-of-session summary."""
    from .models import Observation
    from . import store
    obs = Observation(
        title=f"Session summary — {req.project}",
        content=req.content, type="summary",
        project=req.project, scope="project",
        session_id=req.session_id or f"manual-save-{req.project}",
    )
    result = store.save_observation(obs)
    return {"id": result.id, "saved": True}


@app.post("/mem_save_prompt")
def mem_save_prompt(req: SavePromptRequest):
    """Save a user prompt to persistent memory."""
    from .models import Observation
    from . import store
    obs = Observation(
        title="User prompt", content=req.content, type="prompt",
        project=req.project, scope="project",
        session_id=req.session_id or f"manual-save-{req.project}",
    )
    result = store.save_observation(obs)
    return {"id": result.id, "saved": True}


@app.get("/health")
def health():
    """Health check. Returns Redis connectivity status."""
    from . import store
    return store.health()


# Mount MCP over FastAPI
mcp = FastApiMCP(app, describe_full_response_schema=True)
mcp.mount_http()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=int(os.getenv("MCP_PORT", "9377")))
    args, _ = parser.parse_known_args()
    uvicorn.run(app, host="0.0.0.0", port=args.port)
