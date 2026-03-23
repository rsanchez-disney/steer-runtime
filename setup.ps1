#Requires -Version 5.1
<#
.SYNOPSIS
    Unified setup for steer-runtime (multi-profile support) — Windows equivalent of setup.sh
.EXAMPLE
    .\setup.ps1 install dev
    .\setup.ps1 install dev ba --project C:\myapp
    .\setup.ps1 mcp-install
    .\setup.ps1 rules list
#>

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    [Parameter(Position=1, ValueFromRemainingArguments)]
    [string[]]$Args
)

$ErrorActionPreference = "Stop"
$SteerRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$KiroRoot = Join-Path $env:USERPROFILE ".kiro"

# ── Helpers ──

function Show-Usage {
    Write-Host @"
+==============================================================+
|           steer-runtime Unified Setup (Windows)               |
+==============================================================+

USAGE:
  .\setup.ps1 <command> [profiles...] [options]

COMMANDS:
  install <profiles> [--project <dir>]  Install one or more profiles
  sync [--project <dir>]                Update installed profiles
  remove <profiles> [--project <dir>]   Remove specific profiles
  clean [--project <dir>]               Remove ALL profiles and agents
  list                                   List available profiles
  check                                  Verify installation
  mcp-install                            Install MCP server dependencies
  rules [list|install]                   Manage common coding rules
  prompts [list|install]                 Manage standalone prompts
  init-memory <dir>                      Initialize project memory bank
  configure                              Configure MCP tokens interactively
  workspace <subcmd>                     Manage team workspaces (create, list, apply, show, sync)
  help                                   Show this help message

PROFILES:
  dev                 Development (18 agents)
  ba                  BA/PO (4 agents)
  qa                  QA/Testing (6 agents)
  ops                 Operations (5 agents)

EXAMPLES:
  .\setup.ps1 install dev
  .\setup.ps1 install dev ba --project C:\myapp
  .\setup.ps1 mcp-install
  .\setup.ps1 rules install --all
  .\setup.ps1 init-memory C:\myapp
"@
}

function Get-ProfileDirs {
    Get-ChildItem -Path $SteerRoot -Directory -Filter ".kiro-*"
}

function Get-ProfileName($dir) {
    $dir.Name -replace '^\\.kiro-', ''
}

function Get-TargetDir($projectDir) {
    if ($projectDir) {
        $resolved = Resolve-Path $projectDir -ErrorAction Stop
        return Join-Path $resolved ".kiro"
    }
    return $KiroRoot
}

function Inject-AgentTokens($targetDir) {
    $tokenMap = @(
        @{ Name="jira";       File="$KiroRoot\tools\mcp-servers\jira-mcp\.env";              Key="JIRA_PAT" }
        @{ Name="confluence"; File="$KiroRoot\tools\mcp-servers\confluence-mcp\.env";         Key="CONFLUENCE_PAT" }
        @{ Name="mywiki";     File="$KiroRoot\tools\mcp-servers\confluence-mcp\.env.mywiki";  Key="CONFLUENCE_PAT" }
        @{ Name="github";     File="$KiroRoot\tools\mcp-servers\github-mcp\.env";            Key="GITHUB_TOKEN_disney" }
    )
    foreach ($entry in $tokenMap) {
        if (Test-Path $entry.File) {
            $line = Get-Content $entry.File | Where-Object { $_ -match "^$($entry.Key)=" }
            if ($line) {
                $token = ($line -split '=', 2)[1]
                if ($token -and $token -ne "YOUR_TOKEN") {
                    Get-ChildItem "$targetDir\agents\*.json" -ErrorAction SilentlyContinue | ForEach-Object {
                        $json = Get-Content $_.FullName -Raw | ConvertFrom-Json
                        $mcp = $json.mcpServers.PSObject.Properties[$entry.Name]
                        if ($mcp -and $mcp.Value.env) {
                            $mcp.Value.env.($entry.Key) = $token
                            $json | ConvertTo-Json -Depth 10 | Set-Content $_.FullName -Encoding UTF8
                        }
                    }
                }
            }
        }
    }
}


