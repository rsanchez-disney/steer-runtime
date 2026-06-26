#!/usr/bin/env python3
"""
Orchestrator Delegation Test Runner (Python)

Replaces runner.sh with reliable JSON handling and proper ACP interaction.
Tests that orchestrators delegate via the subagent tool instead of executing directly.

Usage:
  ./delegation_runner.py --all
  ./delegation_runner.py --all --dry-run
  ./delegation_runner.py scenarios/orchestrator/01-analyze-story.json
"""

import argparse
import json
import os
import re
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
SCENARIOS_DIR = SCRIPT_DIR / "scenarios"
RESULTS_DIR = SCRIPT_DIR / "results"
KIRO_CLI = os.environ.get("KIRO_CLI", os.path.expanduser("~/.local/bin/kiro-cli"))

# Colors
GREEN = "\033[0;32m"
RED = "\033[0;31m"
YELLOW = "\033[0;33m"
CYAN = "\033[0;36m"
NC = "\033[0m"


def log(msg): print(f"{CYAN}[runner]{NC} {msg}")
def pass_msg(msg): print(f"  {GREEN}✓{NC} {msg}")
def fail_msg(msg): print(f"  {RED}✗{NC} {msg}")
def warn_msg(msg): print(f"  {YELLOW}⚠{NC} {msg}")


def run_scenario(scenario_path: Path, dry_run=False) -> dict:
    """Run a single scenario and return result."""
    scenario = json.loads(scenario_path.read_text())
    name = scenario["name"]
    agent = scenario["agent"]
    prompt = scenario["prompt"]
    timeout = scenario.get("timeout_seconds", 60)
    expect = scenario["expect"]

    log(f"Running: {name} (agent={agent}, timeout={timeout}s)")

    if dry_run:
        warn_msg(f"DRY-RUN — would send: \"{prompt[:80]}...\" to agent={agent}")
        return {"name": name, "status": "SKIP", "subagent_calls": 0, "reason": "dry-run"}

    # Spawn kiro-cli ACP
    proc = subprocess.Popen(
        [KIRO_CLI, "acp", "--agent", agent, "--trust-all-tools"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True,
    )

    output_lines = []

    def send(msg):
        proc.stdin.write(json.dumps(msg) + "\n")
        proc.stdin.flush()

    def read_until(predicate, max_wait=15):
        """Read lines until predicate matches or timeout."""
        deadline = time.time() + max_wait
        import select
        while time.time() < deadline:
            if select.select([proc.stdout], [], [], 0.5)[0]:
                line = proc.stdout.readline()
                if not line:
                    break
                output_lines.append(line.strip())
                if predicate(line):
                    return line
        return None

    try:
        # Initialize
        send({"jsonrpc": "2.0", "id": "1", "method": "initialize", "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {"name": "delegation-test", "version": "0.1.0"},
        }})

        # Wait for init response
        read_until(lambda l: '"id":"1"' in l and '"result"' in l, max_wait=10)

        # Create session
        send({"jsonrpc": "2.0", "id": "2", "method": "session/new", "params": {
            "cwd": os.path.expanduser("~"), "mcpServers": [],
        }})

        # Wait for session ID
        session_id = None
        line = read_until(lambda l: '"sessionId"' in l, max_wait=15)
        if line:
            m = re.search(r'"sessionId":"([^"]+)"', line)
            if m:
                session_id = m.group(1)

        if not session_id:
            fail_msg("Could not get session ID")
            return {"name": name, "status": "ERROR", "subagent_calls": 0, "reason": "no session ID"}

        # Drain any remaining notifications (commands/available etc)
        time.sleep(2)
        import select
        while select.select([proc.stdout], [], [], 0.1)[0]:
            line = proc.stdout.readline()
            if line:
                output_lines.append(line.strip())

        # Send prompt
        send({"jsonrpc": "2.0", "id": "3", "method": "session/prompt", "params": {
            "sessionId": session_id,
            "prompt": [{"type": "text", "text": prompt}],
        }})

        # Wait for response — look for id:3 result or tool use notifications
        deadline = time.time() + timeout
        import select
        while time.time() < deadline:
            if select.select([proc.stdout], [], [], 1.0)[0]:
                line = proc.stdout.readline()
                if not line:
                    break
                output_lines.append(line.strip())
                # Check if final response received
                if '"id":"3"' in line and '"result"' in line:
                    break
            # Also check if process died
            if proc.poll() is not None:
                break

    finally:
        proc.stdin.close()
        try:
            proc.terminate()
            proc.wait(timeout=5)
        except Exception:
            proc.kill()

    # Save raw output
    output_file = RESULTS_DIR / f"{name}.jsonl"
    output_file.write_text("\n".join(output_lines))

    # Analyze
    return analyze(name, output_lines, expect)


