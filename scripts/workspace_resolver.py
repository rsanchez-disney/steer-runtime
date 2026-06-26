#!/usr/bin/env python3
"""
workspace_resolver.py — Resolves workspace inheritance.

When a workspace.json declares "extends": "<parent-name>", this module
resolves the full configuration by merging parent + child according to
merge rules.

Usage:
  python3 workspace_resolver.py <workspace-name>
  python3 workspace_resolver.py --validate-all

Can also be imported as a library:
  from workspace_resolver import resolve_workspace
"""

import json
import os
import sys
import glob
from copy import deepcopy

WORKSPACES_DIR = os.environ.get("STEER_WORKSPACES", "workspaces")
MAX_DEPTH = 2


def find_workspace(name):
    """Find workspace.json by workspace name."""
    for ws_file in glob.glob(f"{WORKSPACES_DIR}/**/workspace.json", recursive=True):
        try:
            with open(ws_file) as f:
                data = json.load(f)
            if data.get("name") == name:
                return ws_file, data
        except (json.JSONDecodeError, IOError):
            continue
    return None, None


def merge_arrays(parent_arr, child_arr):
    """
    Merge arrays with prefix operators:
      "+item" → add to parent list
      "-item" → remove from parent list
      "item" (no prefix, any item) → replace entire parent list
    """
    if not child_arr:
        return parent_arr or []
    if not parent_arr:
        # Strip prefixes from child
        return [item.lstrip("+-") for item in child_arr]

    # Check if child uses prefix operators
    has_operators = any(item.startswith("+") or item.startswith("-") for item in child_arr)

    if not has_operators:
        # No operators = full replacement
        return list(child_arr)

    # Additive merge with operators
    result = list(parent_arr)
    for item in child_arr:
        if item.startswith("+"):
            clean = item[1:]
            if clean not in result:
                result.append(clean)
        elif item.startswith("-"):
            clean = item[1:]
            result = [r for r in result if r != clean]
        else:
            # No prefix in a mixed list = add
            if item not in result:
                result.append(item)
    return result


def merge_projects(parent_projects, child_projects):
    """
    Merge projects: child projects appended, same-name overrides parent.
    """
    if not child_projects:
        return parent_projects or []
    if not parent_projects:
        return list(child_projects)

    result = {p["name"]: p for p in parent_projects}
    for proj in child_projects:
        result[proj["name"]] = proj  # Override or add
    return list(result.values())


def resolve_workspace(name, depth=0):
    """
    Resolve a workspace with inheritance.
    Returns the fully merged workspace dict.
    """
    if depth > MAX_DEPTH:
        raise ValueError(f"Inheritance depth exceeded ({MAX_DEPTH}) for '{name}' — circular?")

    ws_file, data = find_workspace(name)
    if data is None:
        raise FileNotFoundError(f"Workspace '{name}' not found in {WORKSPACES_DIR}/")

    extends = data.get("extends")
    if not extends:
        return data  # No inheritance, return as-is

    # Resolve parent recursively
    parent = resolve_workspace(extends, depth + 1)
    parent = deepcopy(parent)

    # Merge strategy
    resolved = {}

    # Scalar fields: child wins if set
    scalar_fields = ["name", "description", "team", "default_agent",
                     "jira_prefix", "jira_host", "enable_tools", "workspace_path"]
    for field in scalar_fields:
        if field in data:
            resolved[field] = data[field]
        elif field in parent:
            resolved[field] = parent[field]

    # Array fields: additive merge
    array_fields = ["profiles", "rules", "services", "channels", "managed_studios"]
    for field in array_fields:
        resolved[field] = merge_arrays(
            parent.get(field, []),
            data.get(field, [])
        )

    # Projects: merge by name
    resolved["projects"] = merge_projects(
        parent.get("projects", []),
        data.get("projects", [])
    )

    # Pass-through fields (no merge logic, child wins)
    passthrough = ["teams", "mcp", "agent_overrides"]
    for field in passthrough:
        if field in data:
            resolved[field] = data[field]
        elif field in parent:
            resolved[field] = parent[field]

    # Mark as resolved
    resolved["_resolved_from"] = [extends, name]

    return resolved


def validate_inheritance(name):
    """Validate a workspace's inheritance chain."""
    issues = []
    try:
        resolved = resolve_workspace(name)
        # Check resolved has minimum required fields
        if not resolved.get("profiles"):
            issues.append("resolved workspace has no profiles")
        if not resolved.get("name"):
            issues.append("resolved workspace has no name")
    except FileNotFoundError as e:
        issues.append(str(e))
    except ValueError as e:
        issues.append(str(e))
    return issues, resolved if not issues else None


def main():
    if len(sys.argv) < 2:
        print("Usage: workspace_resolver.py <workspace-name>")
        print("       workspace_resolver.py --validate-all")
        sys.exit(1)

    if sys.argv[1] == "--validate-all":
        total = errors = 0
        for ws_file in sorted(glob.glob(f"{WORKSPACES_DIR}/**/workspace.json", recursive=True)):
            with open(ws_file) as f:
                data = json.load(f)
            name = data.get("name", "")
            if not name or "extends" not in data:
                continue
            total += 1
            issues, _ = validate_inheritance(name)
            if issues:
                print(f"  ❌ {name}: {issues}")
                errors += 1
            else:
                print(f"  ✅ {name}: inheritance resolves cleanly")
        print(f"\n📋 Inheritance: {total} workspaces with extends, {errors} errors")
        sys.exit(1 if errors else 0)
    else:
        name = sys.argv[1]
        try:
            resolved = resolve_workspace(name)
            print(json.dumps(resolved, indent=2))
        except (FileNotFoundError, ValueError) as e:
            print(f"❌ {e}", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()
