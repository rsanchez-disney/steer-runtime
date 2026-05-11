#Requires -Version 5.1
<#
.SYNOPSIS
    Install steer-runtime steering, skills, hooks, and MCP servers for Kiro IDE on Windows.

    Steering and skills install to user-level (~/.kiro/) so they apply to all workspaces
    without polluting project repos. Hooks install to the workspace (.kiro/hooks/) since
    Kiro IDE only supports workspace-level hooks, and are auto-added to .gitignore.

.NOTES
    If you get a PSSecurityException ("running scripts is disabled"), run:
      Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
    Or bypass for a single run:
      powershell -ExecutionPolicy Bypass -File setup-kiro-ide.ps1 install .

.EXAMPLE
    .\setup-kiro-ide.ps1 install .
    .\setup-kiro-ide.ps1 install C:\Users\me\Projects\my-app
    .\setup-kiro-ide.ps1 sync
    .\setup-kiro-ide.ps1 remove .
#>

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    [Parameter(Position=1)]
    [string]$TargetDir,
    [Parameter(Position=2, ValueFromRemainingArguments)]
    [string[]]$Profiles
)

$ErrorActionPreference = "Stop"
$SteerRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$KiroHome = Join-Path $env:USERPROFILE ".kiro"

# --- Deprecation Warning ---
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║  ⚠️  DEPRECATED — This script is deprecated. Use Koda instead.  ║" -ForegroundColor Yellow
Write-Host "║                                                                  ║" -ForegroundColor Yellow
Write-Host "║  Install: irm https://koda.wdprapps.disney.com/install.ps1 | iex ║" -ForegroundColor Yellow
Write-Host "║  Then:    koda install dev                                        ║" -ForegroundColor Yellow
Write-Host "║                                                                  ║" -ForegroundColor Yellow
Write-Host "║  This script will be removed in a future release.                ║" -ForegroundColor Yellow
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""

function Show-Help {
    Write-Host @'

  steer-runtime Kiro IDE Setup (Windows)

  USAGE:
    .\setup-kiro-ide.ps1 install <project-dir> [profiles...]
    .\setup-kiro-ide.ps1 sync [profiles...]
    .\setup-kiro-ide.ps1 list
    .\setup-kiro-ide.ps1 remove <project-dir>

  PROFILES:
    dev             All dev agents (alias -> dev-core + dev-web + dev-mobile + dev-python + dev-ai + dev-infra + dev-dotnet + dev-php + dev-ui)
    dev-core        Orchestrator + planning + quality + workflow
    dev-web         Backend + WebAPI + UI + UX specialist
    dev-mobile      Flutter + Android + iOS
    dev-python      Python specialist
    dev-infra       Terraform/IaC specialist
    ba              Business Analyst / Product Owner
    qa              QA / Testing
    ops             Operations
    pm              PM / Scrum Master

    If no profiles are specified, an interactive menu is shown.

  WHERE THINGS GO:
    Steering + Skills  -> ~/.kiro/          (user-level, all workspaces)
    MCP servers        -> ~/.kiro/          (user-level, all workspaces)
    Hooks              -> <project>/.kiro/  (workspace, auto-gitignored)

  EXAMPLES:
    .\setup-kiro-ide.ps1 install . dev-core dev-web
    .\setup-kiro-ide.ps1 install . dev
    .\setup-kiro-ide.ps1 install C:\Projects\my-app ba qa
    .\setup-kiro-ide.ps1 install .                          # interactive menu
    .\setup-kiro-ide.ps1 sync
    .\setup-kiro-ide.ps1 sync dev-core
    .\setup-kiro-ide.ps1 list

  TROUBLESHOOTING:
    "running scripts is disabled" error:
      Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
    Or bypass for one run:
      powershell -ExecutionPolicy Bypass -File setup-kiro-ide.ps1 install .

'@
}

function Find-NodeExe {
    # Try stable fnm path first (not the ephemeral multishell symlinks)
    $fnmVersions = "$env:APPDATA\fnm\node-versions"
    if (Test-Path $fnmVersions) {
        $latest = Get-ChildItem $fnmVersions -Directory | Where-Object { $_.Name -match '^v\d' } | Sort-Object Name -Descending | Select-Object -First 1
        if ($latest) {
            $candidate = Join-Path $latest.FullName "installation\node.exe"
            if (Test-Path $candidate) { return $candidate }
        }
    }
    # Try PATH (may be nvm-windows, direct install, or fnm multishell)
    $cmd = Get-Command node -ErrorAction SilentlyContinue
    if ($cmd) {
        $source = $cmd.Source
        if ($source -notmatch 'fnm_multishells') { return $source }
    }
    $pf = "C:\Program Files\nodejs\node.exe"
    if (Test-Path $pf) { return $pf }
    return $null
}

