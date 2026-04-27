# Kiro CLI vs Kiro UI - When to Use Each

A practical guide to choosing between Kiro CLI and Kiro UI for different development scenarios.

---

## Quick Decision Guide

**Use Kiro CLI when:**
- Working in terminal/command line workflow
- Need quick, focused interactions
- Automating tasks with scripts
- Working on remote servers via SSH
- Prefer keyboard-driven workflow
- Need to pipe output to other tools

**Use Kiro UI when:**
- Need visual context and file browsing
- Working with multiple files simultaneously
- Prefer graphical interface
- Want persistent conversation history
- Need side-by-side code comparison
- Collaborating and sharing sessions

---

## Kiro CLI

### Advantages

**Speed & Efficiency**
- Instant startup, no browser needed
- Fast command execution
- Minimal resource usage
- Quick one-off queries

**Terminal Integration**
- Works in existing terminal workflow
- Easy to pipe output: `kiro-cli chat "analyze error" < error.log`
- Can be scripted and automated
- SSH-friendly for remote work

**Focused Interactions**
- Single conversation thread
- No UI distractions
- Direct, command-line style responses
- Great for quick questions

**Scriptable**
```bash
# Automate repetitive tasks
kiro-cli chat "run tests and summarize results"
kiro-cli chat "check git status and suggest next steps"
```

**Lightweight**
- Low memory footprint
- No browser overhead
- Works on minimal systems
- Fast context switching

### Disadvantages

**Limited Visibility**
- No file tree or visual navigation
- Harder to see multiple files at once
- No syntax highlighting in responses
- Limited conversation history visibility

**Less Context**
- Can't easily browse project structure
- No visual diff tools
- Harder to track multi-file changes
- Limited ability to see "big picture"

**Manual File Management**
- Must specify file paths explicitly
- No drag-and-drop
- Can't easily preview files before reading

**Session Management**
- Conversation ends when terminal closes
- No persistent history across sessions
- Harder to resume previous conversations

---

## Kiro UI

### Advantages

**Visual Context**
- File tree browser for easy navigation
- See project structure at a glance
- Visual file previews
- Syntax-highlighted code display

**Multi-File Workflows**
- Work with multiple files simultaneously
- Side-by-side comparisons
- Visual diff tools
- Easy file switching

**Rich Interface**
- Formatted markdown rendering
- Code blocks with syntax highlighting
- Clickable links and references
- Better error message display

**Persistent History**
- Conversations saved automatically
- Easy to resume previous sessions
- Search through conversation history
- Share sessions with team members

**Better for Complex Tasks**
- Refactoring across multiple files
- Architecture reviews
- Large feature implementations
- Code reviews with visual context

**Collaboration**
- Share UI sessions with team
- Visual demonstrations
- Easier to show work to others
- Better for pair programming

### Disadvantages

**Resource Usage**
- Requires browser (memory overhead)
- Slower startup than CLI
- More system resources needed
- Can be sluggish on large projects

**Less Scriptable**
- Can't easily automate
- No piping or command chaining
- Harder to integrate with shell scripts
- Not suitable for CI/CD pipelines

**Context Switching**
- Requires switching to browser
- Breaks terminal-focused workflow
- Alt-tab overhead
- Can be distracting

**Remote Work**
- Requires port forwarding for SSH
- More complex setup for remote servers
- Higher bandwidth usage
- Latency more noticeable

---

## Use Case Comparison

### Quick Questions & Debugging

**CLI** ✅ Better
```bash
kiro-cli chat "what does this error mean: [error]"
kiro-cli chat "how do I fix merge conflict in pom.xml"
```
- Faster for one-off questions
- No need to leave terminal
- Quick answers, quick exit

**UI** ❌ Overkill
- Too much overhead for simple queries
- Slower to start browser

---

### Feature Implementation (Multi-File)

**CLI** ❌ Limited
- Hard to track changes across files
- No visual context
- Difficult to see relationships

**UI** ✅ Better
- See all affected files in tree
- Visual navigation between components
- Better for understanding architecture
- Easier to review changes before applying

---

### Code Review

**CLI** ❌ Difficult
- No visual diff
- Hard to see context
- Limited formatting

