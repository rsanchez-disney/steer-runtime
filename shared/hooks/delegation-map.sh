#!/bin/bash
# agentSpawn hook: generate delegation map for orchestrators
# Writes full map to _dynamic/delegation-map.md
# Stdout: compact delegation summary

KIRO_DIR="${KIRO_HOME:-$HOME/.kiro}"
DYNAMIC_DIR="$KIRO_DIR/context/_dynamic"
mkdir -p "$DYNAMIC_DIR"

MAP_FILE="$DYNAMIC_DIR/delegation-map.md"

python3 -c "
import json, os, glob
from collections import defaultdict

kiro = os.environ.get('KIRO_HOME', os.path.expanduser('~/.kiro'))

# Load profiles manifest for agent→profile mapping
profile_map = {}
pf = os.path.join(kiro, 'settings/profiles.json')
if os.path.isfile(pf):
    try:
        d = json.load(open(pf))
        for p in d.get('profiles', []):
            if p.get('installed'):
                for a in p.get('agents', []):
                    profile_map[a] = p['id']
    except: pass

# Load all agents
agents = []
for f in sorted(glob.glob(os.path.join(kiro, 'agents/*.json'))):
    if os.path.basename(f).startswith('._'): continue
    try:
        d = json.load(open(f))
        agents.append({
            'name': d.get('name', ''),
            'description': d.get('description', ''),
            'profile': profile_map.get(d.get('name', ''), 'unknown')
        })
    except: continue

# Group by profile
by_profile = defaultdict(list)
for a in agents:
    by_profile[a['profile']].append(a)

# === COMPACT (stdout) ===
print('## Delegation Map')
print('')
for profile in sorted(by_profile.keys()):
    names = ', '.join(a['name'] for a in by_profile[profile])
    print(f'- **{profile}**: {names}')
print('')

# === FULL (file) ===
full = ['# Delegation Map (auto-generated)', '']
full.append(f'Total: {len(agents)} agents across {len(by_profile)} profiles')
full.append('')

for profile in sorted(by_profile.keys()):
    full.append(f'## {profile}')
    full.append('')
    full.append('| Agent | Description |')
    full.append('|-------|-------------|')
    for a in sorted(by_profile[profile], key=lambda x: x['name']):
        full.append(f'| {a[\"name\"]} | {a[\"description\"]} |')
    full.append('')

with open('$MAP_FILE', 'w') as f:
    f.write('\n'.join(full) + '\n')
" 2>/dev/null
