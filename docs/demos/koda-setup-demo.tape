# Koda Setup Demo — steer-runtime Quick Start
Output koda-setup-demo.gif
Set Shell "bash"
Set FontSize 15
Set Width 1400
Set Height 700
Set Padding 20
Set Theme "Dracula"
Set TypingSpeed 40ms

# Prevent real koda from running
Hide
Type "alias koda=true"
Enter
Type "alias curl=true"
Enter
Type "clear"
Enter
Sleep 300ms
Show

Sleep 1s

# Step 1
Type "curl -fsSL https://raw.githubusercontent.com/rsanchez-disney/Koda/main/install.sh | bash"
Enter
Hide
Type "bash docs/demos/demo-output.sh 1"
Enter
Sleep 300ms
Show
Sleep 3s

# Step 2
Type "koda setup"
Enter
Hide
Type "bash docs/demos/demo-output.sh 2"
Enter
Sleep 300ms
Show
Sleep 3s

# Step 3
Type "koda doctor"
Enter
Hide
Type "bash docs/demos/demo-output.sh 3"
Enter
Sleep 300ms
Show
Sleep 3s

# Step 4
Type "koda install dev qa"
Enter
Hide
Type "bash docs/demos/demo-output.sh 4"
Enter
Sleep 300ms
Show
Sleep 3s

# Step 5
Type "koda"
Enter
Hide
Type "bash docs/demos/demo-output.sh 5"
Enter
Sleep 300ms
Show
Sleep 4s

# Step 6 (tokens - shown as continuation)
Hide
Type "bash docs/demos/demo-output.sh 6"
Enter
Sleep 300ms
Show
Sleep 3s

# Step 7 - koda chat: agent ready
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
Type `echo "  • Implement Jira stories: \"Help me implement DPAY-1234\""`
Enter
Type `echo "  • Coordinate multi-repo features across backend, webapi, ui"`
Enter
Type `echo "  • Run full SDLC: story → plan → implement → review → PR"`
Enter
Type `echo ""`
Enter
Sleep 300ms
Show
Sleep 3s

# User types a prompt
Type "help me implement DPAY-15393"
Enter
Hide
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
Sleep 300ms
Show
Sleep 5s
