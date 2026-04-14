"""Capa de almacenamiento Redis con vector search — estilo JedAI."""

import json
import os
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastembed import TextEmbedding
from redisvl.schema import IndexSchema
from redisvl.index import SearchIndex
from redisvl.query import VectorQuery
from redisvl.query.filter import Tag

from .models import Observation, Session

VECTOR_INDEX_NAME = os.getenv("VECTOR_INDEX_NAME", "ccs-memory")
SESSION_PREFIX = os.getenv("SESSION_PREFIX", "ccs-session:")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

model = TextEmbedding("sentence-transformers/all-MiniLM-L6-v2")


def _memory_schema(index_name: str = VECTOR_INDEX_NAME) -> dict:
    return {
        "index": {
            "name": index_name,
            "prefix": index_name,
            "storage_type": "json",
        },
        "fields": [
            {"name": "title", "type": "text"},
            {"name": "content", "type": "text"},
            {"name": "type", "type": "tag"},
            {"name": "project", "type": "tag"},
            {"name": "scope", "type": "tag"},
            {"name": "session_id", "type": "tag"},
            {"name": "topic_key", "type": "tag"},
            {"name": "deleted", "type": "tag"},
            {"name": "created_at", "type": "text", "attrs": {"sortable": True}},
            {"name": "updated_at", "type": "text"},
            {
                "name": "embedding",
                "type": "vector",
                "attrs": {
                    "algorithm": "flat",
                    "dims": 384,
                    "distance_metric": "cosine",
                    "datatype": "float32",
                },
            },
        ],
    }


_index: SearchIndex | None = None


def _get_index() -> SearchIndex:
    global _index
    if _index is None:
        schema = IndexSchema.from_dict(_memory_schema())
        _index = SearchIndex(schema, redis_url=REDIS_URL)
        try:
            _index.create(overwrite=False)
        except Exception:
            pass
    return _index


def _redis_client():
    """Get the raw Redis client from the index."""
    return _get_index().client


def _embed(text: str) -> list[float]:
    import numpy as np
    try:
        embeddings = list(model.embed([text]))
        return np.array(embeddings[0], dtype="float32").tolist()
    except Exception as e:
        raise RuntimeError(f"Embedding failed for text ({len(text)} chars): {e}") from e


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _prefix(obs_id: str) -> str:
    p = f"{VECTOR_INDEX_NAME}:"
    return obs_id if obs_id.startswith(p) else f"{p}{obs_id}"


def _strip_prefix(key: str) -> str:
    p = f"{VECTOR_INDEX_NAME}:"
    return key[len(p):] if key.startswith(p) else key


# ── Observations ──

def save_observation(obs: Observation) -> Observation:
    if obs.topic_key and obs.project:
        existing = _find_by_topic_key(obs.topic_key, obs.project, obs.scope)
        if existing:
            obs.id = existing
            return update_observation(obs.id, title=obs.title, content=obs.content, type=obs.type)

    obs.id = str(uuid.uuid4())
    obs.created_at = _now_iso()
    obs.updated_at = obs.created_at

    doc = {
        "id": obs.id,
        "title": obs.title,
        "content": obs.content,
        "type": obs.type,
        "project": obs.project,
        "scope": obs.scope,
        "session_id": obs.session_id,
        "topic_key": obs.topic_key,
        "deleted": "false",
        "created_at": obs.created_at,
        "updated_at": obs.updated_at,
        "embedding": _embed(f"{obs.title} {obs.content}"),
    }
    _get_index().load([doc], id_field="id")
    return obs


def get_observation(obs_id: str) -> dict | None:
    doc = _get_index().fetch(obs_id)
    if not doc or doc.get("deleted") == "true":
        return None
    doc.pop("embedding", None)
    return doc


def update_observation(obs_id: str, **fields) -> dict | None:
    doc = _get_index().fetch(obs_id)
    if not doc:
        return None

    for k, v in fields.items():
        if v:
            doc[k] = v
    doc["updated_at"] = _now_iso()
    doc["embedding"] = _embed(f"{doc.get('title', '')} {doc.get('content', '')}")
    _get_index().load([doc], id_field="id")
    return get_observation(obs_id)


