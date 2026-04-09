#Requires -Version 5.1
<#
.SYNOPSIS
    Install steer-runtime steering, skills, hooks, and MCP servers for Kiro IDE on Windows.
.EXAMPLE
    .\setup-kiro-ide.ps1 install .
    .\setup-kiro-ide.ps1 install C:\Users\me\Projects\my-app
    .\setup-kiro-ide.ps1 sync .
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

function Show-Help {
    Write-Host @'

  steer-runtime Kiro IDE Setup (Windows)

  USAGE:
    .\setup-kiro-ide.ps1 install <project-dir>   Install steering, skills, hooks + MCP
    .\setup-kiro-ide.ps1 sync <project-dir>      Update steering and skills from latest profiles
    .\setup-kiro-ide.ps1 remove <project-dir>    Remove steering, skills, hooks

  EXAMPLES:
    .\setup-kiro-ide.ps1 install .
    .\setup-kiro-ide.ps1 install C:\Projects\my-app
    .\setup-kiro-ide.ps1 sync .

  MCP servers are installed to the user-level ~/.kiro/settings/mcp.json
  so they work across all workspaces.

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
        # Skip fnm_multishells paths — they're ephemeral
        if ($source -notmatch 'fnm_multishells') { return $source }
    }
    # Try Program Files
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

function Install-Steering($dir) {
    $steeringDir = Join-Path $dir ".kiro\steering"
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
    Write-Host "$count steering files" -ForegroundColor Green
    return $count
}

function Install-Skills($dir) {
    $skillsDir = Join-Path $dir ".kiro\skills"
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
    Write-Host "$count skills" -ForegroundColor Green
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
    Write-Host "$count hooks" -ForegroundColor Green
    return $count
}

function Install-McpServers {
    Write-Host "`nConfiguring MCP servers (user-level)..."
    $mcpBundleDir = "$env:USERPROFILE\.kiro\tools\mcp-servers"
    $servers = @("bruno-mcp","confluence-mcp","github-mcp","jira-mcp","mermaid-diagram-mcp","mywiki-mcp")
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
    $mcpConfig.mcpServers["mywiki"] = [ordered]@{ command = $nodePath; args = @("$mcpBundleDir\mywiki-mcp\dist\index.cjs"); env = [ordered]@{ CONFLUENCE_PAT = ""; CONFLUENCE_URL = "https://mywiki.disney.com" } }

    $mcpJsonPath = "$env:USERPROFILE\.kiro\settings\mcp.json"
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

        Write-Host "Installing Kiro IDE config to $TargetDir\.kiro\`n"
        $sc = Install-Steering $TargetDir
        $skc = Install-Skills $TargetDir
        $hc = Install-Hooks $TargetDir
        $mc = Install-McpServers

        Write-Host "`nDone." -ForegroundColor Green
    }

    "sync" {
        if (-not $TargetDir) { Write-Host "X Usage: .\setup-kiro-ide.ps1 sync <project-dir>" -ForegroundColor Red; exit 1 }
        $TargetDir = [System.IO.Path]::GetFullPath($TargetDir)
        if (-not (Test-Path "$TargetDir\.kiro\steering") -and -not (Test-Path "$TargetDir\.kiro\skills")) {
            Write-Host "X No Kiro IDE config found. Run install first." -ForegroundColor Red; exit 1
        }
        Write-Host "Syncing Kiro IDE config in $TargetDir\.kiro\`n"
        $count = 0
        if (Test-Path "$TargetDir\.kiro\steering") {
            foreach ($pd in @("$SteerRoot\profiles\dev-core\steering", "$SteerRoot\profiles\dev-web\steering")) {
                if (Test-Path $pd) { Get-ChildItem "$pd\*.md" | ForEach-Object { Copy-Item $_.FullName "$TargetDir\.kiro\steering\" -Force; $count++ } }
            }
        }
        if (Test-Path "$TargetDir\.kiro\skills") {
            Get-ChildItem "$SteerRoot\common\skills\*.md" -EA SilentlyContinue | Where-Object { $_.Name -ne "README.md" } | ForEach-Object { Copy-Item $_.FullName "$TargetDir\.kiro\skills\" -Force; $count++ }
            if (Test-Path "$SteerRoot\profiles\dev-web\skills") { Get-ChildItem "$SteerRoot\profiles\dev-web\skills\*.md" | ForEach-Object { Copy-Item $_.FullName "$TargetDir\.kiro\skills\" -Force; $count++ } }
        }
        Write-Host "Synced $count files" -ForegroundColor Green
    }

    "remove" {
        if (-not $TargetDir) { Write-Host "X Usage: .\setup-kiro-ide.ps1 remove <project-dir>" -ForegroundColor Red; exit 1 }
        $TargetDir = [System.IO.Path]::GetFullPath($TargetDir)
        $removed = 0
        foreach ($sub in @("steering", "skills", "hooks")) {
            $p = "$TargetDir\.kiro\$sub"
            if (Test-Path $p) { Remove-Item -Recurse -Force $p; Write-Host "  Removed .kiro\$sub\" -ForegroundColor Yellow; $removed++ }
        }
        if ($removed -eq 0) { Write-Host "Nothing to remove" -ForegroundColor Yellow } else { Write-Host "Removed $removed directories" -ForegroundColor Green }
    }

    default { Show-Help }
}
