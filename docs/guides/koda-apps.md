# Koda Apps

Koda includes a built-in app manager for installing, updating, and launching desktop applications distributed through the platform.

---

## Commands

| Command | Description |
|---------|-------------|
| `koda apps` | List all available apps (alias for `koda apps list`) |
| `koda apps list` | List available apps with install status |
| `koda apps search [query]` | Search apps by name or description |
| `koda apps install <name>` | Install an app |
| `koda apps update <name>` | Update an app to the latest version |
| `koda apps start <name>` | Launch an installed app |
| `koda apps uninstall <name>` | Uninstall an app |
| `koda apps status` | Show installed apps and their paths |

---

## Available Apps

| App | Description |
|-----|-------------|
| **kite** | AI-powered desktop companion — KiteStream chat interface with cockpit modules, Jira integration, and profile-based agent management |
| **mouseketool** | Local AWS companion for backend developers — simplifies AWS service interaction for local development workflows |

---

## Usage Examples

```bash
# List all apps
koda apps

# Search for an app
koda apps search kite

# Install an app
koda apps install kite

# Launch it
koda apps start kite

# Check what's installed
koda apps status

# Update to latest
koda apps update kite

# Remove
koda apps uninstall kite
```

---

## How It Works

Apps are distributed as encrypted platform-specific artifacts via GitHub Releases. When you run `koda apps install <name>`, Koda:

1. Resolves the correct artifact for your OS/architecture
2. Downloads the encrypted archive from the app's release repo
3. Decrypts and extracts it to `~/.local/share/koda/apps/<name>/`
4. Makes it launchable via `koda apps start <name>`

Supported platforms: macOS (arm64, amd64), Windows (amd64).
