#!/usr/bin/env bash
set -euo pipefail

# Run this from wdpr-config-services root (recommended).
# Expected sibling repos:
#   ../wdpr-payment-controls-api
#   ../wdpr-payment-controls-client
#
# You can override by setting:
#   WEBAPI_REPO=/path/to/wdpr-payment-controls-api
#   UI_REPO=/path/to/wdpr-payment-controls-client

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PACK_DIR="${ROOT}/_kiro-pack"

BACKEND_REPO="${ROOT}"
WEBAPI_REPO="${WEBAPI_REPO:-$(cd "${ROOT}/.." && pwd)/wdpr-payment-controls-api}"
UI_REPO="${UI_REPO:-$(cd "${ROOT}/.." && pwd)/wdpr-payment-controls-client}"

echo "ROOT        : ${ROOT}"
echo "BACKEND_REPO: ${BACKEND_REPO}"
echo "WEBAPI_REPO : ${WEBAPI_REPO}"
echo "UI_REPO     : ${UI_REPO}"

# Validate repos exist
for repo in "${BACKEND_REPO}" "${WEBAPI_REPO}" "${UI_REPO}"; do
  if [[ ! -d "${repo}" ]]; then
    echo "ERROR: repo not found: ${repo}"
    exit 1
  fi
done

# Validate pack exists
if [[ ! -d "${PACK_DIR}" ]]; then
  echo "ERROR: pack not found at ${PACK_DIR}"
  exit 1
fi

# Validate rsync exists
command -v rsync >/dev/null 2>&1 || { echo "ERROR: rsync not installed"; exit 1; }

copy_file () {
  local src="$1"
  local dst="$2"
  if [[ ! -f "${src}" ]]; then
    echo "ERROR: file not found: ${src}"
    exit 1
  fi
  mkdir -p "$(dirname "${dst}")"
  rsync -a "${src}" "${dst}"
}

# "Clean" sync for shared baseline: destination becomes identical to src (deletes extras)
copy_dir_clean () {
  local src="$1"
  local dst="$2"
  if [[ ! -d "${src}" ]]; then
    echo "ERROR: directory not found: ${src}"
    exit 1
  fi
  mkdir -p "${dst}"
  rsync -a --delete "${src}/" "${dst}/"
}

# "Merge" sync for overlays: copy on top of destination WITHOUT deleting existing files
copy_dir_merge () {
  local src="$1"
  local dst="$2"
  if [[ ! -d "${src}" ]]; then
    echo "ERROR: directory not found: ${src}"
    exit 1
  fi
  mkdir -p "${dst}"
  rsync -a "${src}/" "${dst}/"
}

# -----------------------
# Shared baseline
# -----------------------
copy_file "${PACK_DIR}/shared/AGENTS.md" "${BACKEND_REPO}/AGENTS.md"
copy_file "${PACK_DIR}/shared/AGENTS.md" "${WEBAPI_REPO}/AGENTS.md"
copy_file "${PACK_DIR}/shared/AGENTS.md" "${UI_REPO}/AGENTS.md"

copy_dir_clean "${PACK_DIR}/shared/.kiro" "${BACKEND_REPO}/.kiro"
copy_dir_clean "${PACK_DIR}/shared/.kiro" "${WEBAPI_REPO}/.kiro"
copy_dir_clean "${PACK_DIR}/shared/.kiro" "${UI_REPO}/.kiro"

# -----------------------
# Repo-specific overlays (merge; do NOT delete shared files like orchestrator.json)
# -----------------------
copy_dir_merge "${PACK_DIR}/backend/.kiro" "${BACKEND_REPO}/.kiro"
copy_dir_merge "${PACK_DIR}/webapi/.kiro" "${WEBAPI_REPO}/.kiro"
copy_dir_merge "${PACK_DIR}/ui/.kiro" "${UI_REPO}/.kiro"

echo "✅ Kiro pack synced into all repos."
echo "Tip: open each repo in Kiro so it loads its local .kiro/ files."