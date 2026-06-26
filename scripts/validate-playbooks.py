#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# dependencies = ["pyyaml>=6.0"]
# ///
"""
validate-playbooks.py — Validates playbook YAML files against the schema.

Usage:
  uv run scripts/validate-playbooks.py
  # or via wrapper:
  ./scripts/run-script.sh validate-playbooks.py
"""

import json
import os
import sys

try:
    import yaml
except ImportError:
    print("❌ pyyaml not installed. Run: uv run scripts/validate-playbooks.py")
    sys.exit(1)

PLAYBOOKS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "shared", "playbooks")
SCHEMA_FILE = os.path.join(PLAYBOOKS_DIR, "playbook.schema.json")

REQUIRED_TOP_LEVEL = ["name", "version", "description", "steps"]
REQUIRED_STEP_FIELDS = ["name", "agent", "instruction"]
VALID_TRIGGERS = ["manual", "on_jira_status", "on_alert", "on_pr_create", "scheduled"]
VALID_GATES = ["auto", "user_approval", "pass_threshold", "condition"]
VALID_ON_FAILURE = ["stop", "skip", "retry", "fallback"]
VALID_INPUT_TYPES = ["string", "url", "jira_key", "branch", "enum", "number"]


def validate_playbook(filepath):
    """Validate a single playbook YAML file. Returns list of issues."""
    issues = []
    
    with open(filepath) as f:
        try:
            data = yaml.safe_load(f)
        except yaml.YAMLError as e:
            return [f"Invalid YAML: {e}"]
    
    if not isinstance(data, dict):
        return ["Root must be a mapping"]
    
    # Required top-level fields
    for field in REQUIRED_TOP_LEVEL:
        if field not in data:
            issues.append(f"missing required field: {field}")
    
    # Validate trigger
    trigger = data.get("trigger", "manual")
    if trigger not in VALID_TRIGGERS:
        issues.append(f"invalid trigger: '{trigger}' (valid: {VALID_TRIGGERS})")
    
    # Validate inputs
    inputs = data.get("inputs", {})
    if inputs:
        for input_name, input_def in inputs.items():
            if not isinstance(input_def, dict):
                issues.append(f"input '{input_name}' must be a mapping")
                continue
            itype = input_def.get("type")
            if itype and itype not in VALID_INPUT_TYPES:
                issues.append(f"input '{input_name}' has invalid type: '{itype}'")
            if itype == "enum" and not input_def.get("options"):
                issues.append(f"input '{input_name}' is enum but has no options")
    
    # Validate steps
    steps = data.get("steps", [])
    if not isinstance(steps, list):
        issues.append("'steps' must be a list")
        return issues
    
    if len(steps) == 0:
        issues.append("playbook has no steps")
    
    step_names = set()
    for i, step in enumerate(steps):
        prefix = f"step[{i}]"
        
        if not isinstance(step, dict):
            issues.append(f"{prefix}: must be a mapping")
            continue
        
        # Required step fields
        for field in REQUIRED_STEP_FIELDS:
            if field not in step:
                issues.append(f"{prefix}: missing '{field}'")
        
        # Duplicate step names
        name = step.get("name", "")
        if name in step_names:
            issues.append(f"{prefix}: duplicate step name '{name}'")
        step_names.add(name)
        
        # Validate gate
        gate = step.get("gate")
        if gate:
            gate_type = gate.get("type")
            if gate_type and gate_type not in VALID_GATES:
                issues.append(f"{prefix}: invalid gate type '{gate_type}'")
            if gate_type == "pass_threshold" and "threshold" not in gate:
                issues.append(f"{prefix}: pass_threshold gate requires 'threshold'")
        
        # Validate on_failure
        on_failure = step.get("on_failure")
        if on_failure and on_failure not in VALID_ON_FAILURE:
            issues.append(f"{prefix}: invalid on_failure '{on_failure}'")
        if on_failure == "fallback" and "fallback_agent" not in step:
            issues.append(f"{prefix}: on_failure=fallback requires 'fallback_agent'")
        
        # Validate inputs_from references
        inputs_from = step.get("inputs_from", "")
        if inputs_from:
            for ref in inputs_from.split(","):
                ref = ref.strip()
                if ref and ref not in step_names and ref != name:
                    # It might reference a step that comes before
                    pass  # Can't fully validate forward references
        
        # Validate timeout
        timeout = step.get("timeout_seconds")
        if timeout is not None and (not isinstance(timeout, (int, float)) or timeout <= 0):
            issues.append(f"{prefix}: timeout_seconds must be positive number")
    
    return issues


def main():
    if not os.path.isdir(PLAYBOOKS_DIR):
        print(f"❌ Playbooks directory not found: {PLAYBOOKS_DIR}")
        sys.exit(1)
    
    total = 0
    errors = 0
    
    for fname in sorted(os.listdir(PLAYBOOKS_DIR)):
        if not fname.endswith(".yaml"):
            continue
        
        total += 1
        fpath = os.path.join(PLAYBOOKS_DIR, fname)
        issues = validate_playbook(fpath)
        
        if issues:
            errors += 1
            print(f"  ❌ {fname}:")
            for issue in issues:
                print(f"     - {issue}")
        else:
            with open(fpath) as f:
                data = yaml.safe_load(f)
            steps = len(data.get("steps", []))
            trigger = data.get("trigger", "manual")
            print(f"  ✅ {fname}: {steps} steps, trigger={trigger}")
    
    print(f"\n📋 Playbook Validation: {total} playbooks, {errors} with errors")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