def analyze(name: str, output_lines: list, expect: dict) -> dict:
    """Analyze ACP output for delegation evidence."""
    full_output = "\n".join(output_lines)
    result = {"name": name, "status": "PASS", "subagent_calls": 0, "details": []}

    # Detect delegation via multiple signals:
    # 1. _kiro.dev/subagent/list_update with non-empty subagents
    # 2. "subagent" tool use in content blocks (outside commands/available)
    # 3. Text mentioning delegation to specific agents
    subagent_uses = 0
    agents_invoked = set()

    for line in output_lines:
        # Skip tool listing notifications
        if "_kiro.dev/commands/available" in line:
            continue

        # Signal 1: subagent/list_update with active subagents
        if "subagent/list_update" in line:
            try:
                msg = json.loads(line)
                subagents = msg.get("params", {}).get("subagents", [])
                if subagents:
                    subagent_uses += len(subagents)
                    for sa in subagents:
                        name_val = sa.get("name", sa.get("id", ""))
                        if name_val:
                            agents_invoked.add(name_val)
            except json.JSONDecodeError:
                pass
            continue

        # Signal 2: subagent tool call in content (tool_use blocks)
        if '"subagent"' in line and '"tool' in line.lower():
            subagent_uses += 1
            # Extract agent names from stages
            for m in re.finditer(r'"role":\s*"([^"]+_agent|backend|webapi|ui|astro|flutter|terraform|python)"', line):
                agents_invoked.add(m.group(1))

        # Signal 3: text content mentioning delegation
        if any(kw in line for kw in ['"stages"', '"depends_on"', 'prompt_template']):
            if '"subagent"' not in line and "commands/available" not in line:
                subagent_uses += 1

    result["subagent_calls"] = subagent_uses
    result["agents_invoked"] = list(agents_invoked)

    # Check 1: Delegation happened?
    if expect.get("delegated", True):
        if subagent_uses > 0:
            pass_msg(f"Delegation detected ({subagent_uses} subagent call(s))")
            result["details"].append({"check": "delegated", "passed": True})
        else:
            fail_msg("NO DELEGATION — orchestrator did not use subagent tool")
            result["status"] = "FAIL"
            result["details"].append({"check": "delegated", "passed": False, "reason": "subagent tool not called"})

    # Check 2: Expected agents (only in actual response content, not tool listings)
    expected_all = expect.get("agents_called", [])
    expected_any = expect.get("agents_called_any", [])

    # Build response-only output (exclude commands/available and mcp notifications)
    response_output = "\n".join(
        l for l in output_lines
        if "_kiro.dev/commands" not in l and "_kiro.dev/mcp" not in l
    )

    if expected_all:
        for agent in expected_all:
            if agent in response_output:
                pass_msg(f"Agent referenced: {agent}")
            else:
                fail_msg(f"Agent NOT referenced: {agent}")
                result["status"] = "FAIL"
                result["details"].append({"check": "agent_missing", "agent": agent, "passed": False})

    if expected_any:
        found = [a for a in expected_any if a in response_output]
        if found:
            pass_msg(f"Expected agent(s) found: {', '.join(found)}")
        else:
            fail_msg(f"None of expected agents found: {expected_any}")
            result["status"] = "FAIL"
            result["details"].append({"check": "agents_any_missing", "expected": expected_any, "passed": False})

    # Check 3: Forbidden tools
    forbidden = expect.get("forbidden_tools", [])
    for tool in forbidden:
        # Check if tool was called directly (outside of subagent context)
        # Simple heuristic: if tool name appears as a direct tool_use (not inside subagent stages)
        direct_use = False
        for line in output_lines:
            if "_kiro.dev/commands/available" in line:
                continue
            if f'"name":"{tool}"' in line and "subagent" not in line:
                direct_use = True
                break
        if direct_use:
            fail_msg(f"Forbidden tool called directly: {tool}")
            result["status"] = "FAIL"
            result["details"].append({"check": "forbidden_tool", "tool": tool, "passed": False})

    # Check 4: Delegation content must NOT contain (over-instructing check)
    must_not = expect.get("delegation_content_must_not_contain", [])
    if must_not:
        # Extract prompt_template content from subagent calls
        delegation_text = ""
        for line in output_lines:
            if "prompt_template" in line or "stages" in line:
                delegation_text += line
        violations = [phrase for phrase in must_not if phrase in delegation_text]
        if violations:
            fail_msg(f"Delegation over-instructs agent — contains: {violations}")
            result["status"] = "FAIL"
            result["details"].append({"check": "delegation_content_forbidden", "violations": violations, "passed": False})
        else:
            pass_msg("Delegation does not over-instruct (no step-by-step leakage)")

    # Check 5: Delegation content should contain
    should_contain = expect.get("delegation_content_should_contain_any", [])
    if should_contain:
        delegation_text = ""
        for line in output_lines:
            if "prompt_template" in line or "stages" in line:
                delegation_text += line
        found = [phrase for phrase in should_contain if phrase in delegation_text]
        if found:
            pass_msg(f"Delegation passes required context: {found}")
        else:
            fail_msg(f"Delegation missing required context: {should_contain}")
            result["status"] = "FAIL"
            result["details"].append({"check": "delegation_content_missing", "expected": should_contain, "passed": False})

    print()
    return result


