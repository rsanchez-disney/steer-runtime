#!/usr/bin/env python3
"""
steer-eval — Automated evaluation harness for steer-runtime prompts and skills.

Auto-discovers evaluable artifacts (agent prompts, skills) from the steer-runtime
tree and runs structural + quality evaluations via kiro-cli ACP.

Usage:
  ./runner.py --scan                    # List all discoverable prompts/skills
  ./runner.py --scan --profile sustainment  # Filter by profile
  ./runner.py --run orchestrator        # Evaluate a specific agent
  ./runner.py --run-all                 # Evaluate all with rubrics
  ./runner.py --run-skill shield-defect-report  # Evaluate a specific skill
  ./runner.py --dry-run                 # Show what would be evaluated
"""

import argparse
import json
import os
import re
import subprocess
import sys
import time
import yaml
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


# --- Configuration ---

SCRIPT_DIR = Path(__file__).parent
STEER_ROOT = SCRIPT_DIR.parent  # evals/ is at steer-runtime/evals/
RUBRICS_DIR = SCRIPT_DIR / "rubrics"
FIXTURES_DIR = SCRIPT_DIR / "fixtures"
RESULTS_DIR = SCRIPT_DIR / "results"
CONFIG_FILE = SCRIPT_DIR / "config.yaml"
JUDGE_PROMPT = SCRIPT_DIR / "judge.md"

KIRO_CLI = os.environ.get("KIRO_CLI", os.path.expanduser("~/.local/bin/kiro-cli"))
KODA_CLI = os.environ.get("KODA_CLI", "koda")

# Runtime target configuration (set by argparse)
EVAL_TARGET = "kiro"
EVAL_MODEL = ""


@dataclass
class DiscoveredPrompt:
    """A prompt or skill discovered in the steer-runtime tree."""
    type: str  # "agent" | "skill"
    name: str
    path: Path
    profile: str = ""
    workspace: str = ""
    has_rubric: bool = False
    has_fixture: bool = False


@dataclass
class EvalResult:
    name: str
    type: str
    structural_pass: bool = True
    structural_checks: list = field(default_factory=list)
    quality_scores: dict = field(default_factory=dict)
    quality_avg: float = 0.0
    error: str = ""
    duration_seconds: float = 0.0


# --- Discovery ---

def discover_agents(steer_root: Path) -> list[DiscoveredPrompt]:
    """Scan profiles/*/prompts/*.md for agent prompts."""
    results = []
    profiles_dir = steer_root / "profiles"
    if not profiles_dir.exists():
        return results

    for profile_dir in sorted(profiles_dir.iterdir()):
        if not profile_dir.is_dir():
            continue
        prompts_dir = profile_dir / "prompts"
        if not prompts_dir.exists():
            continue
        for prompt_file in sorted(prompts_dir.glob("*.md")):
            name = prompt_file.stem
            has_rubric = (RUBRICS_DIR / f"{name}.yaml").exists()
            has_fixture = (FIXTURES_DIR / name).is_dir()
            results.append(DiscoveredPrompt(
                type="agent",
                name=name,
                path=prompt_file,
                profile=profile_dir.name,
                has_rubric=has_rubric,
                has_fixture=has_fixture,
            ))
    return results


def discover_skills(steer_root: Path) -> list[DiscoveredPrompt]:
    """Scan workspaces/*/skills/ and common/skills/ for skill files."""
    results = []

    # Common skills
    common_skills = steer_root / "common" / "skills"
    if common_skills.exists():
        for f in sorted(common_skills.iterdir()):
            skill = _parse_skill_entry(f, workspace="common")
            if skill:
                results.append(skill)

    # Profile skills
    for profile_dir in sorted((steer_root / "profiles").iterdir()):
        skills_dir = profile_dir / "skills"
        if not skills_dir.exists():
            continue
        for f in sorted(skills_dir.iterdir()):
            skill = _parse_skill_entry(f, profile=profile_dir.name)
            if skill:
                results.append(skill)

    # Workspace skills
    workspaces_dir = steer_root / "workspaces"
    if workspaces_dir.exists():
        for ws_dir in sorted(workspaces_dir.iterdir()):
            if not ws_dir.is_dir():
                continue
            skills_dir = ws_dir / "skills"
            if not skills_dir.exists():
                continue
            for f in sorted(skills_dir.iterdir()):
                skill = _parse_skill_entry(f, workspace=ws_dir.name)
                if skill:
                    results.append(skill)
    return results


