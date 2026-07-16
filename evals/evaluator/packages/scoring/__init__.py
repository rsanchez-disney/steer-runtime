"""Scoring module — evaluates results against criteria."""

from pathlib import Path
from typing import Optional
import yaml


def score_results(results: list[dict], config_path: Path) -> dict:
    """Score evaluation results across configured dimensions.

    Args:
        results: Raw results from execution runner
        config_path: Path to config with scoring weights and thresholds

    Returns:
        Scoring summary: {dimensions: {name: {score, passed, details}}, composite, pass}
    """
    config = yaml.safe_load(config_path.read_text())
    scoring_config = config.get("scoring", {})
    weights = scoring_config.get("weights", {})
    threshold = scoring_config.get("pass_threshold", 70)

    dimension_scores = {}
    for dimension in scoring_config.get("dimensions", []):
        dimension_results = [r for r in results if r["category"] == dimension]
        score = _score_dimension(dimension, dimension_results)
        dimension_scores[dimension] = {
            "score": score,
            "passed": score >= threshold,
            "count": len(dimension_results),
        }

    # Composite score (weighted average)
    composite = 0.0
    total_weight = 0.0
    for dim, data in dimension_scores.items():
        weight = weights.get(dim, 0.1)
        composite += data["score"] * weight
        total_weight += weight

    if total_weight > 0:
        composite = composite / total_weight

    return {
        "dimensions": dimension_scores,
        "composite": round(composite, 1),
        "pass": composite >= threshold,
        "threshold": threshold,
        "total_cases": len(results),
    }


def _score_dimension(dimension: str, results: list[dict]) -> float:
    """Score a single dimension based on its results.

    TODO: Implement dimension-specific scoring logic.
    - delegation_accuracy: exact match on expected_agent
    - phase_compliance: check SDLC phases in output
    - output_quality: LLM-as-judge scoring
    """
    if not results:
        return 0.0

    passed = sum(1 for r in results if r.get("status") == "pass")
    return (passed / len(results)) * 100 if results else 0.0