**UI** ✅ Better
- Syntax highlighting
- Visual diffs
- Easy file navigation
- Better for detailed review

---

### Automation & Scripting

**CLI** ✅ Better
```bash
#!/bin/bash
# Automated test analysis
kiro-cli chat "run tests and create summary" > test-report.md
```
- Scriptable
- Pipeable
- CI/CD integration

**UI** ❌ Not Suitable
- Can't be scripted
- No automation support

---

### Learning Codebase

**CLI** ❌ Limited
- Must know file paths
- No visual exploration
- Harder to discover structure

**UI** ✅ Better
- Browse file tree
- Visual exploration
- See project structure
- Easier discovery

---

### Remote Server Work (SSH)

**CLI** ✅ Better
```bash
ssh server
kiro-cli chat "check logs for errors"
```
- Works directly over SSH
- No port forwarding needed
- Low bandwidth
- Fast response

**UI** ❌ Complex
- Requires port forwarding
- Higher latency
- More bandwidth
- Setup overhead

---

### Pair Programming / Collaboration

**CLI** ❌ Limited
- Hard to share terminal session
- No visual context for others
- Difficult to demonstrate

**UI** ✅ Better
- Easy to share screen
- Visual context for team
- Better for demonstrations
- Persistent session to share

---

## Hybrid Workflow Recommendations

### Scenario 1: Feature Development

1. **Start with UI** - Plan and explore
   - Review story requirements
   - Explore codebase structure
   - Identify files to change

2. **Switch to CLI** - Quick iterations
   - Fast edits and tests
   - Quick error checks
   - Rapid feedback loop

3. **Return to UI** - Final review
   - Review all changes
   - Create PR description
   - Document implementation

### Scenario 2: Bug Investigation

1. **Start with CLI** - Quick diagnosis
   ```bash
   kiro-cli chat "analyze this stack trace: [trace]"
   ```

2. **Switch to UI if complex** - Deep dive
   - If bug spans multiple files
   - If need to understand architecture
   - If need visual debugging

### Scenario 3: Daily Development

**Morning Planning** - Use UI
- Review tasks
- Plan implementation
- Explore new areas

**Active Coding** - Use CLI
- Quick questions
- Fast iterations
- Error debugging

**End of Day** - Use UI
- Review changes
- Create PR
- Document work

---

## Performance Comparison

| Aspect | CLI | UI |
|--------|-----|-----|
| Startup Time | < 1 second | 3-5 seconds |
| Memory Usage | ~50MB | ~200-500MB |
| Response Time | Fast | Moderate |
| File Navigation | Manual | Visual |
| Multi-tasking | Easy | Requires switching |
| Scriptable | Yes | No |
| Visual Context | Limited | Excellent |
| History | Session only | Persistent |

---

## Best Practices

### For CLI Users

**Do:**
- Use for quick questions and debugging
- Script repetitive tasks
- Integrate with terminal workflow
- Use for remote server work

**Don't:**
- Try to manage complex multi-file changes
- Use for visual code reviews
- Expect persistent conversation history
- Use when you need to explore unknown codebase

### For UI Users

**Do:**
- Use for feature implementation
- Use for code reviews
- Use for learning new codebases
- Use for collaboration

**Don't:**
- Use for simple one-off questions
- Use in automated scripts
- Use when CLI would be faster
- Keep open if not actively using (resource usage)

---

## Migration Between Tools

### CLI → UI
When to switch:
- Task becomes more complex than expected
- Need to see multiple files
- Need visual context
- Want to save conversation

### UI → CLI
When to switch:
- Need to automate
- Want faster iterations
- Working in terminal already
- Need to script the interaction

---

## Summary

**Kiro CLI**: Fast, lightweight, scriptable - perfect for terminal-focused developers and quick interactions

**Kiro UI**: Visual, persistent, collaborative - ideal for complex tasks and team work

**Best Approach**: Use both! CLI for speed and automation, UI for complexity and collaboration.

---

**Recommendation**: Start with CLI for daily work. Switch to UI when you need visual context or are working on complex multi-file features. Use CLI for automation and scripting.
