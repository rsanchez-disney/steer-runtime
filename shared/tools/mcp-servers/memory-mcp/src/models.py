"""Modelos de datos para ccs-memory-mcp."""

from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field


ObservationType = Literal[
    "manual", "decision", "architecture", "bugfix",
    "pattern", "config", "discovery", "learning",
    "session", "prompt", "summary",
]

Scope = Literal["project", "personal"]


class Observation(BaseModel):
    id: str = ""
    title: str = ""
    content: str
    type: ObservationType = "manual"
    project: str = ""
    scope: Scope = "project"
    session_id: str = ""
    topic_key: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    deleted: bool = False


class Session(BaseModel):
    id: str
    project: str
    directory: str = ""
    status: Literal["active", "closed"] = "active"
    summary: str = ""
    started_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    ended_at: str = ""
