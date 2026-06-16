#!/usr/bin/env python3
"""
steer-certify — Generates a trust score and certification report for a steer-runtime release.

Combines:
  - Delegation tests (tests/orchestration/) → 40% weight
  - Structural evals (evals/) → 30% weight
  - Quality evals (evals/) → 30% weight

Usage:
  ./certify.py                    # Run full certification
  ./certify.py --from-results     # Generate report from existing results (no re-run)
  ./certify.py --dry-run          # Preview without executing
"""

import argparse
import json
import os
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
STEER_ROOT = SCRIPT_DIR.parent
DELEGATION_DIR = STEER_ROOT / "tests" / "orchestration"
EVALS_DIR = STEER_ROOT / "evals"
RESULTS_DIR = SCRIPT_DIR / "results"

# Weights
W_DELEGATION = 0.40
W_STRUCTURAL = 0.30
W_QUALITY = 0.30

# Tiers
TIERS = [
    (90, "🟢", "Certified"),
    (70, "🟡", "Qualified"),
    (50, "🟠", "Conditional"),
    (0, "🔴", "Uncertified"),
]


@dataclass
class CertResult:
    delegation_total: int = 0
    delegation_passed: int = 0
    delegation_details: list = None
    structural_total: int = 0
    structural_passed: int = 0
    structural_details: list = None
    quality_scores: list = None
    quality_avg: float = 0.0
    trust_score: float = 0.0
    tier_badge: str = "🔴"
    tier_name: str = "Uncertified"

    def __post_init__(self):
        if self.delegation_details is None:
            self.delegation_details = []
        if self.structural_details is None:
            self.structural_details = []
        if self.quality_scores is None:
            self.quality_scores = []


def get_version():
    """Get current steer-runtime version."""
    try:
        out = subprocess.check_output(
            ["git", "describe", "--tags", "--always"],
            cwd=STEER_ROOT, stderr=subprocess.DEVNULL, text=True
        ).strip()
        return out
    except Exception:
        return "dev"


def run_delegation_tests(dry_run=False) -> dict:
    """Run delegation tests and return summary."""
    summary_file = DELEGATION_DIR / "results" / "summary.json"

    if not dry_run:
        # Clean previous
        summary_file.unlink(missing_ok=True)
        runner = DELEGATION_DIR / "runner.sh"
        subprocess.run([str(runner), "--all"], cwd=DELEGATION_DIR, capture_output=True)

    if summary_file.exists():
        return json.loads(summary_file.read_text())
    return {"total": 0, "passed": 0, "failed": 0, "results": []}


def run_evals(dry_run=False) -> list[dict]:
    """Run evals and return per-target results."""
    results = []
    results_dir = EVALS_DIR / "results"

    if not dry_run:
        subprocess.run(
            [sys.executable, str(EVALS_DIR / "runner.py"), "run-all"],
            cwd=EVALS_DIR, capture_output=True
        )

    # Read all result files
    if results_dir.exists():
        for f in results_dir.glob("*.json"):
            try:
                results.append(json.loads(f.read_text()))
            except json.JSONDecodeError:
                pass
    return results


def compute_certification(delegation: dict, evals: list[dict]) -> CertResult:
    """Compute trust score from test results."""
    cert = CertResult()

    # Delegation score
    cert.delegation_total = delegation.get("total", 0)
    cert.delegation_passed = delegation.get("passed", 0)
    cert.delegation_details = delegation.get("results", [])

    delegation_rate = (cert.delegation_passed / cert.delegation_total * 100) if cert.delegation_total > 0 else 0

    # Structural score (from evals)
    for ev in evals:
        for r in ev.get("results", []):
            cert.structural_total += 1
            if r.get("structural_pass", False):
                cert.structural_passed += 1
            cert.structural_details.append({
                "target": ev.get("target", "?"),
                "fixture": r.get("name", "?"),
                "passed": r.get("structural_pass", False),
            })

    structural_rate = (cert.structural_passed / cert.structural_total * 100) if cert.structural_total > 0 else 0

    # Quality score (placeholder — requires judge scoring, use structural as proxy for now)
    cert.quality_avg = structural_rate  # TODO: integrate LLM judge scores when available

    # Trust score
    cert.trust_score = (
        delegation_rate * W_DELEGATION +
        structural_rate * W_STRUCTURAL +
        cert.quality_avg * W_QUALITY
    )

    # Tier
    for threshold, badge, name in TIERS:
        if cert.trust_score >= threshold:
            cert.tier_badge = badge
            cert.tier_name = name
            break

    return cert


