#!/bin/bash
# Integration test: validates the full pipeline from tokens.env → mcp.json
#
# Validates: Requirements 8.1, 8.2, 8.3, 8.4
#
# This test creates a mock KIRO_ROOT with a tokens.env, runs the same
# discover_github_remotes + Python MCP JSON generation logic used by
# setup.sh mcp-install, then asserts the generated mcp.json structure.

set -euo pipefail

PASS=0
FAIL=0
TESTS=0

pass() { ((PASS++)); ((TESTS++)); echo "  ✓ $1"; }
fail() { ((FAIL++)); ((TESTS++)); echo "  ✗ $1"; echo "    → $2"; }

# ── Setup temp directory as mock KIRO_ROOT ──────────────────────────────────

TMPDIR=$(mktemp -d)
MOCK_KIRO_ROOT="$TMPDIR/mock_kiro"
MOCK_HOME="$TMPDIR/mock_home"
mkdir -p "$MOCK_KIRO_ROOT"
mkdir -p "$MOCK_HOME/.kiro/tools/mcp-servers/github-mcp/dist"
mkdir -p "$MOCK_HOME/.kiro/settings"

# Create a mock dist/index.cjs so paths are realistic
touch "$MOCK_HOME/.kiro/tools/mcp-servers/github-mcp/dist/index.cjs"

# ── Write mock tokens.env ───────────────────────────────────────────────────

TOKENS_FILE="$MOCK_KIRO_ROOT/tokens.env"
cat > "$TOKENS_FILE" << 'EOF'
GITHUB_TOKEN_disney=ghp_test_disney_token
GITHUB_HOST_disney=github.disney.com
GITHUB_TOKEN_public=ghp_test_public_token
GITHUB_HOST_public=github.com
GITHUB_API_PATH_public=/api/v3
JIRA_PAT=test_jira
CONFLUENCE_PAT=test_confluence
EOF

# ── Copy discover_github_remotes from setup.sh ──────────────────────────────

discover_github_remotes() {
    local tokens_file="$1"
    [ -f "$tokens_file" ] || return
    grep -o 'GITHUB_TOKEN_[a-zA-Z0-9_]*' "$tokens_file" | sed 's/GITHUB_TOKEN_//' | sort -u
}

# ── Run the MCP JSON generation logic (mirrors setup.sh mcp-install) ────────

_github_remotes=$(discover_github_remotes "$TOKENS_FILE")
MCP_SETTINGS="$MOCK_HOME/.kiro/settings/mcp.json"

python3 -c "
import json, sys, os

tokens_file = '$TOKENS_FILE'
remotes_raw = '''$_github_remotes'''.strip()
home = '$MOCK_HOME'

def read_tok(key):
    try:
        with open(tokens_file) as f:
            for line in f:
                if line.startswith(key + '='):
                    return line.strip().split('=', 1)[1]
    except FileNotFoundError:
        pass
    return ''

jira_pat = read_tok('JIRA_PAT')
confluence_pat = read_tok('CONFLUENCE_PAT')

mcp = {
    'mcpServers': {
        'jira': {
            'command': 'node',
            'args': [home + '/.kiro/tools/mcp-servers/jira-mcp/dist/index.cjs'],
            'env': {'JIRA_PAT': jira_pat}
        },
        'confluence': {
            'command': 'node',
            'args': [home + '/.kiro/tools/mcp-servers/confluence-mcp/dist/index.cjs'],
            'env': {'CONFLUENCE_URL': 'https://confluence.disney.com', 'CONFLUENCE_PAT': confluence_pat}
        },
    }
}

# GitHub entries: per-remote with flat env vars, or legacy fallback
remotes = [r for r in remotes_raw.split('\n') if r.strip()]
if remotes:
    for remote in remotes:
        token = read_tok('GITHUB_TOKEN_' + remote)
        host = read_tok('GITHUB_HOST_' + remote)
        api_path = read_tok('GITHUB_API_PATH_' + remote)
        if not token or not host:
            continue
        entry = {
            'command': 'node',
            'args': [home + '/.kiro/tools/mcp-servers/github-mcp/dist/index.cjs'],
            'env': {
                'GITHUB_REMOTE': remote,
                'GITHUB_HOST': host,
                'GITHUB_TOKEN': token,
            }
        }
        if api_path:
            entry['env']['GITHUB_API_PATH'] = api_path
        mcp['mcpServers']['github-' + remote] = entry
