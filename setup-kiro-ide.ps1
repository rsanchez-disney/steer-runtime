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
    [string]$TargetDir
)

$ErrorActionPreference = "Stop"
$SteerRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$KiroHome = Join-Path $env:USERPROFILE ".kiro"

function Show-Help {
    Write-Host @'

  steer-runtime Kiro IDE Setup (Windows)

  USAGE:
    .\setup-kiro-ide.ps1 install <project-dir>   Full setup: steering, skills, hooks, MCP
    .\setup-kiro-ide.ps1 sync                     Update user-level steering and skills
    .\setup-kiro-ide.ps1 remove <project-dir>     Remove workspace hooks

  WHERE THINGS GO:
    Steering + Skills  -> ~/.kiro/          (user-level, all workspaces)
    MCP servers        -> ~/.kiro/          (user-level, all workspaces)
    Hooks              -> <project>/.kiro/  (workspace, auto-gitignored)

  EXAMPLES:
    .\setup-kiro-ide.ps1 install .
    .\setup-kiro-ide.ps1 install C:\Projects\my-app
    .\setup-kiro-ide.ps1 sync

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

function Install-Steering {
    $steeringDir = Join-Path $KiroHome "steering"
    New-Item -ItemType Directory -Force -Path $steeringDir | Out-Null
    $count = 0
    foreach ($profileDir in @("$SteerRoot\profiles\dev-core\steering", "$SteerRoot\profiles\dev-web\steering")) {
        if (Test-Path $profileDir) {
            Get-ChildItem "$profileDir\*.md" | ForEach-Object {
                Copy-Item $_.FullName "$steeringDir\" -Force
                Write-Host "  OK steering\$($_.Name)" -ForegroundColor Green
                $count++
            }
        }
    }
    Write-Host "$count steering files -> $steeringDir" -ForegroundColor Green
    return $count
}

function Install-Skills {
    $skillsDir = Join-Path $KiroHome "skills"
    New-Item -ItemType Directory -Force -Path $skillsDir | Out-Null
    $count = 0
    $commonSkills = "$SteerRoot\common\skills"
    if (Test-Path $commonSkills) {
        Get-ChildItem "$commonSkills\*.md" | Where-Object { $_.Name -ne "README.md" } | ForEach-Object {
            Copy-Item $_.FullName "$skillsDir\" -Force
            Write-Host "  OK skills\$($_.Name)" -ForegroundColor Green
            $count++
        }
    }
    $webSkills = "$SteerRoot\profiles\dev-web\skills"
    if (Test-Path $webSkills) {
        Get-ChildItem "$webSkills\*.md" | ForEach-Object {
            Copy-Item $_.FullName "$skillsDir\" -Force
            Write-Host "  OK skills\$($_.Name)" -ForegroundColor Green
            $count++
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
    $mcpConfig.mcpServers["confluence"] = [ordered]@{ command = $nodePath; args = @("$mcpBundleDir\confluence-mcp\dist\index.cjs"); env = [ordered]@{ CONFLUENCE_PAT = ""; CONFLUENCE_URL = "https://confluence.disney.com" } }
    $mcpConfig.mcpServers["github"] = [ordered]@{ command = $nodePath; args = @("$mcpBundleDir\github-mcp\dist\index.cjs"); env = [ordered]@{ GITHUB_HOST = "github.disney.com"; GITHUB_TOKEN = ""; GITHUB_API_PATH = "/api/v3" } }
    $mcpConfig.mcpServers["jira"] = [ordered]@{ command = $nodePath; args = @("$mcpBundleDir\jira-mcp\dist\index.cjs"); env = [ordered]@{ JIRA_PAT = "" } }
    $mcpConfig.mcpServers["mermaid"] = [ordered]@{ command = $nodePath; args = @("$mcpBundleDir\mermaid-diagram-mcp\dist\index.cjs") }
    $mcpConfig.mcpServers["mywiki"] = [ordered]@{ command = $nodePath; args = @("$mcpBundleDir\confluence-mcp\dist\index.cjs"); env = [ordered]@{ CONFLUENCE_PAT = ""; CONFLUENCE_URL = "https://mywiki.disney.com" } }

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
        if (-not $TargetDir) { Write-Host "X Usage: .\setup-kiro-ide.ps1 install <project-dir>" -ForegroundColor Red; exit 1 }
        $TargetDir = [System.IO.Path]::GetFullPath($TargetDir)
        if (-not (Test-Path $TargetDir -PathType Container)) { Write-Host "X Directory not found: $TargetDir" -ForegroundColor Red; exit 1 }

        Write-Host "Installing Kiro IDE config`n"
        Write-Host "User-level (all workspaces):" -ForegroundColor Cyan
        Install-Steering | Out-Null
        Install-Skills | Out-Null

        Write-Host "`nWorkspace-level ($TargetDir):" -ForegroundColor Cyan
        Install-Hooks $TargetDir | Out-Null

        Install-McpServers | Out-Null
        Write-Host "`nDone." -ForegroundColor Green
    }

    "sync" {
        Write-Host "Syncing user-level steering and skills`n"
        Install-Steering | Out-Null
        Install-Skills | Out-Null
        Write-Host "`nDone." -ForegroundColor Green
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
