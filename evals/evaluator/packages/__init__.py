"""Forge Evaluator — CLI entry point."""

import click
from pathlib import Path

from .execution.runner import run_evaluation
from .scoring.scorer import score_results
from .reporting.reporter import generate_report


@click.group()
def main():
    """Forge Agent Evaluator — delegation, quality, and compliance scoring."""
    pass


@main.command()
@click.option("--config", "-c", default="config/default.yaml", help="Config file path")
@click.option("--test-dir", "-t", default="test_cases", help="Test cases directory")
@click.option("--output", "-o", default="../../evals/results", help="Output directory")
@click.option("--dimension", "-d", multiple=True, help="Score specific dimensions only")
def run(config: str, test_dir: str, output: str, dimension: tuple):
    """Run evaluation suite."""
    config_path = Path(__file__).parent.parent / config
    test_path = Path(__file__).parent.parent / test_dir
    output_path = Path(output)

    click.echo(f"📊 Running evaluation (config: {config_path.name})")
    click.echo(f"   Test cases: {test_path}")
    click.echo(f"   Output: {output_path}")
    click.echo()

    results = run_evaluation(config_path, test_path, dimensions=dimension or None)
    scores = score_results(results, config_path)
    report_path = generate_report(scores, output_path)

    click.echo(f"\n✅ Report: {report_path}")


@main.command()
@click.option("--config", "-c", default="config/default.yaml", help="Config file path")
def list_cases(config: str):
    """List available test cases."""
    test_path = Path(__file__).parent.parent / "test_cases"
    for category in sorted(test_path.iterdir()):
        if category.is_dir():
            cases = list(category.glob("*.json")) + list(category.glob("*.yaml"))
            click.echo(f"  {category.name}/ ({len(cases)} cases)")
            for case in sorted(cases):
                click.echo(f"    - {case.stem}")


if __name__ == "__main__":
    main()