def _parse_skill_entry(path: Path, profile="", workspace="") -> Optional[DiscoveredPrompt]:
    """Parse a skill entry (flat .md or directory with SKILL.md)."""
    if path.name == "README.md" or path.name.startswith("."):
        return None

    if path.is_dir():
        skill_file = path / "SKILL.md"
        if not skill_file.exists():
            return None
        name = path.name
        actual_path = skill_file
    elif path.suffix == ".md":
        name = path.stem
        actual_path = path
    else:
        return None

    has_rubric = (RUBRICS_DIR / "skills" / f"{name}.yaml").exists()
    has_fixture = (FIXTURES_DIR / "skills" / name).is_dir()

    return DiscoveredPrompt(
        type="skill",
        name=name,
        path=actual_path,
        profile=profile,
        workspace=workspace,
        has_rubric=has_rubric,
        has_fixture=has_fixture,
    )


def discover_all(steer_root: Path) -> list[DiscoveredPrompt]:
    """Discover all evaluable prompts and skills."""
    return discover_agents(steer_root) + discover_skills(steer_root)


# --- Structural Evaluation ---

def run_structural_checks(output: str, rubric: dict) -> list[dict]:
    """Run regex-based structural checks against agent/skill output."""
    results = []
    for check in rubric.get("structural_checks", []):
        name = check["name"]
        pattern = check["pattern"]
        required = check.get("required", True)
        expect_absent = check.get("expect", "present") == "absent"

        found = bool(re.search(pattern, output))

        if expect_absent:
            passed = not found
        else:
            passed = found

        if not required:
            passed = True  # optional checks don't fail

        results.append({
            "name": name,
            "passed": passed,
            "required": required,
            "found": found,
            "expect_absent": expect_absent,
        })
    return results


# --- ACP Interaction ---

def eval_with_acp(agent: str, prompt: str, timeout: int = 120) -> tuple[str, float]:
    """Send a prompt to an agent via ACP and capture the full text response."""
    import tempfile

    start = time.time()
    output_lines = []

    # Build ACP command based on target
    if EVAL_TARGET == "geai":
        cmd = [KODA_CLI, "chat", "--target", "geai", "--agent", agent, "--trust-all"]
        if EVAL_MODEL:
            cmd.extend(["--model", EVAL_MODEL])
    else:
        cmd = [KIRO_CLI, "acp", "--agent", agent, "--trust-all-tools"]
        if EVAL_MODEL:
            cmd.extend(["--model", EVAL_MODEL])

    # Build the ACP session using subprocess with stdin/stdout pipes
    proc = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True,
    )

    def send(msg):
        proc.stdin.write(json.dumps(msg) + "\n")
        proc.stdin.flush()

    # Initialize
    send({"jsonrpc": "2.0", "id": "1", "method": "initialize", "params": {
        "protocolVersion": "2024-11-05",
        "capabilities": {},
        "clientInfo": {"name": "steer-eval", "version": "0.1.0"},
    }})

    time.sleep(2)

    # Read available output to find session ID
    import select
    session_id = None
    deadline = time.time() + 15

    while time.time() < deadline:
        if select.select([proc.stdout], [], [], 0.5)[0]:
            line = proc.stdout.readline()
            if not line:
                break
            output_lines.append(line)
            m = re.search(r'"sessionId":"([^"]+)"', line)
            if m:
                session_id = m.group(1)
                break

    if not session_id:
        # Try session/new
        send({"jsonrpc": "2.0", "id": "2", "method": "session/new", "params": {
            "cwd": os.path.expanduser("~"), "mcpServers": [],
        }})
        deadline = time.time() + 10
        while time.time() < deadline:
            if select.select([proc.stdout], [], [], 0.5)[0]:
                line = proc.stdout.readline()
                if not line:
                    break
                output_lines.append(line)
                m = re.search(r'"sessionId":"([^"]+)"', line)
                if m:
                    session_id = m.group(1)
                    break

    if not session_id:
        proc.terminate()
        return "[ERROR: no session ID]", time.time() - start

    # Send prompt
    send({"jsonrpc": "2.0", "id": "3", "method": "session/prompt", "params": {
        "sessionId": session_id,
        "prompt": [{"type": "text", "text": prompt}],
    }})

    # Collect response until timeout or completion
    deadline = time.time() + timeout
    text_content = []

    while time.time() < deadline:
        if select.select([proc.stdout], [], [], 1.0)[0]:
            line = proc.stdout.readline()
            if not line:
                break
            output_lines.append(line)

            # Extract text content from streaming
            try:
                msg = json.loads(line)
                # Text chunks from notifications
                if "params" in msg:
                    params = msg.get("params", {})
                    if "text" in params:
                        text_content.append(params["text"])
                    elif "content" in params:
                        for c in (params["content"] if isinstance(params["content"], list) else []):
                            if isinstance(c, dict) and c.get("type") == "text":
                                text_content.append(c.get("text", ""))
                # Final result
                if msg.get("id") == "3" and "result" in msg:
                    result = msg["result"]
                    if isinstance(result, dict) and "content" in result:
                        for c in result["content"]:
                            if isinstance(c, dict) and c.get("type") == "text":
                                text_content.append(c.get("text", ""))
                    break
            except json.JSONDecodeError:
                pass

    proc.stdin.close()
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        proc.kill()

    full_output = "".join(text_content) if text_content else "\n".join(output_lines)
    duration = time.time() - start
    return full_output, duration


