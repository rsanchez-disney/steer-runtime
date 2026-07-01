# POS Team — PM Profile

Daily operational bug reports and PM tooling for POS DSP releases.

## Agent

- **dsp_bug_report_agent** — Generates daily bug reports for DSP 2.1.1, 2.1.2, 2.1.3

## CLI Usage

Run the report generator directly:

```bash
# Set credentials (or add to ~/.zshrc)
export JIRA_EMAIL="your.email@disney.com"
export JIRA_PAT="your-jira-token"

# Generate all reports in current directory
python3 workspaces/pos-team/profiles/pm/scripts/run_dsp_reports.py

# Generate to a specific folder
python3 workspaces/pos-team/profiles/pm/scripts/run_dsp_reports.py --output-dir ./reports

# Single release only
python3 workspaces/pos-team/profiles/pm/scripts/run_dsp_reports.py --release "DSP 2.1.2"

# Generate and open in browser
python3 workspaces/pos-team/profiles/pm/scripts/run_dsp_reports.py --open
```

## Output

Each run generates per release:
- `pos-dsp-{version}-daily-report-YYYY-MM-DD.md` — Markdown report
- `pos-dsp-{version}-daily-report-YYYY-MM-DD.html` — Styled HTML report

## Delta Tracking

Reports auto-detect yesterday's `.md` file in the same output directory to compute count deltas. First run shows "—" for deltas.

## Biweekly Cadence

Every second Tuesday (starting May 27, 2026) is flagged for biweekly trend summaries. Currently informational in CLI mode; full biweekly sections are generated when run via the agent.

## Profile Structure

```
workspaces/pos-team/profiles/pm/
├── agents/
│   └── dsp_bug_report_agent.json
├── context/
│   └── dsp_bug_report_guidelines.md
├── prompts/
│   └── dsp_bug_report_agent.md
├── scripts/              # CLI utilities (manual/cron) — not MCP tools
│   ├── run_dsp_reports.py
│   ├── analyze_bugs.py
│   ├── generate_html_report.py
│   ├── merge_bugs.py
│   ├── parse_bugs.py
│   └── pos-daily-report-cron.sh
└── README.md
```