function Find-UvxExe {
    $cmd = Get-Command uvx -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $local = "$env:USERPROFILE\.local\bin\uvx.exe"
    if (Test-Path $local) { return $local }
    return $null
}

# --- Profile helpers ---

# All known profile names (auto-discovered from profiles/ directory)
function Get-AvailableProfiles {
    $profilesDir = Join-Path $SteerRoot "profiles"
    if (Test-Path $profilesDir) {
        Get-ChildItem $profilesDir -Directory | Where-Object { $_.Name -ne "steer-master" } | ForEach-Object { $_.Name }
    }
}

# Expand the "dev" alias into its sub-profiles, deduplicate
function Expand-ProfileAliases([string[]]$InputProfiles) {
    $expanded = @()
    foreach ($p in $InputProfiles) {
        if ($p -eq "dev") {
            $expanded += @("dev-core","dev-web","dev-mobile","dev-python","dev-ai","dev-infra","dev-dotnet","dev-php","dev-ui")
        } else {
            $expanded += $p
        }
    }
    # Deduplicate preserving order
    $seen = @{}
    $result = @()
    foreach ($p in $expanded) {
        if (-not $seen.ContainsKey($p)) {
            $seen[$p] = $true
            $result += $p
        }
    }
    return $result
}

# Display formatted profile list with steering/skills tags
function Format-ProfileList([switch]$Numbered) {
    $available = @(Get-AvailableProfiles)
    if ($Numbered) {
        Write-Host "  0) dev  (alias -> all dev-* profiles)" -ForegroundColor White
    } else {
        Write-Host "  dev  (alias -> all dev-* profiles)" -ForegroundColor White
    }
    for ($i = 0; $i -lt $available.Count; $i++) {
        $profile = $available[$i]
        $steeringExists = Test-Path (Join-Path $SteerRoot "profiles\$profile\steering")
        $skillsExists   = Test-Path (Join-Path $SteerRoot "profiles\$profile\skills")
        $tags = @()
        if ($steeringExists) { $tags += "steering" }
        if ($skillsExists)   { $tags += "skills" }
        $tagStr = if ($tags.Count -gt 0) { " [$($tags -join ', ')]" } else { "" }
        if ($Numbered) {
            Write-Host "  $($i+1)) $profile$tagStr" -ForegroundColor White
        } else {
            Write-Host "  $profile$tagStr" -ForegroundColor White
        }
    }
}

# Interactive profile picker when none specified
function Select-ProfilesInteractive {
    if (-not [Environment]::UserInteractive) {
        Write-Host "X No profiles specified and running non-interactively. Pass profiles as arguments." -ForegroundColor Red
        exit 1
    }
    $available = @(Get-AvailableProfiles)
    Write-Host "`nAvailable profiles:" -ForegroundColor Cyan
    Format-ProfileList -Numbered
    Write-Host ""
    $selection = Read-Host "Enter profile numbers separated by commas (e.g. 0,1,3) or profile names"
    if ([string]::IsNullOrWhiteSpace($selection)) {
        Write-Host "No profiles selected. Aborting." -ForegroundColor Yellow
        return @()
    }
    $selected = @()
    foreach ($token in ($selection -split ',')) {
        $token = $token.Trim()
        if ($token -match '^\d+$') {
            $idx = [int]$token
            if ($idx -eq 0) { $selected += "dev" }
            elseif ($idx -ge 1 -and $idx -le $available.Count) { $selected += $available[$idx - 1] }
            else { Write-Host "  Skipping invalid index: $idx" -ForegroundColor Yellow }
        } else {
            $selected += $token
        }
    }
    return $selected
}