# --- Main ---

def cmd_scan(args):
    """List all discoverable prompts/skills."""
    all_items = discover_all(STEER_ROOT)

    if args.profile:
        all_items = [i for i in all_items if i.profile == args.profile]
    if args.workspace:
        all_items = [i for i in all_items if i.workspace == args.workspace]
    if args.type:
        all_items = [i for i in all_items if i.type == args.type]

    # Group by type
    agents = [i for i in all_items if i.type == "agent"]
    skills = [i for i in all_items if i.type == "skill"]

    evaluable = [i for i in all_items if i.has_rubric]

    print(f"\n📊 Discovery Report")
    print(f"{'─' * 50}")
    print(f"  Agents:    {len(agents)}")
    print(f"  Skills:    {len(skills)}")
    print(f"  Total:     {len(all_items)}")
    print(f"  Evaluable: {len(evaluable)} (have rubrics)")
    print()

    if args.verbose:
        print(f"{'Type':<8} {'Name':<35} {'Profile/WS':<20} {'Rubric':<7} {'Fixture'}")
        print(f"{'─' * 90}")
        for item in all_items:
            loc = item.profile or item.workspace or "-"
            rubric = "✓" if item.has_rubric else "·"
            fixture = "✓" if item.has_fixture else "·"
            print(f"{item.type:<8} {item.name:<35} {loc:<20} {rubric:<7} {fixture}")
    else:
        if evaluable:
            print("Evaluable (have rubrics):")
            for item in evaluable:
                print(f"  {item.type:<8} {item.name}")
        print(f"\nTo add evaluation for an agent/skill, create:")
        print(f"  evals/rubrics/{{name}}.yaml       (for agents)")
        print(f"  evals/rubrics/skills/{{name}}.yaml (for skills)")


