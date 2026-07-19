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
from concurrent.futures import ThreadPoolExecutor
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


def run_delegation_tests(dry_run=False, target="kiro", model="") -> dict:
    """Run all delegation tests (16 scenarios across 12 orchestrators)."""
    summary_file = DELEGATION_DIR / "results" / "summary.json"

    if not dry_run:
        summary_file.unlink(missing_ok=True)
        runner = DELEGATION_DIR / "delegation_runner.py"
        print("   → Running 16 delegation scenarios (may take several minutes)...")
        cmd = [sys.executable, str(runner), "--all"]
        if target != "kiro":
            cmd.extend(["--target", target])
        if model:
            cmd.extend(["--model", model])
        subprocess.run(cmd, cwd=DELEGATION_DIR)

    if summary_file.exists():
        return json.loads(summary_file.read_text())
    return {"total": 0, "passed": 0, "failed": 0, "results": []}


def run_evals(dry_run=False, target="kiro", model="") -> list[dict]:
    """Run structural + quality evals for all targets with rubrics."""
    results = []
    results_dir = EVALS_DIR / "results"

    if not dry_run:
        print("   → Running structural + quality eval suite...")
        cmd = [sys.executable, str(EVALS_DIR / "runner.py"), "run-all"]
        if target != "kiro":
            cmd.extend(["--target", target])
        if model:
            cmd.extend(["--model", model])
        subprocess.run(cmd, cwd=EVALS_DIR)

    # Read all result files
    if results_dir.exists():
        for f in results_dir.glob("*.json"):
            if f.name in ("certification.json",):
                continue
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
            failed_checks = [c["name"] for c in r.get("checks", []) if not c.get("passed", True)]
            cert.structural_details.append({
                "target": ev.get("target", "?"),
                "fixture": r.get("name", "?"),
                "passed": r.get("structural_pass", False),
                "failed_checks": failed_checks,
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


def generate_report(cert: CertResult, version: str, target_label: str = "") -> str:
    """Generate CERTIFICATION.md content."""
    lines = []
    lines.append(f"# Steer Runtime {version} — Certification Report\n")
    lines.append(f"{cert.tier_badge} **Trust Score: {cert.trust_score:.0f}/100** ({cert.tier_name})\n")
    if target_label:
        lines.append(f"**Target:** {target_label}\n")
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
        lines.append("| Target | Fixture | Status | Failed Checks |")
        lines.append("|--------|---------|--------|---------------|")
        for d in cert.structural_details:
            status = "✓" if d["passed"] else "✗"
            failed = ", ".join(d.get("failed_checks", [])) if not d["passed"] else ""
            lines.append(f"| {d['target']} | {d['fixture']} | {status} | {failed} |")
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


def load_matrix_config() -> list[dict]:
    """Load target+model matrix from config.yaml."""
    config_file = EVALS_DIR / "config.yaml"
    if not config_file.exists():
        return [{"target": "kiro", "model": ""}]

    import yaml
    config = yaml.safe_load(config_file.read_text())
    matrix = config.get("matrix", [])
    if not matrix:
        return [{"target": "kiro", "model": ""}]
    return matrix


def run_matrix_certification():
    """Run certification across all configured target+model combos and produce comparison."""
    matrix = load_matrix_config()
    version = get_version()

    print(f"\n🏅 Steer Matrix Certification — {version}")
    print(f"   Combos: {len(matrix)}")
    print("=" * 60)

    results = []

    for i, combo in enumerate(matrix, 1):
        target = combo.get("target", "kiro")
        model = combo.get("model", "")
        label = f"{target}/{model}" if model else target

        print(f"\n{'─' * 60}")
        print(f"  [{i}/{len(matrix)}] {label}")
        print(f"{'─' * 60}")

        # Run delegation + evals for this combo
        delegation = run_delegation_tests(target=target, model=model)
        evals = run_evals(target=target, model=model)
        cert = compute_certification(delegation, evals)

        results.append({
            "target": target,
            "model": model or "default",
            "label": label,
            "trust_score": round(cert.trust_score, 1),
            "tier": cert.tier_name,
            "tier_badge": cert.tier_badge,
            "delegation": f"{cert.delegation_passed}/{cert.delegation_total}",
            "structural": f"{cert.structural_passed}/{cert.structural_total}",
            "quality_avg": round(cert.quality_avg, 1),
        })

        # Save per-combo report
        combo_report = generate_report(cert, version, label)
        safe_label = label.replace("/", "-")
        (RESULTS_DIR / f"certification-{safe_label}.md").write_text(combo_report)

    # Print comparison table
    print(f"\n\n{'=' * 60}")
    print("  MATRIX COMPARISON")
    print(f"{'=' * 60}\n")
    print(f"{'Target':<30} {'Score':>6} {'Tier':<15} {'Delegation':>12} {'Structural':>12}")
    print(f"{'-'*30} {'-'*6} {'-'*15} {'-'*12} {'-'*12}")

    for r in sorted(results, key=lambda x: x["trust_score"], reverse=True):
        print(f"{r['label']:<30} {r['trust_score']:>5.0f}% {r['tier_badge']} {r['tier']:<12} {r['delegation']:>12} {r['structural']:>12}")

    # Save comparison JSON
    comparison_file = RESULTS_DIR / "matrix-comparison.json"
    comparison_file.write_text(json.dumps({
        "version": version,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "results": results,
    }, indent=2))

    # Save comparison markdown
    md_lines = [
        f"# Matrix Certification — {version}\n",
        f"Generated: {time.strftime('%Y-%m-%dT%H:%M:%S')}\n",
        "",
        "| Target | Score | Tier | Delegation | Structural | Quality |",
        "|--------|:-----:|------|:----------:|:----------:|:-------:|",
    ]
    for r in sorted(results, key=lambda x: x["trust_score"], reverse=True):
        md_lines.append(
            f"| {r['label']} | {r['trust_score']:.0f}% | {r['tier_badge']} {r['tier']} | "
            f"{r['delegation']} | {r['structural']} | {r['quality_avg']:.0f}% |"
        )
    md_lines.append("")
    (RESULTS_DIR / "MATRIX.md").write_text("\n".join(md_lines))

    print(f"\n📄 Comparison: {RESULTS_DIR / 'MATRIX.md'}")
    print(f"📊 JSON:       {comparison_file}")

    # Exit code: fail if ANY combo is uncertified
    worst = min(r["trust_score"] for r in results) if results else 0
    if worst < 50:
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Generate steer-runtime certification report")
    parser.add_argument("--from-results", action="store_true", help="Use existing results (don't re-run tests)")
    parser.add_argument("--dry-run", action="store_true", help="Preview without executing tests")
    parser.add_argument("--target", default="kiro", choices=["kiro", "geai", "cursor"],
                        help="Target runtime for evaluation (default: kiro)")
    parser.add_argument("--model", default="", help="Model to use (e.g., claude-sonnet-4, gpt-4o)")
    parser.add_argument("--matrix", action="store_true",
                        help="Run certification across all target+model combos defined in config.yaml")
    args = parser.parse_args()

    RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    # Matrix mode: run all configured combos
    if args.matrix:
        run_matrix_certification()
        return

    version = get_version()
    target_label = args.target
    if args.model:
        target_label += f"/{args.model}"

    print(f"\n🏅 Steer Certification — {version} (target: {target_label})")
    print("=" * 50)

    # Run or load delegation tests
    if args.dry_run:
        print("\n[DRY-RUN] Would run validate-all (agents, workspaces, playbooks, inheritance)")
        print("[DRY-RUN] Would run delegation tests (16 scenarios)")
        print("[DRY-RUN] Would run eval suite (3 evaluable targets)")
        delegation = {"total": 16, "passed": 0, "failed": 0, "results": []}
        evals = []
    elif args.from_results:
        print("\n📂 Loading existing results...")
        delegation = run_delegation_tests(dry_run=True)
        evals = run_evals(dry_run=True)
    else:
        print("\n🔄 Running structural validations (make validate-all)...")
        val_result = subprocess.run(["make", "validate-all"], cwd=STEER_ROOT)
        if val_result.returncode != 0:
            print("   ❌ Validation failed — fix errors before certifying")
            sys.exit(1)
        print("   ✅ All validations passed")

        print(f"\n🔄 Running delegation tests + eval suite (target={args.target}, model={args.model or 'default'})...")
        with ThreadPoolExecutor(max_workers=2) as pool:
            fut_delegation = pool.submit(run_delegation_tests, target=args.target, model=args.model)
            fut_evals = pool.submit(run_evals, target=args.target, model=args.model)
            delegation = fut_delegation.result()
            evals = fut_evals.result()

        print(f"   Delegation: {delegation.get('passed', 0)}/{delegation.get('total', 0)} passed")
        print(f"   Evals: {len(evals)} target(s) evaluated")

    # Compute
    cert = compute_certification(delegation, evals)

    # Generate report
    report = generate_report(cert, version, target_label)
    report_file = RESULTS_DIR / "CERTIFICATION.md"
    report_file.write_text(report)

    # Also save JSON
    json_file = RESULTS_DIR / "certification.json"
    json_file.write_text(json.dumps({
        "version": version,
        "target": args.target,
        "model": args.model or "default",
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
