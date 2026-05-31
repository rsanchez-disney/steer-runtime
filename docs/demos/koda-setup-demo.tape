# Koda Setup Demo — steer-runtime Quick Start
# Generates: koda-setup-demo.gif

Output koda-setup-demo.gif
Set Shell "bash"
Set FontSize 15
Set Width 1400
Set Height 700
Set Padding 20
Set Theme "Dracula"
Set TypingSpeed 50ms

# Title
Type "# Koda + steer-runtime — Quick Start Setup"
Enter
Sleep 1s
Type ""
Enter

# Step 1: Install Koda
Type "echo '═══ Step 1: Install Koda ═══'"
Enter
Sleep 1s
Type "curl -fsSL https://raw.githubusercontent.com/rsanchez-disney/Koda/main/install.sh | bash"
Enter
Sleep 2s
Type "   Installing Koda..."
Enter
Type "   OS: darwin  Arch: arm64"
Enter
Sleep 1s
Type "   Version: v0.4.28"
Enter
Type "   Installed: /Users/dev/.local/bin/koda"
Enter
Sleep 2s

# Step 2: Setup
Type ""
Enter
Type "echo '═══ Step 2: Run Setup ═══'"
Enter
Sleep 1s
Type "koda setup"
Enter
Sleep 1.5s
Type "🔍 Checking dependencies..."
Enter
Sleep 500ms
Type "  ✓ kiro-cli       2.2.1"
Enter
Type "  ✓ node           v20.19.5"
Enter
Type "  ✓ git            2.44.0"
Enter
Type "  ✓ gh             2.62.0"
Enter
Sleep 500ms
Type "  ✓ yax"
Enter
Type "  ✓ prompt-scorer"
Enter
Sleep 1s
Type ""
Enter
Type "✅ All dependencies installed"
Enter
Sleep 2s

# Step 3: Doctor
Type ""
Enter
Type "echo '═══ Step 3: Verify ═══'"
Enter
Sleep 1s
Type "koda doctor"
Enter
Sleep 1s
Type "  ✓ kiro-cli        2.2.1 (/usr/local/bin/kiro-cli)"
Enter
Type "  ✓ steer-runtime   v0.2.106 (synced)"
Enter
Type "  ✓ mcp.json        10 servers configured"
Enter
Type "  ✓ yax             running (142 observations)"
Enter
Type "  ✓ prompt-scorer   installed"
Enter
Sleep 1s
Type ""
Enter
Type "✅ All checks passed"
Enter
Sleep 2s

# Step 4: Install Profiles
Type ""
Enter
Type "echo '═══ Step 4: Install Profiles ═══'"
Enter
Sleep 1s
Type "koda install dev qa"
Enter
Sleep 1.5s
Type "📦 Installing profiles: dev-core, dev-web, dev-mobile, qa"
Enter
Sleep 500ms
Type "  ✓ dev-core (21 agents)"
Enter
Type "  ✓ dev-web (5 agents)"
Enter
Type "  ✓ dev-mobile (3 agents)"
Enter
Type "  ✓ qa (16 agents)"
Enter
Sleep 500ms
Type ""
Enter
Type "✅ 4 profiles installed — 45 agents available"
Enter
Sleep 2s

# Step 5: Select Workspace
Type ""
Enter
Type "echo '═══ Step 5: Select Workspace ═══'"
Enter
Sleep 1s
Type "koda"
Enter
Sleep 1s
Type "┌─────────────────────────────────────────┐"
Enter
Type "│  Koda v0.4.28          [w] Workspaces   │"
Enter
Type "│                        [p] Profiles      │"
Enter
Type "│  Workspace: (none)     [t] Tokens        │"
Enter
Type "│  Profile: dev-core     [m] MCP           │"
Enter
Type "│  Agents: 45            [enter] Chat      │"
Enter
Type "└─────────────────────────────────────────┘"
Enter
Sleep 2s
Type "w"
Sleep 1s
Enter
Type ""
Enter
Type "  Select workspace:"
Enter
Type "  > app-team/app-payment-controls"
Enter
Type "    app-team/app-config-studio"
Enter
Type "    pos-team"
Enter
Type "    commerce-ticketing"
Enter
Type "    sustainment/sustainment-beast"
Enter
Sleep 1.5s
Type ""
Enter
Type "✅ Workspace: app-payment-controls (DPAY)"
Enter
Sleep 2s

# Step 6: Configure Tokens
Type ""
Enter
Type "echo '═══ Step 6: Configure Tokens ═══'"
Enter
Sleep 1s
Type "# Press [t] in Koda or configure manually:"
Enter
Sleep 500ms
Type ""
Enter
Type "koda configure"
Enter
Sleep 1s
Type ""
Enter
Type "━━━ Jira PAT ━━━"
Enter
Type "  Instance: myjira.disney.com"
Enter
Type "  Token: ●●●●●●●●●●●●●●●●●●●●"
Enter
Type "  ✓ Saved to ~/.kiro/tokens.env"
Enter
Sleep 1s
Type ""
Enter
Type "━━━ GitHub PAT ━━━"
Enter
Type "  Instance: github.disney.com"
Enter
Type "  Token: ●●●●●●●●●●●●●●●●●●●●"
Enter
Type "  ✓ Saved to ~/.kiro/tokens.env"
Enter
Sleep 1s
Type ""
Enter
Type "━━━ Confluence PAT ━━━"
Enter
Type "  Instance: mywiki.disney.com"
Enter
Type "  Token: ●●●●●●●●●●●●●●●●●●●●"
Enter
Type "  ✓ Saved to ~/.kiro/tokens.env"
Enter
Sleep 1s
Type ""
Enter
Type "✅ 3 tokens configured — MCP servers generated"
Enter
Sleep 2s

# Step 7: Start Chatting
Type ""
Enter
Type "echo '═══ Step 7: Start Chatting ═══'"
Enter
Sleep 1s
Type "koda chat"
Enter
Sleep 1.5s
Type ""
Enter
Type "👋 Ready to orchestrate your development workflow!"
Enter
Type ""
Enter
Type "I can help you:"
Enter
Type "  • Implement Jira stories"
Enter
Type "  • Coordinate multi-repo features"
Enter
Type "  • Run full SDLC: story → plan → implement → review → PR"
Enter
Sleep 2s
Type ""
Enter
Type "> help me implement DPAY-15393"
Enter
Sleep 2s
Type ""
Enter
Type "📋 Analyzing DPAY-15393..."
Enter
Type "   Fetching story details from myjira.disney.com..."
Enter
Type "   Exploring codebase for relevant files..."
Enter
Sleep 1.5s
Type ""
Enter
Type "## Implementation Plan"
Enter
Type "1. Update filterData.decorator.ts — fix field name mismatch"
Enter
Type "2. Add unit tests for date filter"
Enter
Type "3. Create PR with conventional commit"
Enter
Sleep 3s

# End
Type ""
Enter
Type "# ✅ Setup complete! Full docs: https://github.disney.com/SANCR225/steer-runtime"
Enter
Sleep 3s
