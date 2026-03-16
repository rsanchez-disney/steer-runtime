# Common Rules

Shared coding rules that can be installed to any project.

## Available Rules

| Rule | Description |
|------|-------------|
| `conventional_commit.md` | Conventional Commits 1.0.0 specification for commit messages |
| `general-java-development.md` | SOLID, DRY, KISS, YAGNI principles + OWASP best practices |

## Installation

```bash
./setup.sh rules list                              # List available rules
./setup.sh rules install --all                     # Install all to ~/.kiro/rules/
./setup.sh rules install conventional_commit       # Install specific rule
./setup.sh rules install --all --project ~/myapp   # Install to project
```

## Adding New Rules

1. Create a `.md` file in this directory
2. Run `./setup.sh rules list` to verify it appears
3. Install to your project
