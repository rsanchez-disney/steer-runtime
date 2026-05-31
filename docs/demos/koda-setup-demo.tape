# Koda Setup Demo — steer-runtime Quick Start
Output koda-setup-demo.gif
Set Shell "bash"
Set FontSize 15
Set Width 1400
Set Height 700
Set Padding 20
Set Theme "Dracula"
Set TypingSpeed 40ms

Sleep 1s

# Step 1: Install Koda
Type "curl -fsSL https://raw.githubusercontent.com/rsanchez-disney/Koda/main/install.sh | bash"
Enter
Hide
Type `printf '\n   Installing Koda...\n   OS: darwin  Arch: arm64\n\n   Version: v0.4.28\n   Installed: ~/.local/bin/koda\n   ✓ koda v0.4.28\n\n'`
Enter
Sleep 500ms
Show
Sleep 3s

# Step 2: Setup
Type "koda setup"
Enter
Hide
Type `printf '🔍 Checking dependencies...\n\n  ✓ kiro-cli       2.2.1\n  ✓ node           v20.19.5\n  ✓ git            2.44.0\n  ✓ gh             2.62.0\n\n✅ All dependencies installed\n\n📦 Companion tools:\n  ✓ yax\n  ✓ prompt-scorer\n\n'`
Enter
Sleep 500ms
Show
Sleep 3s

# Step 3: Doctor
Type "koda doctor"
Enter
Hide
Type `printf '  ✓ kiro-cli        2.2.1 (/usr/local/bin/kiro-cli)\n  ✓ steer-runtime   v0.2.106 (synced)\n  ✓ mcp.json        10 servers configured\n  ✓ yax             running (142 observations)\n  ✓ prompt-scorer   installed\n\n✅ All checks passed\n\n'`
Enter
Sleep 500ms
Show
Sleep 3s

# Step 4: Install Profiles
Type "koda install dev qa"
Enter
Hide
Type `printf '📦 Installing profiles: dev-core, dev-web, dev-mobile, qa\n\n  ✓ dev-core (21 agents)\n  ✓ dev-web (5 agents)\n  ✓ dev-mobile (3 agents)\n  ✓ qa (16 agents)\n\n✅ 4 profiles installed — 45 agents available\n\n'`
Enter
Sleep 500ms
Show
Sleep 3s

# Step 5: Select Workspace (Koda TUI)
Type "koda"
Enter
Hide
Type `printf '\n╔══════════════════════════════════════════════════════╗\n║  Koda v0.4.28                                        ║\n║                                                      ║\n║  Workspace: (none)          Profiles: dev-core, qa   ║\n║  Agents: 45                 MCP: 10 servers          ║\n║                                                      ║\n║  [w] Workspaces   [p] Profiles   [t] Tokens          ║\n║  [m] MCP          [e] Env vars   [enter] Chat        ║\n╚══════════════════════════════════════════════════════╝\n\n'`
Enter
Sleep 500ms
Show
Sleep 2s
Hide
Type `printf '  Pressing [w]...\n\n  Select workspace:\n  ❯ app-team/app-payment-controls\n    app-team/app-config-studio\n    pos-team\n    commerce-ticketing\n    sustainment/sustainment-beast\n\n  ✅ Workspace: app-payment-controls (DPAY)\n\n'`
Enter
Sleep 500ms
Show
Sleep 3s

# Step 6: Configure Tokens
Type "# Press [t] in Koda to configure tokens"
Enter
Hide
Type `printf '\n━━━ Token Configuration ━━━\n\n  Jira PAT (myjira.disney.com)\n  Token: ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●\n  ✓ Saved\n\n  GitHub PAT (github.disney.com)\n  Token: ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●\n  ✓ Saved\n\n  Confluence PAT (mywiki.disney.com)\n  Token: ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●\n  ✓ Saved\n\n✅ 3 tokens configured — MCP servers regenerated\n\n'`
Enter
Sleep 500ms
Show
Sleep 3s

# Step 7: Start Chatting
Type "koda chat"
Enter
Hide
Type `printf '\n👋 Ready to orchestrate your development workflow!\n\nI can help you:\n  • Implement Jira stories: \"Help me implement DPAY-1234\"\n  • Coordinate multi-repo features across backend, webapi, ui\n  • Run full SDLC: story → plan → implement → review → PR\n\n'`
Enter
Sleep 500ms
Show
Sleep 2s

Type "help me implement DPAY-15393"
Enter
Hide
Type `printf '\n📋 Analyzing DPAY-15393...\n   Fetching story from myjira.disney.com...\n   Exploring codebase for relevant files...\n\n## Implementation Plan\n\n1. Update filterData.decorator.ts — fix startDate/startTime mismatch\n2. Add unit tests for date filter edge cases\n3. Create PR: fix/DPAY-15393-date-filter-mismatch\n\nShall I proceed with the implementation?\n\n'`
Enter
Sleep 500ms
Show
Sleep 4s

# End
Hide
Type `printf '\n# ✅ Setup complete! Docs: https://github.disney.com/SANCR225/steer-runtime\n'`
Enter
Sleep 500ms
Show
Sleep 3s
