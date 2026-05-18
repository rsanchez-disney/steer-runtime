#!/usr/bin/env bash
# validate-catalog.sh — Validates managed services catalog app.yaml files
# Usage: ./scripts/validate-catalog.sh [--strict] [--studio <name>]
#
# Modes:
#   default:  Report fill-rate and structural issues (warnings only)
#   --strict: Exit non-zero if required fields are empty

set -euo pipefail

CATALOG_DIR="profiles/sustainment/managed-services-catalog/studios"
STRICT=false
STUDIO_FILTER=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --strict) STRICT=true; shift ;;
    --studio) STUDIO_FILTER="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

if [[ ! -d "$CATALOG_DIR" ]]; then
  echo "❌ Catalog directory not found: $CATALOG_DIR"
  exit 1
fi

if ! command -v yq &>/dev/null; then
  echo "❌ yq is required. Install: brew install yq"
  exit 1
fi

# Counters
total=0
errors=0
warnings=0
filled_identity=0
filled_servicenow=0
filled_components=0
filled_splunk=0
filled_cloud=0

scan_dir="$CATALOG_DIR"
if [[ -n "$STUDIO_FILTER" ]]; then
  scan_dir="$CATALOG_DIR/$STUDIO_FILTER"
  if [[ ! -d "$scan_dir" ]]; then
    echo "❌ Studio not found: $scan_dir"
    exit 1
  fi
fi

# Collect per-studio stats in a temp file
studio_stats=$(mktemp)
trap 'rm -f "$studio_stats"' EXIT

for yaml in $(find "$scan_dir" -name "app.yaml" | sort); do
  total=$((total + 1))
  dir=$(dirname "$yaml")
  studio=$(basename "$(dirname "$dir")")

  # --- Required field checks ---
  bapp_id=$(yq -r '.bapp_id // ""' "$yaml")
  app_name=$(yq -r '.app_name // ""' "$yaml")
  support_studio=$(yq -r '.support_studio // ""' "$yaml")
  assignment_group=$(yq -r '.servicenow.assignment_group // ""' "$yaml")
  config_item=$(yq -r '.servicenow.configuration_item // ""' "$yaml")
  comp_name=$(yq -r '.components[0].component_name // ""' "$yaml")
  comp_type=$(yq -r '.components[0].component_type // ""' "$yaml")

  # Identity check
  if [[ -n "$bapp_id" && -n "$app_name" && -n "$support_studio" ]]; then
    filled_identity=$((filled_identity + 1))
  else
    errors=$((errors + 1))
    echo "❌ $yaml: missing identity (bapp_id=$bapp_id, app_name=$app_name, support_studio=$support_studio)"
  fi

  # ServiceNow check
  if [[ -n "$assignment_group" && -n "$config_item" ]]; then
    filled_servicenow=$((filled_servicenow + 1))
  elif [[ -z "$assignment_group" ]]; then
    warnings=$((warnings + 1))
  fi

  # Components check
  has_comp=0
  if [[ -n "$comp_name" && -n "$comp_type" ]]; then
    filled_components=$((filled_components + 1))
    has_comp=1
  fi

  # Splunk check
  splunk_index=$(yq -r '.components[0].splunk.index // ""' "$yaml")
  if [[ -n "$splunk_index" ]]; then
    filled_splunk=$((filled_splunk + 1))
  fi

  # Cloud check
  cloud_provider=$(yq -r '.components[0].cloud.provider // ""' "$yaml")
  if [[ -n "$cloud_provider" ]]; then
    filled_cloud=$((filled_cloud + 1))
  fi

  # Record studio stats
  echo "$studio $has_comp" >> "$studio_stats"

  # Structural: check companion docs exist
  for doc in troubleshooting.md business-rules.md runbook.md; do
    if [[ ! -f "$dir/$doc" ]]; then
      warnings=$((warnings + 1))
      echo "⚠  $dir: missing $doc"
    fi
  done
done

# --- Report ---
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Managed Services Catalog — Validation Report"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  Total BAPPs:          $total"
echo "  Errors:               $errors"
echo "  Warnings:             $warnings"
echo ""
echo "  ── Fill Rate ──────────────────────────────────────"
echo "  Identity (bapp_id, app_name, studio):  $filled_identity/$total ($(( filled_identity * 100 / total ))%)"
echo "  ServiceNow (CI + assignment_group):    $filled_servicenow/$total ($(( filled_servicenow * 100 / total ))%)"
echo "  Components (name + type):              $filled_components/$total ($(( filled_components * 100 / total ))%)"
echo "  Splunk config:                         $filled_splunk/$total ($(( filled_splunk * 100 / total ))%)"
echo "  Cloud infrastructure:                  $filled_cloud/$total ($(( filled_cloud * 100 / total ))%)"
echo ""
echo "  ── Per-Studio Breakdown ───────────────────────────"
printf "  %-25s %5s %10s\n" "Studio" "BAPPs" "Components"
printf "  %-25s %5s %10s\n" "-------------------------" "-----" "----------"
for studio in $(awk '{print $1}' "$studio_stats" | sort -u); do
  s_total=$(grep -c "^$studio " "$studio_stats" || true)
  s_filled=$(grep -c "^$studio 1$" "$studio_stats" || true)
  printf "  %-25s %5d %10d\n" "$studio" "$s_total" "$s_filled"
done
echo ""
echo "═══════════════════════════════════════════════════════"

if [[ "$STRICT" == "true" && $errors -gt 0 ]]; then
  echo ""
  echo "❌ Strict mode: $errors error(s) found"
  exit 1
fi

if [[ $errors -eq 0 ]]; then
  echo "✅ All structural checks passed"
fi