function Install-Steering([string[]]$SelectedProfiles) {
    $steeringDir = Join-Path $KiroHome "steering"
    New-Item -ItemType Directory -Force -Path $steeringDir | Out-Null
    $count = 0
    foreach ($profile in $SelectedProfiles) {
        $profileSteeringDir = Join-Path $SteerRoot "profiles\$profile\steering"
        if (Test-Path $profileSteeringDir) {
            Get-ChildItem "$profileSteeringDir\*.md" | ForEach-Object {
                Copy-Item $_.FullName "$steeringDir\" -Force
                Write-Host "  OK steering\$($_.Name)  [$profile]" -ForegroundColor Green
                $count++
            }
        }
    }
    if ($count -eq 0) {
        Write-Host "  (no steering files found for selected profiles)" -ForegroundColor Yellow
    } else {
        Write-Host "$count steering files -> $steeringDir" -ForegroundColor Green
    }
    return $count
}

function Install-Skills([string[]]$SelectedProfiles) {
    $skillsDir = Join-Path $KiroHome "skills"
    New-Item -ItemType Directory -Force -Path $skillsDir | Out-Null
    $count = 0
    # Always install common skills
    $commonSkills = "$SteerRoot\common\skills"
    if (Test-Path $commonSkills) {
        Get-ChildItem "$commonSkills\*.md" | Where-Object { $_.Name -ne "README.md" } | ForEach-Object {
            Copy-Item $_.FullName "$skillsDir\" -Force
            Write-Host "  OK skills\$($_.Name)  [common]" -ForegroundColor Green
            $count++
        }
    }
    # Install profile-specific skills
    foreach ($profile in $SelectedProfiles) {
        $profileSkillsDir = Join-Path $SteerRoot "profiles\$profile\skills"
        if (Test-Path $profileSkillsDir) {
            Get-ChildItem "$profileSkillsDir\*.md" | ForEach-Object {
                Copy-Item $_.FullName "$skillsDir\" -Force
                Write-Host "  OK skills\$($_.Name)  [$profile]" -ForegroundColor Green
                $count++
            }
        }
    }
    Write-Host "$count skills -> $skillsDir" -ForegroundColor Green
    return $count
}

function Install-Hooks($dir) {
    $hooksDir = Join-Path $dir ".kiro\hooks"
    New-Item -ItemType Directory -Force -Path $hooksDir | Out-Null
    $count = 0
    $hookDefs = @(
        @{ File = "guard-writes.kiro.hook"; Content = '{"name":"Guard Sensitive Paths","version":"1.0.0","description":"Blocks file writes to node_modules/, dist/, and .git/ directories.","when":{"type":"preToolUse","toolTypes":["write"]},"then":{"type":"askAgent","prompt":"Check if the file being written is inside node_modules/, dist/, or .git/ directories. If it is, REFUSE to proceed."}}' },
        @{ File = "secret-scan.kiro.hook"; Content = '{"name":"Secret Scan on Write","version":"1.0.0","description":"Scans for hardcoded secrets before writing files.","when":{"type":"preToolUse","toolTypes":["write"]},"then":{"type":"askAgent","prompt":"Scan the content being written for potential hardcoded secrets. If a real secret is detected, REFUSE the write and instruct to use environment variables instead."}}' },
        @{ File = "branch-guard.kiro.hook"; Content = '{"name":"Branch Guard","version":"1.0.0","description":"Blocks direct git commit, push, or merge on main/master branch.","when":{"type":"preToolUse","toolTypes":["shell"]},"then":{"type":"askAgent","prompt":"Check if the shell command involves git commit, git push, or git merge. If the current branch is main or master, REFUSE and instruct to use a feature branch. Read-only git commands are always allowed."}}' },
        @{ File = "warn-destructive.kiro.hook"; Content = '{"name":"Warn on Destructive Commands","version":"1.0.0","description":"Warns after destructive commands like rm -rf, DROP TABLE, or --force.","when":{"type":"postToolUse","toolTypes":["shell"]},"then":{"type":"askAgent","prompt":"If the command contained destructive patterns like rm -rf, DROP TABLE, DELETE FROM, or --force, warn the user. Otherwise do nothing."}}' }
    )
    foreach ($hook in $hookDefs) {
        $json = $hook.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
        Set-Content -Path (Join-Path $hooksDir $hook.File) -Value $json -Encoding UTF8
        Write-Host "  OK hooks\$($hook.File)" -ForegroundColor Green
        $count++
    }
    Write-Host "$count hooks -> $hooksDir" -ForegroundColor Green

    # Auto-add hooks to .gitignore
    $gitignore = Join-Path $dir ".gitignore"
    $hookPattern = ".kiro/hooks/"
    $needsAdd = $true
    if (Test-Path $gitignore) {
        $lines = Get-Content $gitignore
        if ($lines -contains $hookPattern -or $lines -contains ".kiro/hooks") { $needsAdd = $false }
    }
    if ($needsAdd) {
        Add-Content -Path $gitignore -Value "`n# Kiro IDE hooks (workspace-level, not committed)`n$hookPattern"
        Write-Host "  OK added $hookPattern to .gitignore" -ForegroundColor Green
    }
    return $count
}