function Write-ProfilesManifest($targetDir) {
    $settingsDir = Join-Path $targetDir "settings"
    New-Item -ItemType Directory -Force -Path $settingsDir | Out-Null
    $profiles = @()
    foreach ($dir in Get-ProfileDirs) {
        $pid = Get-ProfileName $dir
        $agents = @(Get-ChildItem "$($dir.FullName)\agents\*.json" -ErrorAction SilentlyContinue | ForEach-Object { $_.BaseName })
        $installed = $agents | Where-Object { Test-Path "$targetDir\agents\$_.json" }
        $profiles += @{ id=$pid; agents=$agents; agent_count=$agents.Count; installed=[bool]$installed }
    }
    @{ steer_root=$SteerRoot; profiles=$profiles } | ConvertTo-Json -Depth 5 |
        Set-Content "$settingsDir\profiles.json" -Encoding UTF8
}

function Install-Profile($profile, $targetDir) {
    $sourceDir = Join-Path $SteerRoot ".kiro-$profile"
    if (-not (Test-Path $sourceDir)) {
        Write-Host "X Profile not found: $profile" -ForegroundColor Red
        return
    }

    Write-Host "Installing $profile profile..."
    New-Item -ItemType Directory -Force -Path "$targetDir\agents", "$targetDir\prompts" | Out-Null

    # Copy agents with %USERPROFILE% expansion
    Get-ChildItem "$sourceDir\agents\*.json" -ErrorAction SilentlyContinue | ForEach-Object {
        $content = Get-Content $_.FullName -Raw
        $content = $content -replace '\$HOME', $env:USERPROFILE
        Set-Content -Path "$targetDir\agents\$($_.Name)" -Value $content -Encoding UTF8
    }

    # Copy prompts
    if (Test-Path "$sourceDir\prompts") {
        Copy-Item "$sourceDir\prompts\*" "$targetDir\prompts\" -Force -ErrorAction SilentlyContinue
    }

    # Copy subdirs
    foreach ($sub in @("context", "powers", "skills", "steering")) {
        if (Test-Path "$sourceDir\$sub") {
            New-Item -ItemType Directory -Force -Path "$targetDir\$sub" | Out-Null
            Copy-Item "$sourceDir\$sub\*" "$targetDir\$sub\" -Recurse -Force -ErrorAction SilentlyContinue
        }
    }

    Inject-AgentTokens $targetDir
    $count = (Get-ChildItem "$sourceDir\agents\*.json" -ErrorAction SilentlyContinue).Count
    Write-Host "  Installed $profile ($count agents)" -ForegroundColor Green
}

function Remove-Profile($profile, $targetDir) {
    $sourceDir = Join-Path $SteerRoot ".kiro-$profile"
    $removed = 0
    Get-ChildItem "$sourceDir\agents\*.json" -ErrorAction SilentlyContinue | ForEach-Object {
        $agentName = $_.BaseName
        $target = "$targetDir\agents\$agentName.json"
        $targetPrompt = "$targetDir\prompts\$agentName.md"
        if (Test-Path $target) { Remove-Item $target; $removed++ }
        if (Test-Path $targetPrompt) { Remove-Item $targetPrompt }
    }
    Write-Host "  Removed $profile ($removed agents)" -ForegroundColor Green
}

function Install-Shared($targetDir) {
    $toolsSrc = Join-Path $SteerRoot ".kiro\tools"
    if (Test-Path $toolsSrc) {
        Write-Host "Installing shared tools..."
        New-Item -ItemType Directory -Force -Path "$targetDir\tools" | Out-Null
        # Copy excluding node_modules
        Get-ChildItem $toolsSrc -Directory | ForEach-Object {
            $dest = "$targetDir\tools\$($_.Name)"
            if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Force -Path $dest | Out-Null }
            robocopy $_.FullName $dest /E /XD node_modules /NFL /NDL /NJH /NJS /NC /NS | Out-Null
        }
        Write-Host "  Installed MCP servers" -ForegroundColor Green
    }

    $ctxSrc = Join-Path $SteerRoot ".kiro\context"
    if (Test-Path $ctxSrc) {
        Write-Host "Installing shared context..."
        New-Item -ItemType Directory -Force -Path "$targetDir\context" | Out-Null
        Copy-Item "$ctxSrc\*.md" "$targetDir\context\" -Force -ErrorAction SilentlyContinue
        Write-Host "  Installed shared context files" -ForegroundColor Green
    }
}

