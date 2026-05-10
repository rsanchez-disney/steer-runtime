#!/bin/bash
# agentSpawn hook: inject orchestrator awareness context
# Two-tier output:
#   stdout → compact summary injected into context (~500 bytes)
#   file   → full detail written to _dynamic/ for on-demand loading

KIRO_DIR="${KIRO_HOME:-$HOME/.kiro}"
STEER_ROOT="$KIRO_DIR/steer-runtime"
DYNAMIC_DIR="$KIRO_DIR/context/_dynamic"
mkdir -p "$DYNAMIC_DIR"

FULL_FILE="$DYNAMIC_DIR/agent-registry-full.md"

# Collect data via python for both tiers
python3 -c "
import json, os, glob

kiro = os.environ.get('KIRO_HOME', os.path.expanduser('~/.kiro'))
steer = os.path.join(kiro, 'steer-runtime')

# --- Workspace ---
ws = ''
ws_data = {}
for f in [os.path.join(kiro,'settings/kite.json'), os.path.join(kiro,'settings/koda/steer_settings.json'), os.path.join(kiro,'settings/koda/shared_settings.json')]:
    if os.path.isfile(f) and not ws:
        try:
            d = json.load(open(f))
            ws = d.get('steerRuntime',{}).get('activeWorkspace','')
        except: pass

ws_file = os.path.join(kiro, 'settings/workspace.json')
if os.path.isfile(ws_file):
    try: ws_data = json.load(open(ws_file))
    except: pass

# --- System ---
sys_data = {}
sys_file = os.path.join(kiro, 'settings/system.json')
if os.path.isfile(sys_file):
    try: sys_data = json.load(open(sys_file))
    except: pass

# --- Profiles ---
profiles = []
pf = os.path.join(kiro, 'settings/profiles.json')
if os.path.isfile(pf):
    try:
        d = json.load(open(pf))
        profiles = [p for p in d.get('profiles',[]) if p.get('installed')]
    except: pass

# --- Agents ---
agents = []
for f in sorted(glob.glob(os.path.join(kiro, 'agents/*.json'))):
    if os.path.basename(f).startswith('._'): continue
    try:
        d = json.load(open(f))
        agents.append({'name': d.get('name',''), 'description': d.get('description','')})
    except: pass

# === COMPACT OUTPUT (stdout) ===
print('## System')
print('')

# Workspace line
if ws:
    team = ws_data.get('team', '')
    jp = ws_data.get('jira_prefix', '')
    if isinstance(jp, list): jp = ', '.join(jp)
    parts = [f'Workspace: {ws}']
    if team: parts.append(f'Team: {team}')
    if jp: parts.append(f'Jira: {jp}')
    da = ws_data.get('default_agent', '')
    if da: parts.append(f'Default: {da}')
    print(' | '.join(parts))

# Profiles compact
if profiles:
    plist = ', '.join(f\"{p['id']}({p.get('agent_count', len(p.get('agents',[])))})\" for p in profiles)
    print(f'Profiles: {plist}')

# System compact
ram = sys_data.get('total_ram_gb', 0)
tier = sys_data.get('tier', 'unknown')
max_a = sys_data.get('max_concurrent_agents', 2)
if ram:
    print(f'System: {ram}GB RAM ({tier}), max {max_a} concurrent agents')

# Agent count
print(f'Agents: {len(agents)} installed')
print('')

# === FULL OUTPUT (file) ===
full = []
full.append('# Agent Registry (full)')
full.append('')

# Workspace detail
if ws:
    full.append('## Workspace Context')
    full.append('')
    full.append(f'- **Active workspace:** {ws}')
    if ws_data.get('team'): full.append(f'- **Team:** {ws_data[\"team\"]}')
    if ws_data.get('extends'): full.append(f'- **Extends:** {ws_data[\"extends\"]}')
    if ws_data.get('profiles'): full.append(f'- **Profiles:** {\", \".join(ws_data[\"profiles\"])}')
    if ws_data.get('default_agent'): full.append(f'- **Default agent:** {ws_data[\"default_agent\"]}')
    jp = ws_data.get('jira_prefix', '')
    if jp: full.append(f'- **Jira prefix:** {\", \".join(jp) if isinstance(jp, list) else jp}')
    if ws_data.get('services'): full.append(f'- **Services:** {\", \".join(ws_data[\"services\"])}')
    if ws_data.get('channels'): full.append(f'- **Channels:** {\", \".join(ws_data[\"channels\"])}')
    if ws_data.get('teams'):
        full.append(f'- **Teams:** {len(ws_data[\"teams\"])}')
        for t in ws_data['teams']:
            info = t['name']
            projs = ', '.join(t.get('jira_projects', []))
            if projs: info += f' ({projs})'
            full.append(f'  - {info}')
    full.append('')

# System detail
if ram:
    full.append('## System Resources')
    full.append('')
    full.append(f'- **RAM:** {ram} GB ({tier} tier)')
    full.append(f'- **Max concurrent sub-agents:** {max_a}')
    strat = {'light': 'sequential only', 'standard': 'parallel OK for 2-3', 'power': 'full parallel'}
    full.append(f'- **Delegation strategy:** {strat.get(tier, \"standard\")}')
    full.append('')

# Profiles detail
if profiles:
    full.append('## Installed Profiles')
    full.append('')
    for p in profiles:
        count = p.get('agent_count', len(p.get('agents',[])))
        agents_list = ', '.join(p.get('agents',[]))
        full.append(f'- **{p[\"id\"]}** ({count} agents): {agents_list}')
    full.append('')

# Agent registry detail
full.append('## Agent Registry')
full.append('')
for a in agents:
    full.append(f'- **{a[\"name\"]}**: {a[\"description\"]}')

with open('$FULL_FILE', 'w') as f:
    f.write('\n'.join(full) + '\n')
" 2>/dev/null