function Install-McpServers {
    Write-Host "`nConfiguring MCP servers (user-level)..."
    $mcpBundleDir = Join-Path $KiroHome "tools\mcp-servers"
    $servers = @("bruno-mcp","confluence-mcp","github-mcp","jira-mcp","mermaid-diagram-mcp")
    $bundleCount = 0
    foreach ($s in $servers) {
        $src = "$SteerRoot\shared\tools\mcp-servers\$s\dist\index.cjs"
        $dest = "$mcpBundleDir\$s\dist"
        if (Test-Path $src) {
            New-Item -ItemType Directory -Force -Path $dest | Out-Null
            Copy-Item $src "$dest\index.cjs" -Force
            $bundleCount++
        }
    }
    Write-Host "  OK $bundleCount MCP bundles copied" -ForegroundColor Green

    $nodePath = Find-NodeExe
    if (-not $nodePath) {
        Write-Host "  WARNING: node.exe not found. Using 'node' - you may need to replace with full path." -ForegroundColor Yellow
        $nodePath = "node"
    } else {
        Write-Host "  OK node: $nodePath" -ForegroundColor Green
    }

    $uvxPath = Find-UvxExe
    $mcpConfig = [ordered]@{ mcpServers = [ordered]@{} }

    if ($uvxPath) {
        $mcpConfig.mcpServers["fetch"] = [ordered]@{ command = $uvxPath; args = @("mcp-server-fetch"); env = @{}; disabled = $false; autoApprove = @() }
        Write-Host "  OK fetch (uvx)" -ForegroundColor Green
    } else {
        Write-Host "  SKIP fetch (uvx not found - install uv to enable)" -ForegroundColor Yellow
    }

    $mcpConfig.mcpServers["bruno"] = [ordered]@{ command = $nodePath; args = @("$mcpBundleDir\bruno-mcp\dist\index.cjs") }
    $mcpConfig.mcpServers["confluence-confluence"] = [ordered]@{ command = $nodePath; args = @("$mcpBundleDir\confluence-mcp\dist\index.cjs"); env = [ordered]@{ CONFLUENCE_INSTANCE_PREFIX = "confluence_"; CONFLUENCE_PAT = ""; CONFLUENCE_URL = "https://confluence.disney.com" } }
    $mcpConfig.mcpServers["github"] = [ordered]@{ command = $nodePath; args = @("$mcpBundleDir\github-mcp\dist\index.cjs"); env = [ordered]@{ GITHUB_HOST = "github.disney.com"; GITHUB_TOKEN = ""; GITHUB_API_PATH = "/api/v3" } }
    $mcpConfig.mcpServers["jira"] = [ordered]@{ command = $nodePath; args = @("$mcpBundleDir\jira-mcp\dist\index.cjs"); env = [ordered]@{ JIRA_PAT = "" } }
    $mcpConfig.mcpServers["mermaid"] = [ordered]@{ command = $nodePath; args = @("$mcpBundleDir\mermaid-diagram-mcp\dist\index.cjs") }
    $mcpConfig.mcpServers["confluence-mywiki"] = [ordered]@{ command = $nodePath; args = @("$mcpBundleDir\confluence-mcp\dist\index.cjs"); env = [ordered]@{ CONFLUENCE_INSTANCE_PREFIX = "mywiki_"; CONFLUENCE_PAT = ""; CONFLUENCE_URL = "https://mywiki.disney.com" } }

    $mcpJsonPath = Join-Path $KiroHome "settings\mcp.json"
    New-Item -ItemType Directory -Force -Path (Split-Path $mcpJsonPath) | Out-Null
    $mcpConfig | ConvertTo-Json -Depth 5 | Set-Content $mcpJsonPath -Encoding UTF8
    Write-Host "  OK $mcpJsonPath" -ForegroundColor Green

    Write-Host "`nAdd your tokens to: $mcpJsonPath" -ForegroundColor Yellow
    Write-Host "  Jira:       https://myjira.disney.com/secure/ViewProfile.jspa?selectedTab=com.atlassian.pats.pats-plugin:jira-user-personal-access-tokens"
    Write-Host "  Confluence: https://confluence.disney.com/plugins/personalaccesstokens/usertokens.action"
    Write-Host "  MyWiki:     https://mywiki.disney.com/plugins/personalaccesstokens/usertokens.action"
    Write-Host "  GitHub:     https://github.disney.com/settings/tokens"
    return $bundleCount
}