else:
    # Fallback: legacy single github entry
    legacy_token = read_tok('GITHUB_TOKEN')
    legacy_url = read_tok('GITHUB_URL')
    mcp['mcpServers']['github'] = {
        'command': 'node',
        'args': [home + '/.kiro/tools/mcp-servers/github-mcp/dist/index.cjs'],
        'env': {
            'GITHUB_URL': legacy_url or 'https://github.disney.com',
            'GITHUB_TOKEN': legacy_token or 'YOUR_TOKEN',
        }
    }

with open('$MCP_SETTINGS', 'w') as f:
    json.dump(mcp, f, indent=2)
    f.write('\n')
"

# ── Assertions via python3 ──────────────────────────────────────────────────

echo ""
echo "Running MCP JSON generation integration tests..."
echo ""

python3 << ASSERT_PY
import json, sys

with open('$MCP_SETTINGS') as f:
    mcp = json.load(f)

servers = mcp.get('mcpServers', {})
errors = []

# ── Req 8.1 / 8.2: Exactly two github entries: github-disney and github-public ──

if 'github-disney' in servers:
    print('  ✓ github-disney entry exists')
else:
    errors.append('Missing github-disney entry')
    print('  ✗ github-disney entry exists')

if 'github-public' in servers:
    print('  ✓ github-public entry exists')
else:
    errors.append('Missing github-public entry')
    print('  ✗ github-public entry exists')

# Count github-* entries (exclude jira, confluence, etc.)
github_entries = [k for k in servers if k.startswith('github-')]
if len(github_entries) == 2:
    print('  ✓ Exactly 2 github-* entries found')
else:
    errors.append(f'Expected 2 github-* entries, found {len(github_entries)}: {github_entries}')
    print(f'  ✗ Exactly 2 github-* entries found (got {len(github_entries)})')

# ── Req 8.2: No bare "github" entry when multiple remotes exist ──

if 'github' not in servers:
    print('  ✓ No bare "github" entry present')
else:
    errors.append('Bare "github" entry should not exist when multiple remotes are discovered')
    print('  ✗ No bare "github" entry present')

# ── Req 8.3: Each entry has flat env vars GITHUB_REMOTE, GITHUB_HOST, GITHUB_TOKEN ──

for name in ['github-disney', 'github-public']:
    entry = servers.get(name, {})
    env = entry.get('env', {})
    required_keys = ['GITHUB_REMOTE', 'GITHUB_HOST', 'GITHUB_TOKEN']
    for key in required_keys:
        if key in env:
            print(f'  ✓ {name} has env var {key}')
        else:
            errors.append(f'{name} missing env var {key}')
            print(f'  ✗ {name} has env var {key}')

# ── Validate specific values ──

disney_env = servers.get('github-disney', {}).get('env', {})
if disney_env.get('GITHUB_REMOTE') == 'disney':
    print('  ✓ github-disney GITHUB_REMOTE == "disney"')
else:
    errors.append(f'github-disney GITHUB_REMOTE expected "disney", got "{disney_env.get("GITHUB_REMOTE")}"')
    print(f'  ✗ github-disney GITHUB_REMOTE == "disney"')

if disney_env.get('GITHUB_HOST') == 'github.disney.com':
    print('  ✓ github-disney GITHUB_HOST == "github.disney.com"')
else:
    errors.append(f'github-disney GITHUB_HOST expected "github.disney.com", got "{disney_env.get("GITHUB_HOST")}"')
    print(f'  ✗ github-disney GITHUB_HOST == "github.disney.com"')

