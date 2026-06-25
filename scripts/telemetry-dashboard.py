#!/usr/bin/env python3
"""
Agent usage telemetry dashboard — aggregates session telemetry into a report.
Usage: python3 telemetry-dashboard.py [--days 30] [--format text|json|csv]

Reads from: ~/.kiro/telemetry/*.jsonl
"""

import json
import os
import sys
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path

KIRO_DIR = Path(os.environ.get("KIRO_HOME", Path.home() / ".kiro"))
TELEMETRY_DIR = KIRO_DIR / "telemetry"
DEFAULT_DAYS = 30


def load_sessions(days: int) -> list[dict]:
    """Load telemetry sessions from JSONL files within the time window."""
    cutoff = datetime.now() - timedelta(days=days)
    sessions = []

    if not TELEMETRY_DIR.exists():
        return sessions

    for jsonl_file in TELEMETRY_DIR.glob("*.jsonl"):
        with open(jsonl_file) as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                    ts = entry.get("timestamp", entry.get("started_at", ""))
                    if ts:
                        entry_time = datetime.fromisoformat(ts.replace("Z", "+00:00").replace("+00:00", ""))
                        if entry_time >= cutoff:
                            sessions.append(entry)
                    else:
                        sessions.append(entry)
                except (json.JSONDecodeError, ValueError):
                    continue

    return sessions


def aggregate(sessions: list[dict]) -> dict:
    """Compute aggregate metrics from session data."""
    agent_counter = Counter()
    duration_total = 0
    tool_calls_total = 0
    context_usage = []
    delegation_success = 0
    delegation_total = 0

    for s in sessions:
        agent = s.get("agent", "unknown")
        agent_counter[agent] += 1

        duration_total += s.get("duration_ms", 0)
        tool_calls_total += s.get("tool_calls", 0)

        ctx = s.get("context_usage_pct", 0)
        if ctx:
            context_usage.append(ctx)

        if s.get("delegation_attempted"):
            delegation_total += 1
            if s.get("delegation_success"):
                delegation_success += 1

    avg_duration = (duration_total / len(sessions) / 1000) if sessions else 0
    avg_context = (sum(context_usage) / len(context_usage)) if context_usage else 0
    delegation_rate = (delegation_success / delegation_total * 100) if delegation_total else 0

    return {
        "total_sessions": len(sessions),
        "top_agents": agent_counter.most_common(10),
        "avg_duration_sec": round(avg_duration, 1),
        "total_tool_calls": tool_calls_total,
        "avg_context_usage_pct": round(avg_context * 100, 1),
        "delegation_success_rate": round(delegation_rate, 1),
        "underused_agents": [a for a, c in agent_counter.items() if c < 5],
    }


def print_report(metrics: dict, days: int):
    """Print human-readable telemetry report."""
    print(f"📊 Agent Usage Report (last {days} days)")
    print("━" * 44)
    print(f"  Total sessions: {metrics['total_sessions']}")
    print(f"  Avg duration: {metrics['avg_duration_sec']}s")
    print(f"  Total tool calls: {metrics['total_tool_calls']}")
    print(f"  Avg context usage: {metrics['avg_context_usage_pct']}%")
    print(f"  Delegation success: {metrics['delegation_success_rate']}%")
    print()

    print("  Top agents:")
    for i, (agent, count) in enumerate(metrics["top_agents"], 1):
        bar = "█" * min(count // 10, 30)
        print(f"    {i:2}. {agent:<30} {count:>4} {bar}")
    print()

    underused = metrics["underused_agents"]
    if underused:
        print(f"  Underused agents ({len(underused)} with <5 sessions):")
        for agent in sorted(underused)[:10]:
            print(f"    - {agent}")
    print()


def main():
    days = DEFAULT_DAYS
    output_format = "text"

    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--days" and i + 1 < len(args):
            days = int(args[i + 1])
            i += 2
        elif args[i] == "--format" and i + 1 < len(args):
            output_format = args[i + 1]
            i += 2
        else:
            i += 1

    sessions = load_sessions(days)

    if not sessions:
        print(f"No telemetry data found in {TELEMETRY_DIR}")
        print("Sessions are recorded by the telemetry-emit hook after each agent run.")
        sys.exit(0)

    metrics = aggregate(sessions)

    if output_format == "json":
        # Convert Counter items to serializable format
        metrics["top_agents"] = [{"agent": a, "count": c} for a, c in metrics["top_agents"]]
        print(json.dumps(metrics, indent=2))
    elif output_format == "csv":
        print("agent,sessions")
        for agent, count in metrics["top_agents"]:
            print(f"{agent},{count}")
    else:
        print_report(metrics, days)


if __name__ == "__main__":
    main()
