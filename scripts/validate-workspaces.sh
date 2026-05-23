#!/usr/bin/env python3
"""validate-workspaces.py — Validates all workspace.json files"""
import json, os, sys, glob

WORKSPACES_DIR = "workspaces"
strict = "--strict" in sys.argv
errors = warnings = total = 0
seen_names = {}

ws_files = sorted(glob.glob(f"{WORKSPACES_DIR}/**/workspace.json", recursive=True))

for ws_file in ws_files:
    total += 1
    rel = ws_file

    # Valid JSON?
    try:
        with open(ws_file) as f:
            data = json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"❌ {rel} — invalid JSON: {e}")
        errors += 1
        continue

    name = data.get("name", "")
    profiles = data.get("profiles", [])
    default_agent = data.get("default_agent", "")
    workspace_path = data.get("workspace_path", "")
    projects = data.get("projects") or []

    # Required: name
    if not name:
        print(f"❌ {rel} — missing 'name'")
        errors += 1

    # Duplicate name
    if name:
        if name in seen_names:
            print(f"⚠  {rel} — duplicate name '{name}' (also in {seen_names[name]})")
            warnings += 1
        seen_names[name] = rel

    # Required: profiles
    if not profiles:
        print(f"⚠  {rel} — no profiles defined")
        warnings += 1
    else:
        for p in profiles:
            if not os.path.isdir(f"profiles/{p}"):
                print(f"⚠  {rel} — profile '{p}' not found in profiles/")
                warnings += 1

    # Required: default_agent
    if not default_agent:
        print(f"⚠  {rel} — no default_agent")
        warnings += 1

    # workspace_path portability
    if workspace_path and (workspace_path.startswith("/Users/") or workspace_path.startswith("/home/") or workspace_path.startswith("C:\\")):
        print(f"⚠  {rel} — workspace_path '{workspace_path}' is hardcoded (use ${{WORKSPACE_ROOT}} or ~/)")
        warnings += 1

    # projects repo format
    for proj in projects:
        repo = proj.get("repo", "")
        if repo and "/" not in repo:
            print(f"⚠  {rel} — invalid repo format: '{repo}' (expected org/repo)")
            warnings += 1

    # Naming convention check
    EXEMPT = {"default", "sustainment"}
    if name and name not in EXEMPT:
        # Children of a team workspace (sub-scopes) are exempt
        parent_dir = os.path.basename(os.path.dirname(os.path.dirname(ws_file)))
        is_child = parent_dir not in ("workspaces", "sustainment")
        valid_pattern = (
            is_child or
            name.endswith("-team") or
            name.endswith("-vertical") or
            name.startswith("sustainment-") or
            name.startswith("app-") or
            name == "steer-platform"
        )
        if not valid_pattern:
            print(f"⚠  {rel} — name '{name}' doesn't follow naming convention (expected -team, -vertical, sustainment-*, or app-*)")
            warnings += 1

    # Directory = name check
    dir_name = os.path.basename(os.path.dirname(ws_file))
    if name and dir_name != name and dir_name != "sustainment":
        # Allow children under parent dirs (e.g., sustainment/sustainment-kaos)
        parent_dir = os.path.basename(os.path.dirname(os.path.dirname(ws_file)))
        if parent_dir == "workspaces" or parent_dir == "sustainment":
            if dir_name != name:
                print(f"⚠  {rel} — directory '{dir_name}' doesn't match name '{name}'")
                warnings += 1

print()
print(f"📋 Workspace Validation: {total} workspaces scanned")
print(f"   ✅ Valid: {total - errors}")
if errors: print(f"   ❌ Errors: {errors}")
if warnings: print(f"   ⚠  Warnings: {warnings}")

if strict and errors > 0:
    sys.exit(1)