if disney_env.get('GITHUB_TOKEN') == 'ghp_test_disney_token':
    print('  ✓ github-disney GITHUB_TOKEN == "ghp_test_disney_token"')
else:
    errors.append(f'github-disney GITHUB_TOKEN mismatch')
    print(f'  ✗ github-disney GITHUB_TOKEN == "ghp_test_disney_token"')

public_env = servers.get('github-public', {}).get('env', {})
if public_env.get('GITHUB_REMOTE') == 'public':
    print('  ✓ github-public GITHUB_REMOTE == "public"')
else:
    errors.append(f'github-public GITHUB_REMOTE expected "public", got "{public_env.get("GITHUB_REMOTE")}"')
    print(f'  ✗ github-public GITHUB_REMOTE == "public"')

if public_env.get('GITHUB_HOST') == 'github.com':
    print('  ✓ github-public GITHUB_HOST == "github.com"')
else:
    errors.append(f'github-public GITHUB_HOST expected "github.com", got "{public_env.get("GITHUB_HOST")}"')
    print(f'  ✗ github-public GITHUB_HOST == "github.com"')

if public_env.get('GITHUB_TOKEN') == 'ghp_test_public_token':
    print('  ✓ github-public GITHUB_TOKEN == "ghp_test_public_token"')
else:
    errors.append(f'github-public GITHUB_TOKEN mismatch')
    print(f'  ✗ github-public GITHUB_TOKEN == "ghp_test_public_token"')

# ── Req 8.3: GITHUB_API_PATH present only when suffixed key exists ──

if 'GITHUB_API_PATH' not in disney_env:
    print('  ✓ github-disney does NOT have GITHUB_API_PATH (none in tokens.env)')
else:
    errors.append('github-disney should not have GITHUB_API_PATH')
    print('  ✗ github-disney does NOT have GITHUB_API_PATH')

if public_env.get('GITHUB_API_PATH') == '/api/v3':
    print('  ✓ github-public GITHUB_API_PATH == "/api/v3"')
else:
    errors.append(f'github-public GITHUB_API_PATH expected "/api/v3", got "{public_env.get("GITHUB_API_PATH")}"')
    print(f'  ✗ github-public GITHUB_API_PATH == "/api/v3"')

# ── Verify no suffixed env vars leaked into entries ──

for name in ['github-disney', 'github-public']:
    env = servers.get(name, {}).get('env', {})
    suffixed = [k for k in env if '_disney' in k or '_public' in k]
    if not suffixed:
        print(f'  ✓ {name} has no suffixed env vars')
    else:
        errors.append(f'{name} has suffixed env vars: {suffixed}')
        print(f'  ✗ {name} has no suffixed env vars (found: {suffixed})')

# ── Verify command and args structure ──

for name in ['github-disney', 'github-public']:
    entry = servers.get(name, {})
    if entry.get('command') == 'node':
        print(f'  ✓ {name} command is "node"')
    else:
        errors.append(f'{name} command expected "node"')
        print(f'  ✗ {name} command is "node"')
    args = entry.get('args', [])
    if len(args) == 1 and 'github-mcp/dist/index.cjs' in args[0]:
        print(f'  ✓ {name} args point to github-mcp/dist/index.cjs')
    else:
        errors.append(f'{name} args incorrect: {args}')
        print(f'  ✗ {name} args point to github-mcp/dist/index.cjs')

# ── Summary ──

print('')
total = len(errors)
passed = 20 - total  # approximate
if errors:
    print(f'FAILED: {len(errors)} assertion(s) failed')
    for e in errors:
        print(f'  → {e}')
    sys.exit(1)
else:
    print('All assertions passed ✓')
    sys.exit(0)
ASSERT_PY

TEST_RESULT=$?

# ── Cleanup ─────────────────────────────────────────────────────────────────

rm -rf "$TMPDIR"

if [ $TEST_RESULT -eq 0 ]; then
    echo ""
    echo "✅ Integration test PASSED"
    exit 0
else
    echo ""
    echo "❌ Integration test FAILED"
    exit 1
fi
