#!/bin/bash
# POS Daily Report — scheduled runner
# Generates the report via kiro-cli non-interactively
# Schedule via: launchctl load ~/Library/LaunchAgents/com.pos.daily-report.plist

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../../../.." && pwd)"
REPORT_DIR="$PROJECT_ROOT/POS Output"
mkdir -p "$REPORT_DIR/logs"
DATE=$(date +%Y-%m-%d)
OUTPUT="$REPORT_DIR/pos-daily-report-${DATE}.md"

echo "🕐 Generating POS Daily Report for $DATE..."

# Use kiro-cli to run the report prompt non-interactively
kiro-cli chat --agent orchestrator --message "Generate the POS Program Daily Epic Status Report for DSP 2.1.1. Run the JQL query: project = \"Point of Sale\" AND issuetype = Epic AND \"Target Release\" ~ \"DSP 2.1.1\" AND \"Project Owner\" in (\"jonatan.x.arrieta.-nd@disney.com\",\"juan.zanetti.-nd@disney.com\",\"mariano.gabriel.guerra.-nd@disney.com\",\"manuel.diaz.salcedo.-nd@disney.com\",\"monica.cruz.-nd@disney.com\",\"lucia.trincabelli.simonet.-nd@disney.com\",\"jimena.chau.-nd@disney.com\",\"renato.renan.fellipa.-nd@disney.com\",\"martin.campo.-nd@disney.com\"). Fetch child issues for non-Done Epics via Epic Link. Identify blocked/fix-failed issues. Save the full formatted report as ${OUTPUT} and also generate ${OUTPUT%.md}.html." --no-interactive 2>&1 | tee "$REPORT_DIR/logs/pos-report-${DATE}.log"

echo "✅ Report saved to $OUTPUT"