def main():
    parser = argparse.ArgumentParser(description="Orchestrator Delegation Test Runner")
    parser.add_argument("scenarios", nargs="*", help="Scenario file(s) to run")
    parser.add_argument("--all", action="store_true", help="Run all scenarios")
    parser.add_argument("--dry-run", action="store_true", help="Preview without executing")
    parser.add_argument("--workers", type=int, default=int(os.environ.get("CERT_WORKERS", "4")),
                        help="Max parallel workers (default: $CERT_WORKERS or 4)")
    args = parser.parse_args()

    RESULTS_DIR.mkdir(exist_ok=True)

    # Collect scenarios
    scenarios = []
    if args.all:
        for f in sorted(SCENARIOS_DIR.rglob("*.json")):
            scenarios.append(f)
    else:
        for s in args.scenarios:
            p = Path(s) if os.path.isabs(s) else SCRIPT_DIR / s
            if p.exists():
                scenarios.append(p)
            else:
                print(f"❌ Scenario not found: {s}")
                sys.exit(1)

    if not scenarios:
        parser.print_help()
        sys.exit(1)

    print(f"\n{'═' * 50}")
    print(f"  Orchestrator Delegation Test Runner")
    print(f"  Scenarios: {len(scenarios)} | Mode: {'DRY-RUN' if args.dry_run else 'LIVE'} | Workers: {args.workers}")
    print(f"{'═' * 50}\n")

    def execute_scenario(scenario_path):
        """Run a single scenario with retries. Thread-safe."""
        scenario = json.loads(scenario_path.read_text())
        retries = scenario.get("retries", 0)
        allow_fail = scenario.get("allow_fail", False)

        r = run_scenario(scenario_path, dry_run=args.dry_run)

        attempts = 1
        while r["status"] == "FAIL" and attempts <= retries and not args.dry_run:
            warn_msg(f"Retrying ({attempts}/{retries})...")
            r = run_scenario(scenario_path, dry_run=False)
            attempts += 1

        if r["status"] == "FAIL" and allow_fail:
            r["status"] = "PASS"
            r["allow_fail"] = True
            warn_msg("Marked allow_fail — non-delegation is acceptable for this scenario")

        return r

    # Run scenarios in parallel
    results = []
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(execute_scenario, sp): sp for sp in scenarios}
        for future in as_completed(futures):
            results.append(future.result())

    # Write summary
    passed = sum(1 for r in results if r["status"] == "PASS")
    failed = sum(1 for r in results if r["status"] == "FAIL")
    errors = sum(1 for r in results if r["status"] == "ERROR")
    total = len([r for r in results if r["status"] != "SKIP"])

    summary = {
        "total": total,
        "passed": passed,
        "failed": failed,
        "errors": errors,
        "results": results,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
    }

    summary_file = RESULTS_DIR / "summary.json"
    summary_file.write_text(json.dumps(summary, indent=2))

    # Print summary
    print(f"{'━' * 50}")
    color = GREEN if failed == 0 and errors == 0 else RED
    print(f"  {color}Results: {passed} passed, {failed} failed, {errors} errors ({total} total){NC}")

    if failed > 0 or errors > 0:
        print(f"\n  Failed/Error scenarios:")
        for r in results:
            if r["status"] in ("FAIL", "ERROR"):
                reason = r.get("reason", "")
                details = r.get("details", [])
                failed_checks = [d for d in details if not d.get("passed", True)]
                info = reason or ", ".join(d.get("check", "") for d in failed_checks)
                print(f"    ✗ {r['name']}: {info}")

    print(f"\n  📄 Summary: {summary_file}")
    print()


if __name__ == "__main__":
    main()