def cmd_run(args):
    """Run evaluation for a specific agent or skill."""
    RESULTS_DIR.mkdir(exist_ok=True)

    target = args.target
    rubric_path = RUBRICS_DIR / f"{target}.yaml"
    skill_rubric_path = RUBRICS_DIR / "skills" / f"{target}.yaml"

    if rubric_path.exists():
        rubric = yaml.safe_load(rubric_path.read_text())
        eval_type = "agent"
    elif skill_rubric_path.exists():
        rubric = yaml.safe_load(skill_rubric_path.read_text())
        eval_type = "skill"
    else:
        print(f"❌ No rubric found for '{target}'")
        print(f"   Create: {rubric_path} or {skill_rubric_path}")
        sys.exit(1)

    agent = rubric.get("agent", target)
    fixtures_path = FIXTURES_DIR / target if eval_type == "agent" else FIXTURES_DIR / "skills" / target

    if not fixtures_path.exists() or not list(fixtures_path.glob("*.md")):
        print(f"❌ No fixtures found at {fixtures_path}/")
        sys.exit(1)

    print(f"\n🧪 Evaluating: {target} (type={eval_type})")
    print(f"{'─' * 50}")

    results = []
    for fixture_file in sorted(fixtures_path.glob("*.md")):
        fixture_content = fixture_file.read_text()

        # Extract frontmatter
        fm_match = re.match(r"^---\n(.+?)\n---\n(.+)", fixture_content, re.DOTALL)
        if fm_match:
            fm = yaml.safe_load(fm_match.group(1))
            prompt = fm_match.group(2).strip()
        else:
            fm = {}
            prompt = fixture_content.strip()

        fixture_name = fm.get("name", fixture_file.stem)
        timeout = fm.get("timeout", 120)

        print(f"\n  📋 Fixture: {fixture_name}")

        if args.dry_run:
            print(f"     Would send to agent={agent}: \"{prompt[:80]}...\"")
            continue

        # Run via ACP
        output, duration = eval_with_acp(agent, prompt, timeout)

        # Structural checks
        checks = run_structural_checks(output, rubric)
        structural_pass = all(c["passed"] for c in checks if c.get("required", True))

        for c in checks:
            status = "✓" if c["passed"] else "✗"
            print(f"     {status} {c['name']}")

        result = EvalResult(
            name=fixture_name,
            type=eval_type,
            structural_pass=structural_pass,
            structural_checks=checks,
            duration_seconds=duration,
        )
        results.append(result)

        print(f"     ⏱  {duration:.1f}s | structural: {'PASS' if structural_pass else 'FAIL'}")

    # Save results
    if not args.dry_run and results:
        report = {
            "target": target,
            "type": eval_type,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "results": [
                {
                    "name": r.name,
                    "structural_pass": r.structural_pass,
                    "checks": r.structural_checks,
                    "duration": r.duration_seconds,
                }
                for r in results
            ],
            "summary": {
                "total": len(results),
                "passed": sum(1 for r in results if r.structural_pass),
                "failed": sum(1 for r in results if not r.structural_pass),
            },
        }
        report_file = RESULTS_DIR / f"{target}.json"
        report_file.write_text(json.dumps(report, indent=2))
        print(f"\n  📄 Report: {report_file}")

    # Final summary
    if results:
        passed = sum(1 for r in results if r.structural_pass)
        total = len(results)
        print(f"\n{'─' * 50}")
        print(f"  Result: {passed}/{total} passed")


def cmd_run_all(args):
    """Run all evaluable targets (those with rubrics + fixtures)."""
    all_items = discover_all(STEER_ROOT)
    evaluable = [i for i in all_items if i.has_rubric and i.has_fixture]

    if not evaluable:
        print("❌ No evaluable targets found (need both rubric + fixture)")
        sys.exit(1)

    workers = int(os.environ.get("CERT_WORKERS", "4"))
    print(f"\n🧪 Running {len(evaluable)} evaluations (workers={workers})")

    def run_one(item):
        """Run a single eval target. Thread-safe (each spawns own subprocess)."""
        import copy
        a = copy.copy(args)
        a.target = item.name
        cmd_run(a)

    with ThreadPoolExecutor(max_workers=workers) as pool:
        list(pool.map(run_one, evaluable))


def main():
    parser = argparse.ArgumentParser(description="steer-eval: evaluate agent prompts and skills")
    parser.add_argument("--target", default="kiro", choices=["kiro", "geai", "cursor"],
                        help="Target runtime for evaluation (default: kiro)")
    parser.add_argument("--model", default="", help="Model to use (e.g., claude-sonnet-4)")
    sub = parser.add_subparsers(dest="command")

    # scan
    scan_p = sub.add_parser("scan", help="Discover evaluable prompts/skills")
    scan_p.add_argument("--profile", help="Filter by profile name")
    scan_p.add_argument("--workspace", help="Filter by workspace name")
    scan_p.add_argument("--type", choices=["agent", "skill"], help="Filter by type")
    scan_p.add_argument("-v", "--verbose", action="store_true", help="Show all items")

    # run
    run_p = sub.add_parser("run", help="Evaluate a specific agent or skill")
    run_p.add_argument("target", help="Agent or skill name")
    run_p.add_argument("--dry-run", action="store_true", help="Preview without executing")

    # run-all
    all_p = sub.add_parser("run-all", help="Evaluate all targets with rubrics")
    all_p.add_argument("--dry-run", action="store_true", help="Preview without executing")

    args = parser.parse_args()

    # Set global target/model
    global EVAL_TARGET, EVAL_MODEL
    EVAL_TARGET = args.target
    EVAL_MODEL = args.model

    if args.command == "scan":
        cmd_scan(args)
    elif args.command == "run":
        cmd_run(args)
    elif args.command == "run-all":
        cmd_run_all(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
