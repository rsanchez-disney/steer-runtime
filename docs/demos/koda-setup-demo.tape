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

# Step 7
Type "koda chat"
Enter
Hide
Type "bash docs/demos/demo-output.sh 7"
Enter
Sleep 300ms
Show
Sleep 5s