def generate_report(cert: CertResult, version: str) -> str:
    """Generate CERTIFICATION.md content."""
    lines = []
    lines.append(f"# Steer Runtime {version} — Certification Report\n")
    lines.append(f"{cert.tier_badge} **Trust Score: {cert.trust_score:.0f}/100** ({cert.tier_name})\n")
    lines.append(f"Generated: {time.strftime('%Y-%m-%dT%H:%M:%S')}\n")
    lines.append("---\n")

    # Delegation
    d_rate = (cert.delegation_passed / cert.delegation_total * 100) if cert.delegation_total > 0 else 0
    lines.append(f"## Delegation ({int(W_DELEGATION*100)}%) — {cert.delegation_passed}/{cert.delegation_total} passed ({d_rate:.0f}%)\n")
    if cert.delegation_details:
        lines.append("| Scenario | Status | Subagent Calls |")
        lines.append("|----------|--------|----------------|")
        for r in cert.delegation_details:
            status = "✓" if r.get("status") == "PASS" else "✗"
            calls = r.get("subagent_calls", 0)
            lines.append(f"| {r.get('name', '?')} | {status} | {calls} |")
        lines.append("")

    # Structural
    s_rate = (cert.structural_passed / cert.structural_total * 100) if cert.structural_total > 0 else 0
    lines.append(f"## Structural ({int(W_STRUCTURAL*100)}%) — {cert.structural_passed}/{cert.structural_total} passed ({s_rate:.0f}%)\n")
    if cert.structural_details:
        lines.append("| Target | Fixture | Status |")
        lines.append("|--------|---------|--------|")
        for d in cert.structural_details:
            status = "✓" if d["passed"] else "✗"
            lines.append(f"| {d['target']} | {d['fixture']} | {status} |")
        lines.append("")

    # Quality
    lines.append(f"## Quality ({int(W_QUALITY*100)}%) — avg {cert.quality_avg:.0f}/100\n")
    lines.append("*Note: Full LLM judge scoring not yet integrated. Using structural pass rate as proxy.*\n")

    # Tier explanation
    lines.append("---\n")
    lines.append("## Tier Definitions\n")
    lines.append("| Score | Badge | Meaning |")
    lines.append("|-------|-------|---------|")
    lines.append("| 90-100 | 🟢 | **Certified** — Production-ready |")
    lines.append("| 70-89 | 🟡 | **Qualified** — Minor gaps |")
    lines.append("| 50-69 | 🟠 | **Conditional** — Known issues |")
    lines.append("| <50 | 🔴 | **Uncertified** — Do not release |")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Generate steer-runtime certification report")
    parser.add_argument("--from-results", action="store_true", help="Use existing results (don't re-run tests)")
    parser.add_argument("--dry-run", action="store_true", help="Preview without executing tests")
    args = parser.parse_args()

    RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    version = get_version()
    print(f"\n🏅 Steer Certification — {version}")
    print("=" * 50)

    # Run or load delegation tests
    if args.dry_run:
        print("\n[DRY-RUN] Would run delegation tests (16 scenarios)")
        print("[DRY-RUN] Would run eval suite (3 evaluable targets)")
        delegation = {"total": 16, "passed": 0, "failed": 0, "results": []}
        evals = []
    elif args.from_results:
        print("\n📂 Loading existing results...")
        delegation = run_delegation_tests(dry_run=True)
        evals = run_evals(dry_run=True)
    else:
        print("\n🔄 Running delegation tests...")
        delegation = run_delegation_tests()
        print(f"   {delegation.get('passed', 0)}/{delegation.get('total', 0)} passed")

        print("\n🔄 Running eval suite...")
        evals = run_evals()
        print(f"   {len(evals)} target(s) evaluated")

    # Compute
    cert = compute_certification(delegation, evals)

    # Generate report
    report = generate_report(cert, version)
    report_file = RESULTS_DIR / "CERTIFICATION.md"
    report_file.write_text(report)

    # Also save JSON
    json_file = RESULTS_DIR / "certification.json"
    json_file.write_text(json.dumps({
        "version": version,
        "trust_score": round(cert.trust_score, 1),
        "tier": cert.tier_name,
        "delegation": {"passed": cert.delegation_passed, "total": cert.delegation_total},
        "structural": {"passed": cert.structural_passed, "total": cert.structural_total},
        "quality_avg": round(cert.quality_avg, 1),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
    }, indent=2))

    # Print summary
    print(f"\n{'=' * 50}")
    print(f"{cert.tier_badge} Trust Score: {cert.trust_score:.0f}/100 ({cert.tier_name})")
    print(f"   Delegation: {cert.delegation_passed}/{cert.delegation_total}")
    print(f"   Structural: {cert.structural_passed}/{cert.structural_total}")
    print(f"   Quality:    {cert.quality_avg:.0f}/100")
    print(f"\n📄 Report: {report_file}")
    print(f"📊 JSON:   {json_file}")

    # Exit code based on tier
    if cert.trust_score < 50:
        sys.exit(1)


if __name__ == "__main__":
    main()
