"""Execution runner — runs agent sessions against test cases."""

from pathlib import Path
from typing import Optional
import yaml
import json


def run_evaluation(config_path: Path, test_path: Path, dimensions: Optional[tuple] = None) -> list[dict]:
    """Run all test cases and collect raw outputs.

    Args:
        config_path: Path to evaluation config YAML
        test_path: Directory containing test case subdirectories
        dimensions: Optional filter — only run cases for these dimensions

    Returns:
        List of result dicts: {case_id, category, prompt, expected, actual, duration_ms}
    """
    config = yaml.safe_load(config_path.read_text())
    timeout = config.get("evaluator", {}).get("timeout_seconds", 180)
    results = []

    for category_dir in sorted(test_path.iterdir()):
        if not category_dir.is_dir():
            continue

        category = category_dir.name

        # Filter by dimension if specified
        if dimensions and category not in dimensions:
            continue

        for case_file in sorted(category_dir.glob("*.json")):
            case = json.loads(case_file.read_text())
            case_id = case_file.stem

            result = _execute_case(case_id, category, case, timeout)
            results.append(result)

    return results


def _execute_case(case_id: str, category: str, case: dict, timeout: int) -> dict:
    """Execute a single test case against the agent.

    TODO: Implement actual agent session execution via ACP protocol.
    Currently returns a stub result for framework validation.
    """
    return {
        "case_id": case_id,
        "category": category,
        "prompt": case.get("prompt", ""),
        "expected_agent": case.get("expected_agent", ""),
        "expected_pattern": case.get("expected_pattern", ""),
        "actual": None,  # TODO: fill from agent session
        "duration_ms": 0,
        "status": "pending",
    }