def delete_observation(obs_id: str, hard: bool = False) -> bool:
    if hard:
        try:
            _get_index().client.delete(_prefix(obs_id))
            return True
        except Exception:
            return False
    else:
        doc = _get_index().fetch(obs_id)
        if not doc:
            return False
        doc["deleted"] = "true"
        doc["updated_at"] = _now_iso()
        _get_index().load([doc], id_field="id")
        return True


def search(query: str, project: str = "", scope: str = "", obs_type: str = "", limit: int = 10) -> list[dict]:
    embedding = _embed(query)
    q = VectorQuery(
        vector=embedding,
        vector_field_name="embedding",
        num_results=limit,
    )

    filters = [Tag("deleted") == "false"]
    if project:
        filters.append(Tag("project") == project)
    if scope:
        filters.append(Tag("scope") == scope)
    if obs_type:
        filters.append(Tag("type") == obs_type)

    if len(filters) > 1:
        f = filters[0]
        for ff in filters[1:]:
            f = f & ff
        q.set_filter(f)
    elif filters:
        q.set_filter(filters[0])

    results = _get_index().query(q)
    out = []
    for r in results:
        doc = get_observation(_strip_prefix(r.get("id", "")))
        if doc:
            out.append(doc)
    return out


def get_recent(project: str = "", scope: str = "project", limit: int = 20) -> list[dict]:
    """Get chronologically recent observations using a RediSearch query sorted by created_at."""
    idx = _get_index()
    filters = [Tag("deleted") == "false"]
    if project:
        filters.append(Tag("project") == project)
    if scope:
        filters.append(Tag("scope") == scope)

    # Build filter expression
    filter_expr = filters[0]
    for f in filters[1:]:
        filter_expr = filter_expr & f

    # Use raw FT.SEARCH with SORTBY for chronological ordering
    from redis.commands.search.query import Query as RSQuery
    q = RSQuery(str(filter_expr)).sort_by("created_at", asc=False).paging(0, limit)
    raw = idx.client.ft(idx.schema.index.name).search(q)

    out = []
    for doc in raw.docs:
        obs = get_observation(_strip_prefix(doc.id))
        if obs:
            out.append(obs)
    return out


def _find_by_topic_key(topic_key: str, project: str, scope: str) -> str | None:
    """Find an observation by exact topic_key match using a tag filter query."""
    idx = _get_index()
    filter_expr = (
        (Tag("topic_key") == topic_key)
        & (Tag("project") == project)
        & (Tag("deleted") == "false")
    )
    if scope:
        filter_expr = filter_expr & (Tag("scope") == scope)

    from redis.commands.search.query import Query as RSQuery
    q = RSQuery(str(filter_expr)).paging(0, 1)
    raw = idx.client.ft(idx.schema.index.name).search(q)

    for doc in raw.docs:
        return _strip_prefix(doc.id)
    return None


# ── Sessions (persisted in Redis) ──

def _session_key(session_id: str) -> str:
    return f"{SESSION_PREFIX}{session_id}"


def start_session(session: Session) -> Session:
    data = {
        "id": session.id,
        "project": session.project,
        "directory": session.directory,
        "status": "active",
        "summary": "",
        "started_at": session.started_at,
        "ended_at": "",
    }
    _redis_client().json().set(_session_key(session.id), "$", data)
    return session


def end_session(session_id: str, summary: str = "") -> dict | None:
    key = _session_key(session_id)
    client = _redis_client()
    data = client.json().get(key)
    if not data:
        return None
    data.update({
        "status": "closed",
        "summary": summary,
        "ended_at": _now_iso(),
    })
    client.json().set(key, "$", data)
    return data


def get_session(session_id: str) -> dict | None:
    return _redis_client().json().get(_session_key(session_id))


# ── Health ──

def health() -> dict:
    try:
        _get_index().client.ping()
        return {"status": "ok", "redis": "connected"}
    except Exception:
        return {"status": "error", "redis": "disconnected"}
