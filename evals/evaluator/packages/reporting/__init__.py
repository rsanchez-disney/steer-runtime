"""Reporting module — generates evaluation reports."""

from pathlib import Path
from datetime import datetime


def generate_report(scores: dict, output_dir: Path) -> Path:
    """Generate a markdown evaluation report.

    Args:
        scores: Scoring summary from scorer
        output_dir: Directory to write report

    Returns:
        Path to generated report file
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M")
    report_path = output_dir / f"eval-report-{timestamp}.md"

    verdict = "✅ PASS" if scores["pass"] else "❌ FAIL"

    lines = [
        f"# Evaluation Report — {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "",
        f"**Verdict:** {verdict} (composite: {scores['composite']}/100, threshold: {scores['threshold']})",
        f"**Total cases:** {scores['total_cases']}",
        "",
        "## Dimensions",
        "",
        "| Dimension | Score | Status | Cases |",
        "|-----------|:-----:|:------:|:-----:|",
    ]

    for dim, data in scores.get("dimensions", {}).items():
        status = "✅" if data["passed"] else "❌"
        lines.append(f"| {dim} | {data['score']:.0f} | {status} | {data['count']} |")

    lines.extend([
        "",
        "## Summary",
        "",
        f"- Composite score: **{scores['composite']}**/100",
        f"- Pass threshold: {scores['threshold']}",
        f"- Generated: {datetime.now().isoformat()}",
    ])

    report_path.write_text("\n".join(lines) + "\n")
    return report_path