# --- Main ---
switch ($Command) {
    "install" {
        if (-not $TargetDir) { Write-Host "X Usage: .\setup-kiro-ide.ps1 install <project-dir> [profiles...]" -ForegroundColor Red; exit 1 }
        $TargetDir = [System.IO.Path]::GetFullPath($TargetDir)
        if (-not (Test-Path $TargetDir -PathType Container)) { Write-Host "X Directory not found: $TargetDir" -ForegroundColor Red; exit 1 }

        # Resolve profiles: from args, or interactive picker
        if ($Profiles -and $Profiles.Count -gt 0) {
            $selectedProfiles = Expand-ProfileAliases $Profiles
        } else {
            $picked = Select-ProfilesInteractive
            if ($picked.Count -eq 0) { exit 0 }
            $selectedProfiles = Expand-ProfileAliases $picked
        }

        # Validate profiles exist
        $available = @(Get-AvailableProfiles)
        foreach ($p in $selectedProfiles) {
            if ($p -notin $available) {
                Write-Host "X Unknown profile: $p" -ForegroundColor Red
                Write-Host "  Available: $($available -join ', ')" -ForegroundColor Yellow
                exit 1
            }
        }

        Write-Host "Installing Kiro IDE config for profiles: $($selectedProfiles -join ', ')`n"
        Write-Host "User-level (all workspaces):" -ForegroundColor Cyan
        Install-Steering $selectedProfiles | Out-Null
        Install-Skills $selectedProfiles | Out-Null

        Write-Host "`nWorkspace-level ($TargetDir):" -ForegroundColor Cyan
        Install-Hooks $TargetDir | Out-Null

        Install-McpServers | Out-Null
        Write-Host "`nDone." -ForegroundColor Green
    }

    "sync" {
        # Profiles can be passed as TargetDir + remaining args, or just remaining args
        $syncProfiles = @()
        if ($TargetDir) { $syncProfiles += $TargetDir }
        if ($Profiles) { $syncProfiles += $Profiles }

        if ($syncProfiles.Count -eq 0) {
            $picked = Select-ProfilesInteractive
            if ($picked.Count -eq 0) { exit 0 }
            $syncProfiles = $picked
        }
        $syncProfiles = Expand-ProfileAliases $syncProfiles

        # Validate profiles exist
        $available = @(Get-AvailableProfiles)
        foreach ($p in $syncProfiles) {
            if ($p -notin $available) {
                Write-Host "X Unknown profile: $p" -ForegroundColor Red
                Write-Host "  Available: $($available -join ', ')" -ForegroundColor Yellow
                exit 1
            }
        }

        Write-Host "Syncing user-level steering and skills for: $($syncProfiles -join ', ')`n"
        Install-Steering $syncProfiles | Out-Null
        Install-Skills $syncProfiles | Out-Null
        Write-Host "`nDone." -ForegroundColor Green
    }

    "list" {
        Write-Host "`nAvailable profiles:" -ForegroundColor Cyan
        Format-ProfileList
        Write-Host ""
    }

    "remove" {
        if (-not $TargetDir) { Write-Host "X Usage: .\setup-kiro-ide.ps1 remove <project-dir>" -ForegroundColor Red; exit 1 }
        $TargetDir = [System.IO.Path]::GetFullPath($TargetDir)
        $removed = 0
        # Only remove workspace hooks (steering/skills are user-level)
        $hooksPath = "$TargetDir\.kiro\hooks"
        if (Test-Path $hooksPath) {
            Remove-Item -Recurse -Force $hooksPath
            Write-Host "  Removed $hooksPath" -ForegroundColor Yellow
            $removed++
        }
        if ($removed -eq 0) { Write-Host "Nothing to remove from workspace" -ForegroundColor Yellow }
        else { Write-Host "Removed workspace hooks. User-level steering/skills in ~/.kiro/ were not touched." -ForegroundColor Green }
    }

    default { Show-Help }
}