function Detect-InstalledProfiles($targetDir) {
    $installed = @()
    if (-not (Test-Path "$targetDir\agents")) { return $installed }
    foreach ($dir in Get-ProfileDirs) {
        $profile = Get-ProfileName $dir
        $firstAgent = Get-ChildItem "$($dir.FullName)\agents\*.json" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($firstAgent -and (Test-Path "$targetDir\agents\$($firstAgent.Name)")) {
            $installed += $profile
        }
    }
    return $installed
}

# ── Commands ──

switch ($Command) {
    "install" {
        $profiles = @()
        $projectDir = $null
        for ($i = 0; $i -lt $Args.Count; $i++) {
            if ($Args[$i] -eq "--project") { $projectDir = $Args[++$i] }
            else { $profiles += $Args[$i] }
        }
        if ($profiles.Count -eq 0) { Write-Host "X No profiles specified" -ForegroundColor Red; Show-Usage; exit 1 }

        $targetRoot = Get-TargetDir $projectDir
        Write-Host "Target: $targetRoot"
        Install-Shared $targetRoot
        foreach ($p in $profiles) { Install-Profile $p $targetRoot }
        $total = (Get-ChildItem "$targetRoot\agents\*.json" -ErrorAction SilentlyContinue).Count
        Write-ProfilesManifest $targetRoot
        Write-Host "`nInstallation complete ($total agents total)" -ForegroundColor Green
    }

    "sync" {
        $projectDir = $null
        if ($Args.Count -ge 2 -and $Args[0] -eq "--project") { $projectDir = $Args[1] }
        $targetRoot = Get-TargetDir $projectDir
        Write-Host "Syncing profiles in $targetRoot..."
        $installed = Detect-InstalledProfiles $targetRoot
        if ($installed.Count -eq 0) { Write-Host "No profiles detected. Use 'install' first."; exit 0 }
        Write-Host "Detected: $($installed -join ', ')"
        Install-Shared $targetRoot
        foreach ($p in $installed) { Install-Profile $p $targetRoot }
        $total = (Get-ChildItem "$targetRoot\agents\*.json" -ErrorAction SilentlyContinue).Count
        Write-ProfilesManifest $targetRoot
        Write-Host "`nSync complete ($total agents total)" -ForegroundColor Green
    }

    "remove" {
        $profiles = @()
        $projectDir = $null
        for ($i = 0; $i -lt $Args.Count; $i++) {
            if ($Args[$i] -eq "--project") { $projectDir = $Args[++$i] }
            else { $profiles += $Args[$i] }
        }
        $targetRoot = Get-TargetDir $projectDir
        foreach ($p in $profiles) { Remove-Profile $p $targetRoot }
        $remaining = (Get-ChildItem "$targetRoot\agents\*.json" -ErrorAction SilentlyContinue).Count
        Write-Host "`nRemoval complete ($remaining agents remaining)" -ForegroundColor Green
    }

    "clean" {
        $projectDir = $null
        if ($Args.Count -ge 2 -and $Args[0] -eq "--project") { $projectDir = $Args[1] }
        $targetRoot = Get-TargetDir $projectDir
        $confirm = Read-Host "This will remove ALL agents and profiles from $targetRoot. Continue? (y/N)"
        if ($confirm -notmatch '^[Yy]$') { Write-Host "Cancelled"; exit 0 }
        foreach ($sub in @("agents","prompts","context","powers","skills","steering")) {
            $path = Join-Path $targetRoot $sub
            if (Test-Path $path) { Remove-Item $path -Recurse -Force }
        }
        Write-Host "Clean complete" -ForegroundColor Green
    }

    "list" {
        Write-Host "Available profiles:`n"
        foreach ($dir in Get-ProfileDirs) {
            $profile = Get-ProfileName $dir
            $count = (Get-ChildItem "$($dir.FullName)\agents\*.json" -ErrorAction SilentlyContinue).Count
            Write-Host "  * $profile ($count agents)"
        }
    }

    "check" {
        Write-Host "Installation status:`n"
        if (Test-Path "$KiroRoot\agents") {
            $installed = Detect-InstalledProfiles $KiroRoot
            $total = (Get-ChildItem "$KiroRoot\agents\*.json" -ErrorAction SilentlyContinue).Count
            Write-Host "  Installed profiles: $($installed -join ', ')" -ForegroundColor Green
            Write-Host "  Total agents: $total" -ForegroundColor Green
        } else {
            Write-Host "  No CLI agents installed" -ForegroundColor Red
        }
    }

    "mcp-install" {
        Write-Host "Setting up MCP servers...`n"

        # Check node
        if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
            Write-Host "X node not found. Please install Node.js first." -ForegroundColor Red; exit 1
        }

        # Verify pre-built bundles
        Write-Host "Verifying MCP server bundles..."
        $mcpDirs = @(Get-ChildItem "$KiroRoot\tools\mcp-servers" -Directory -ErrorAction SilentlyContinue |
            Where-Object { Test-Path "$($_.FullName)\dist\index.cjs" })

        foreach ($mcp in $mcpDirs) {
            Write-Host "  OK $($mcp.Name)" -ForegroundColor Green
        }

        if ($mcpDirs.Count -eq 0) {
            Write-Host "X No pre-built MCP bundles found in dist/" -ForegroundColor Red; exit 1
        }
        Write-Host "`n$($mcpDirs.Count) MCP servers ready (pre-built, no npm install needed)" -ForegroundColor Green
        Write-Host "  OK context7 (npx-based, no bundle needed)" -ForegroundColor Green

        # Configure tokens
        Write-Host ""
        Write-Host "+==============================================================+"
        Write-Host "|              MCP Server Token Configuration                   |"
        Write-Host "+==============================================================+"
        Write-Host ""
        Write-Host "Generate Personal Access Tokens from these URLs:`n"
        Write-Host "  Jira:       https://myjira.disney.com/secure/ViewProfile.jspa?selectedTab=com.atlassian.pats.pats-plugin:jira-user-personal-access-tokens"
        Write-Host "  Confluence: https://confluence.disney.com/plugins/personalaccesstokens/usertokens.action"
        Write-Host "  MyWiki:     https://mywiki.disney.com/plugins/personalaccesstokens/usertokens.action"
        Write-Host "  GitHub:     https://github.disney.com/settings/tokens"
        Write-Host ""

        $configureTokens = Read-Host "Would you like to configure tokens now? (y/N)"
        if ($configureTokens -match '^[Yy]$') {
            # Jira
            Write-Host "`n--- Jira ---"
            $jiraToken = Read-Host "Paste your Jira PAT (or Enter to skip)"
            if ($jiraToken) {
                "JIRA_PAT=$jiraToken" | Set-Content "$KiroRoot\tools\mcp-servers\jira-mcp\.env" -Encoding UTF8
                Write-Host "  Saved to jira-mcp\.env" -ForegroundColor Green
            }

            # Confluence
            Write-Host "`n--- Confluence ---"
            $confToken = Read-Host "Paste your Confluence PAT (or Enter to skip)"
            if ($confToken) {
                "CONFLUENCE_URL=https://confluence.disney.com`nCONFLUENCE_PAT=$confToken" |
                    Set-Content "$KiroRoot\tools\mcp-servers\confluence-mcp\.env" -Encoding UTF8
                Write-Host "  Saved to confluence-mcp\.env" -ForegroundColor Green
            }

            # MyWiki
            Write-Host "`n--- MyWiki (mywiki.disney.com) ---"
            $mywikiToken = Read-Host "Paste your MyWiki PAT (or Enter to skip)"
            if ($mywikiToken) {
                "CONFLUENCE_URL=https://mywiki.disney.com`nCONFLUENCE_PAT=$mywikiToken" |
                    Set-Content "$KiroRoot\tools\mcp-servers\confluence-mcp\.env.mywiki" -Encoding UTF8
                Write-Host "  Saved to confluence-mcp\.env.mywiki" -ForegroundColor Green
            }

            # GitHub
            Write-Host "`n--- GitHub ---"
            $ghToken = Read-Host "Paste your GitHub PAT (or Enter to skip)"
            if ($ghToken) {
                "GITHUB_TOKEN_disney=$ghToken`nGITHUB_HOST_disney=github.disney.com`nGITHUB_DEFAULT_REMOTE=disney" |
                    Set-Content "$KiroRoot\tools\mcp-servers\github-mcp\.env" -Encoding UTF8
                Write-Host "  Saved to github-mcp\.env" -ForegroundColor Green
            }
        }

        # Resolve $HOME in agent configs
        Get-ChildItem "$KiroRoot\agents\*.json" -ErrorAction SilentlyContinue | ForEach-Object {
            $content = Get-Content $_.FullName -Raw
            if ($content -match '\$HOME') {
                $content = $content -replace '\$HOME', $env:USERPROFILE
                Set-Content $_.FullName -Value $content -Encoding UTF8
                Write-Host "  Resolved `$HOME in $($_.Name)"
            }
        }

        Inject-AgentTokens $KiroRoot
        Write-Host "`nMCP servers ready" -ForegroundColor Green
    }

    "rules" {
        $subcmd = if ($Args.Count -gt 0) { $Args[0] } else { "list" }
        $remaining = if ($Args.Count -gt 1) { $Args[1..($Args.Count-1)] } else { @() }

        switch ($subcmd) {
            "list" {
                Write-Host "Available rules:`n"
                Get-ChildItem "$SteerRoot\common\rules\*.md" | Where-Object { $_.Name -ne "README.md" } | ForEach-Object {
                    Write-Host "  * $($_.BaseName)"
                }
            }
            "install" {
                $installAll = $remaining -contains "--all"
                $projectDir = $null
                $rules = @()
                for ($i = 0; $i -lt $remaining.Count; $i++) {
                    if ($remaining[$i] -eq "--project") { $projectDir = $remaining[++$i] }
                    elseif ($remaining[$i] -ne "--all") { $rules += $remaining[$i] }
                }
                $targetRoot = Get-TargetDir $projectDir
                New-Item -ItemType Directory -Force -Path "$targetRoot\rules" | Out-Null

                if ($installAll) {
                    Get-ChildItem "$SteerRoot\common\rules\*.md" | Where-Object { $_.Name -ne "README.md" } | ForEach-Object {
                        Copy-Item $_.FullName "$targetRoot\rules\" -Force
                        Write-Host "  $($_.Name)" -ForegroundColor Green
                    }
                } else {
                    foreach ($r in $rules) {
                        $src = "$SteerRoot\common\rules\$r.md"
                        if (Test-Path $src) { Copy-Item $src "$targetRoot\rules\" -Force; Write-Host "  Installed $r" -ForegroundColor Green }
                        else { Write-Host "  Rule not found: $r" -ForegroundColor Red }
                    }
                }
                Write-Host "Rules installed" -ForegroundColor Green
            }
        }
    }

    "prompts" {
        $subcmd = if ($Args.Count -gt 0) { $Args[0] } else { "list" }
        $remaining = if ($Args.Count -gt 1) { $Args[1..($Args.Count-1)] } else { @() }

        switch ($subcmd) {
            "list" {
                Write-Host "Available prompts:`n"
                Get-ChildItem "$SteerRoot\common\prompts\*.md" | Where-Object { $_.Name -ne "README.md" } | ForEach-Object {
                    Write-Host "  * $($_.BaseName)"
                }
            }
            "install" {
                $installAll = $remaining -contains "--all"
                New-Item -ItemType Directory -Force -Path "$KiroRoot\prompts" | Out-Null
                if ($installAll) {
                    Get-ChildItem "$SteerRoot\common\prompts\*.md" | Where-Object { $_.Name -ne "README.md" } | ForEach-Object {
                        Copy-Item $_.FullName "$KiroRoot\prompts\" -Force
                        Write-Host "  $($_.Name)" -ForegroundColor Green
                    }
                }
                Write-Host "Prompts installed" -ForegroundColor Green
            }
        }
    }

    "init-memory" {
        if ($Args.Count -eq 0) { Write-Host "X Project directory required" -ForegroundColor Red; exit 1 }
        $projectDir = Resolve-Path $Args[0]
        $projectName = Split-Path $projectDir -Leaf
        $targetMb = Join-Path $projectDir ".kiro\rules\memory-bank"
        New-Item -ItemType Directory -Force -Path $targetMb | Out-Null

        $fromProject = $null
        for ($i = 1; $i -lt $Args.Count; $i++) {
            if ($Args[$i] -eq "--from") { $fromProject = $Args[++$i] }
        }

        $knownPath = "$SteerRoot\workspaces\default\projects\$projectName\.kiro\rules\memory-bank"
        if ($fromProject) {
            $src = "$SteerRoot\workspaces\default\projects\$fromProject\.kiro\rules\memory-bank"
            if (-not (Test-Path $src)) { Write-Host "X Unknown project: $fromProject" -ForegroundColor Red; exit 1 }
            Copy-Item "$src\*.md" $targetMb -Force
        } elseif (Test-Path $knownPath) {
            Write-Host "Found known project: $projectName"
            Copy-Item "$knownPath\*.md" $targetMb -Force
        } else {
            Write-Host "Generating from templates..."
            Get-ChildItem "$SteerRoot\common\memory-bank-templates\*.template" | ForEach-Object {
                $outName = $_.Name -replace '\.template$', ''
                (Get-Content $_.FullName -Raw) -replace '\{\{PROJECT_NAME\}\}', $projectName |
                    Set-Content "$targetMb\$outName" -Encoding UTF8
                Write-Host "  $outName" -ForegroundColor Green
            }
        }
        Write-Host "Memory bank initialized at $targetMb" -ForegroundColor Green
    }

    "configure" {
        Write-Host "Configure MCP tokens`n"
        $envFile = Join-Path $KiroRoot ".env"
        if (-not (Test-Path $envFile)) { New-Item $envFile -ItemType File | Out-Null }

        $tokens = @("JIRA_PERSONAL_TOKEN","CONFLUENCE_PERSONAL_TOKEN","GITHUB_PERSONAL_ACCESS_TOKEN","HARNESS_API_KEY","SONARQUBE_TOKEN")
        $envContent = Get-Content $envFile -ErrorAction SilentlyContinue

        foreach ($token in $tokens) {
            $current = ($envContent | Where-Object { $_ -match "^$token=" }) -replace "^$token=", ""
            $status = if ($current) { "set" } else { "not set" }
            $value = Read-Host "$token [$status]"
            if ($value) {
                $envContent = $envContent | Where-Object { $_ -notmatch "^$token=" }
                $envContent += "$token=$value"
                Write-Host "  Updated" -ForegroundColor Green
            }
        }
        $envContent | Set-Content $envFile -Encoding UTF8
        Write-Host "`nConfiguration saved to $envFile" -ForegroundColor Green
    }

    "workspace" {
        $wsCmd = if ($Args.Count -gt 0) { $Args[0] } else { "list" }
        $wsName = if ($Args.Count -gt 1) { $Args[1] } else { "" }
        $wsDir = Join-Path $SteerRoot "workspaces"

        switch ($wsCmd) {
            "list" {
                if ($Args -contains "--fetch") {
                    Write-Host "Fetching latest from remote..."
                    try { git -C $SteerRoot pull --rebase --quiet 2>$null; Write-Host "  OK Up to date" -ForegroundColor Green }
                    catch { Write-Host "  Warning: Fetch failed (offline?)" -ForegroundColor Yellow }
                    Write-Host ""
                }
                Write-Host "Available team workspaces:`n"
                $found = $false
                Get-ChildItem -Path $wsDir -Directory -ErrorAction SilentlyContinue | ForEach-Object {
                    $wsFile = Join-Path $_.FullName "workspace.json"
                    if (Test-Path $wsFile) {
                        $found = $true
                        $ws = Get-Content $wsFile -Raw | ConvertFrom-Json
                        Write-Host "  * $($ws.name)" -ForegroundColor Cyan
                        if ($ws.description) { Write-Host "    $($ws.description)" }
                        if ($ws.profiles) { Write-Host "    Profiles: $($ws.profiles -join ', ')" }
                        Write-Host ""
                    }
                }
                if (-not $found) { Write-Host "  (none) -- create one with: .\setup.ps1 workspace create <name>" }
            }
            "show" {
                if (-not $wsName) { Write-Host "X Usage: .\setup.ps1 workspace show <name>" -ForegroundColor Red; exit 1 }
                $wsFile = Join-Path $wsDir "$wsName\workspace.json"
                if (-not (Test-Path $wsFile)) { Write-Host "X Workspace not found: $wsName" -ForegroundColor Red; exit 1 }
                $ws = Get-Content $wsFile -Raw | ConvertFrom-Json
                Write-Host "`n  Team Workspace: $($ws.name)" -ForegroundColor Cyan
                Write-Host "  $('=' * 40)"
                if ($ws.description) { Write-Host "  Description:  $($ws.description)" }
                if ($ws.team)        { Write-Host "  Team:         $($ws.team)" }
                if ($ws.jira_prefix) { Write-Host "  Jira Prefix:  $($ws.jira_prefix)" }
                Write-Host "`n  Profiles:"
                $ws.profiles | ForEach-Object { Write-Host "    * $_" }
                if ($ws.default_agent) { Write-Host "`n  Default Agent: $($ws.default_agent)" }
                if ($ws.projects) {
                    Write-Host "`n  Projects:"
                    $ws.projects | ForEach-Object { Write-Host "    * $($_.name) ($($_.path))" }
                }
                if ($ws.rules) {
                    Write-Host "`n  Rules:"
                    $ws.rules | ForEach-Object { Write-Host "    * $_" }
                }
                Write-Host ""
            }
            "apply" {
                if (-not $wsName) { Write-Host "X Usage: .\setup.ps1 workspace apply <name>" -ForegroundColor Red; exit 1 }
                $wsFile = Join-Path $wsDir "$wsName\workspace.json"
                if (-not (Test-Path $wsFile)) { Write-Host "X Workspace not found: $wsName" -ForegroundColor Red; exit 1 }
                $ws = Get-Content $wsFile -Raw | ConvertFrom-Json
                Write-Host "Applying workspace: $wsName`n" -ForegroundColor Cyan
                if ($ws.profiles) {
                    Write-Host "Installing profiles: $($ws.profiles -join ' ')"
                    & $MyInvocation.MyCommand.Path install @($ws.profiles)
                }
                if ($ws.rules) {
                    Write-Host "`nInstalling rules..."
                    $ws.rules | ForEach-Object {
                        $ruleFile = Join-Path $SteerRoot "common\rules\$_.md"
                        if (Test-Path $ruleFile) {
                            New-Item -Path "$KiroRoot\rules" -ItemType Directory -Force | Out-Null
                            Copy-Item $ruleFile "$KiroRoot\rules\"
                            Write-Host "  OK $_" -ForegroundColor Green
                        }
                    }
                }
                $wsPath = Join-Path $wsDir $wsName
                $customRules = Join-Path $wsPath "rules"
                if (Test-Path $customRules) {
                    Get-ChildItem "$customRules\*.md" -ErrorAction SilentlyContinue | ForEach-Object {
                        Copy-Item $_.FullName "$KiroRoot\rules\"
                        Write-Host "  OK $($_.BaseName)" -ForegroundColor Green
                    }
                }
                $customCtx = Join-Path $wsPath "context"
                if (Test-Path $customCtx) {
                    Write-Host "`nInstalling context..."
                    New-Item -Path "$SteerRoot\.kiro\context" -ItemType Directory -Force | Out-Null
                    Get-ChildItem "$customCtx\*.md" -ErrorAction SilentlyContinue | ForEach-Object {
                        Copy-Item $_.FullName "$SteerRoot\.kiro\context\"
                        Write-Host "  OK $($_.Name)" -ForegroundColor Green
                    }
                }
                if ($ws.enable_tools) {
                    Write-Host "`nEnabling advanced tools..."
                    & $MyInvocation.MyCommand.Path enable-tools 2>$null
                }
                Write-Host "`nWorkspace '$wsName' applied" -ForegroundColor Green
                if ($ws.default_agent) { Write-Host "  Default agent: $($ws.default_agent)" }
                Write-Host "`nNext steps:"
                Write-Host "  .\setup.ps1 mcp-install"
                if ($ws.default_agent) { Write-Host "  kiro-cli chat --agent $($ws.default_agent)" }
            }
            "create" {
                if (-not $wsName) { Write-Host "X Usage: .\setup.ps1 workspace create <name>" -ForegroundColor Red; exit 1 }
                $wsPath = Join-Path $wsDir $wsName
                if (Test-Path $wsPath) { Write-Host "X Workspace already exists: $wsName" -ForegroundColor Red; exit 1 }
                New-Item -Path $wsPath -ItemType Directory -Force | Out-Null
                "rules","context","memory-banks" | ForEach-Object { New-Item -Path (Join-Path $wsPath $_) -ItemType Directory -Force | Out-Null }
                $template = @{name=$wsName;description="";team="";profiles=@("dev-core","dev-web");default_agent="orchestrator";projects=@();rules=@("conventional_commit");enable_tools=$true;jira_prefix=""} | ConvertTo-Json -Depth 3
                $template | Set-Content (Join-Path $wsPath "workspace.json") -Encoding UTF8
                Write-Host "Workspace scaffolded at workspaces\$wsName\" -ForegroundColor Green
                if ($Args -notcontains "--local") {
                    Write-Host "`nPublishing workspace to repository..."
                    try {
                        git -C $SteerRoot add "workspaces/$wsName/" 2>$null
                        git -C $SteerRoot commit -m "feat: add $wsName team workspace" --quiet 2>$null
                        git -C $SteerRoot push --quiet 2>$null
                        Write-Host "  OK Committed and pushed" -ForegroundColor Green
                    } catch { Write-Host "  Warning: Git push failed -- commit locally, push manually" -ForegroundColor Yellow }
                }
                Write-Host "`nNext steps:"
                Write-Host "  1. Edit workspaces\$wsName\workspace.json"
                Write-Host "  2. Add team rules to workspaces\$wsName\rules\"
                Write-Host "  3. Add team context to workspaces\$wsName\context\"
                Write-Host "  4. Apply: .\setup.ps1 workspace apply $wsName"
            }
            "sync" {
                if (-not $wsName) { Write-Host "X Usage: .\setup.ps1 workspace sync <name> [--push]" -ForegroundColor Red; exit 1 }
                $wsFile = Join-Path $wsDir "$wsName\workspace.json"
                if (-not (Test-Path $wsFile)) { Write-Host "X Workspace not found: $wsName" -ForegroundColor Red; exit 1 }
                $ws = Get-Content $wsFile | ConvertFrom-Json
                $doPush = $args -contains "--push"
                if (-not $ws.projects -or $ws.projects.Count -eq 0) { Write-Host "No projects in workspace $wsName"; exit 0 }
                Write-Host "Syncing workspace: $wsName`n"
                foreach ($proj in $ws.projects) {
                    $resolved = $proj.path -replace '^\.\.\/','..\' | ForEach-Object { Join-Path (Split-Path $SteerRoot) ($_ -replace '^\.\.\/','') }
                    $name = Split-Path $resolved -Leaf
                    if (-not (Test-Path (Join-Path $resolved ".git"))) { Write-Host "  SKIP $name (not a git repo)"; continue }
                    if ($doPush) {
                        git -C $resolved push --quiet 2>$null; if ($?) { Write-Host "  OK $name (pushed)" -ForegroundColor Green } else { Write-Host "  WARN $name (push failed)" -ForegroundColor Yellow }
                    } else {
                        git -C $resolved fetch --all --quiet 2>$null
                        git -C $resolved pull --rebase --quiet 2>$null; if ($?) { Write-Host "  OK $name (pulled)" -ForegroundColor Green } else { Write-Host "  WARN $name (pull failed)" -ForegroundColor Yellow }
                    }
                }
                Write-Host "`nSync complete"
            }
            default {
                Write-Host "X Unknown workspace command: $wsCmd" -ForegroundColor Red
                Write-Host "`nUsage:"
                Write-Host "  .\setup.ps1 workspace list"
                Write-Host "  .\setup.ps1 workspace show <name>"
                Write-Host "  .\setup.ps1 workspace apply <name>"
                Write-Host "  .\setup.ps1 workspace create <name>"
                Write-Host "  .\setup.ps1 workspace sync <name> [--push]"
                exit 1
            }
        }
    }

    { $_ -in "help","--help","-h" } { Show-Usage }

    default {
        Write-Host "X Unknown command: $Command" -ForegroundColor Red
        Show-Usage
        exit 1
    }
}
