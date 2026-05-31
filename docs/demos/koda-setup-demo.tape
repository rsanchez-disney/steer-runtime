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
Type "echo ''"
Enter
Show
Sleep 500ms
Hide
Type `echo "   Installing Koda..."`
Enter
Type `echo "   OS: darwin  Arch: arm64"`
Enter
Type `echo ""`
Enter
Type `echo "   Version: v0.4.28"`
Enter
Type `echo "   Installed: ~/.local/bin/koda"`
Enter
Type `echo "   ✓ koda v0.4.28"`
Enter
Type `echo ""`
Enter
Show
Sleep 3s

# Step 2: Setup
Type "koda setup"
Enter
Hide
Type `echo "🔍 Checking dependencies..."`
Enter
Type `echo ""`
Enter
Type `echo "  ✓ kiro-cli       2.2.1"`
Enter
Type `echo "  ✓ node           v20.19.5"`
Enter
Type `echo "  ✓ git            2.44.0"`
Enter
Type `echo "  ✓ gh             2.62.0"`
Enter
Type `echo ""`
Enter
Type `echo "✅ All dependencies installed"`
Enter
Type `echo ""`
Enter
Type `echo "📦 Companion tools:"`
Enter
Type `echo "  ✓ yax"`
Enter
Type `echo "  ✓ prompt-scorer"`
Enter
Type `echo ""`
Enter
Show
Sleep 3s

# Step 3: Doctor
Type "koda doctor"
Enter
Hide
Type `echo "  ✓ kiro-cli        2.2.1 (/usr/local/bin/kiro-cli)"`
Enter
Type `echo "  ✓ steer-runtime   v0.2.106 (synced)"`
Enter
Type `echo "  ✓ mcp.json        10 servers configured"`
Enter
Type `echo "  ✓ yax             running (142 observations)"`
Enter
Type `echo "  ✓ prompt-scorer   installed"`
Enter
Type `echo ""`
Enter
Type `echo "✅ All checks passed"`
Enter
Type `echo ""`
Enter
Show
Sleep 3s

# Step 4: Install Profiles
Type "koda install dev qa"
Enter
Hide
Type `echo "📦 Installing profiles: dev-core, dev-web, dev-mobile, qa"`
Enter
Type `echo ""`
Enter
Type `echo "  ✓ dev-core (21 agents)"`
Enter
Type `echo "  ✓ dev-web (5 agents)"`
Enter
Type `echo "  ✓ dev-mobile (3 agents)"`
Enter
Type `echo "  ✓ qa (16 agents)"`
Enter
Type `echo ""`
Enter
Type `echo "✅ 4 profiles installed — 45 agents available"`
Enter
Type `echo ""`
Enter
Show
Sleep 3s

# Step 5: Select Workspace
Type "koda"
Enter
Hide
Type `echo ""`
Enter
Type `echo "╔══════════════════════════════════════════════════════╗"`
Enter
Type `echo "║  Koda v0.4.28                                        ║"`
Enter
Type `echo "║                                                      ║"`
Enter
Type `echo "║  Workspace: (none)          Profiles: dev-core, qa   ║"`
Enter
Type `echo "║  Agents: 45                 MCP: 10 servers          ║"`
Enter
Type `echo "║                                                      ║"`
Enter
Type `echo "║  [w] Workspaces   [p] Profiles   [t] Tokens          ║"`
Enter
Type `echo "║  [m] MCP          [e] Env vars   [enter] Chat        ║"`
Enter
Type `echo "╚══════════════════════════════════════════════════════╝"`
Enter
Type `echo ""`
Enter
Type `echo "  Pressing [w]..."`
Enter
Type `echo ""`
Enter
Type `echo "  Select workspace:"`
Enter
Type `echo "  ❯ app-team/app-payment-controls"`
Enter
Type `echo "    app-team/app-config-studio"`
Enter
Type `echo "    pos-team"`
Enter
Type `echo "    commerce-ticketing"`
Enter
Type `echo "    sustainment/sustainment-beast"`
Enter
Type `echo ""`
Enter
Type `echo "  ✅ Workspace: app-payment-controls (DPAY)"`
Enter
Type `echo ""`
Enter
Show
Sleep 3s

# Step 6: Configure Tokens
Hide
Type `echo "# Press [t] in Koda to configure tokens"`
Enter
Type `echo ""`
Enter
Type `echo "━━━ Token Configuration ━━━"`
Enter
Type `echo ""`
Enter
Type `echo "  Jira PAT (myjira.disney.com)"`
Enter
Type `echo "  Token: ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●"`
Enter
Type `echo "  ✓ Saved"`
Enter
Type `echo ""`
Enter
Type `echo "  GitHub PAT (github.disney.com)"`
Enter
Type `echo "  Token: ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●"`
Enter
Type `echo "  ✓ Saved"`
Enter
Type `echo ""`
Enter
Type `echo "  Confluence PAT (mywiki.disney.com)"`
Enter
Type `echo "  Token: ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●"`
Enter
Type `echo "  ✓ Saved"`
Enter
Type `echo ""`
Enter
Type `echo "✅ 3 tokens configured — MCP servers regenerated"`
Enter
Type `echo ""`
Enter
Show
Sleep 3s

# Step 7: Start Chatting
Type "koda chat"
Enter
Hide
Type `echo ""`
Enter
Type `echo "👋 Ready to orchestrate your development workflow!"`
Enter
Type `echo ""`
Enter
Type `echo "I can help you:"`
Enter
Type `echo "  • Implement Jira stories"`
Enter
Type `echo "  • Coordinate multi-repo features"`
Enter
Type `echo "  • Run full SDLC: story → plan → implement → review → PR"`
Enter
Type `echo ""`
Enter
Type `echo "> help me implement DPAY-15393"`
Enter
Type `echo ""`
Enter
Type `echo "📋 Analyzing DPAY-15393..."`
Enter
Type `echo "   Fetching story from myjira.disney.com..."`
Enter
Type `echo "   Exploring codebase for relevant files..."`
Enter
Type `echo ""`
Enter
Type `echo "## Implementation Plan"`
Enter
Type `echo ""`
Enter
Type `echo "1. Update filterData.decorator.ts — fix startDate/startTime mismatch"`
Enter
Type `echo "2. Add unit tests for date filter edge cases"`
Enter
Type `echo "3. Create PR: fix/DPAY-15393-date-filter-mismatch"`
Enter
Type `echo ""`
Enter
Type `echo "Shall I proceed with the implementation?"`
Enter
Type `echo ""`
Enter
Show
Sleep 4s

# End
Hide
Type `echo "# ✅ Setup complete! Docs: https://github.disney.com/SANCR225/steer-runtime"`
Enter
Show
Sleep 3s
