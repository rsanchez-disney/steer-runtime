# agentSpawn hook: inject orchestrator awareness context (two-tier)
# stdout: compact summary. File: full detail at _dynamic/agent-registry-full.md

$KiroDir = if ($env:KIRO_HOME) { $env:KIRO_HOME } else { "$env:USERPROFILE\.kiro" }
$DynamicDir = "$KiroDir\context\_dynamic"
if (-not (Test-Path $DynamicDir)) { New-Item -ItemType Directory -Path $DynamicDir -Force | Out-Null }
$FullFile = "$DynamicDir\agent-registry-full.md"

# Workspace
$ws = ""
foreach ($f in @("$KiroDir\settings\kite.json", "$KiroDir\settings\koda\steer_settings.json")) {
    if ((Test-Path $f) -and -not $ws) {
        try { $d = Get-Content $f | ConvertFrom-Json; $ws = $d.steerRuntime.activeWorkspace } catch {}
    }
}

$wsData = @{}
$wsFile = "$KiroDir\settings\workspace.json"
if (Test-Path $wsFile) { try { $wsData = Get-Content $wsFile | ConvertFrom-Json } catch {} }

# System
$sysData = @{}
$sysFile = "$KiroDir\settings\system.json"
if (Test-Path $sysFile) { try { $sysData = Get-Content $sysFile | ConvertFrom-Json } catch {} }

# Profiles
$profiles = @()
$pf = "$KiroDir\settings\profiles.json"
if (Test-Path $pf) { try { $profiles = (Get-Content $pf | ConvertFrom-Json).profiles | Where-Object { $_.installed } } catch {} }

# Agents
$agentCount = (Get-ChildItem "$KiroDir\agents\*.json" -ErrorAction SilentlyContinue | Where-Object { -not $_.Name.StartsWith("._") }).Count

# === COMPACT (stdout) ===
Write-Output "## System`n"
$parts = @()
if ($ws) { $parts += "Workspace: $ws" }
if ($wsData.team) { $parts += "Team: $($wsData.team)" }
$jp = $wsData.jira_prefix; if ($jp) { if ($jp -is [array]) { $jp = $jp -join ", " }; $parts += "Jira: $jp" }
if ($wsData.default_agent) { $parts += "Default: $($wsData.default_agent)" }
if ($parts.Count) { Write-Output ($parts -join " | ") }

if ($profiles.Count) {
    $plist = ($profiles | ForEach-Object { "$($_.id)($($_.agent_count))" }) -join ", "
    Write-Output "Profiles: $plist"
}

$ram = $sysData.total_ram_gb; $tier = $sysData.tier; $maxA = $sysData.max_concurrent_agents
if ($ram) { Write-Output "System: ${ram}GB RAM ($tier), max $maxA concurrent agents" }
Write-Output "Agents: $agentCount installed`n"

# === FULL (file) ===
$Full = @("# Agent Registry (full)", "")
if ($ws) {
    $Full += "## Workspace Context", ""
    $Full += "- **Active workspace:** $ws"
    if ($wsData.team) { $Full += "- **Team:** $($wsData.team)" }
    if ($wsData.profiles) { $Full += "- **Profiles:** $($wsData.profiles -join ', ')" }
    if ($wsData.default_agent) { $Full += "- **Default agent:** $($wsData.default_agent)" }
    $Full += ""
}
if ($ram) {
    $Full += "## System Resources", "", "- **RAM:** $ram GB ($tier tier)", "- **Max concurrent:** $maxA", ""
}
if ($profiles.Count) {
    $Full += "## Installed Profiles", ""
    foreach ($p in $profiles) { $Full += "- **$($p.id)** ($($p.agent_count) agents): $($p.agents -join ', ')" }
    $Full += ""
}
$Full += "## Agent Registry", ""
Get-ChildItem "$KiroDir\agents\*.json" -ErrorAction SilentlyContinue | Where-Object { -not $_.Name.StartsWith("._") } | ForEach-Object {
    $d = Get-Content $_.FullName | ConvertFrom-Json
    $Full += "- **$($d.name)**: $($d.description)"
}
Set-Content -Path $FullFile -Value ($Full -join "`n")
