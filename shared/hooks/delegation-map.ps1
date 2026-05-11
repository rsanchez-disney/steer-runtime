# agentSpawn hook: generate delegation map for orchestrators
$KiroDir = if ($env:KIRO_HOME) { $env:KIRO_HOME } else { "$env:USERPROFILE\.kiro" }
$DynamicDir = "$KiroDir\context\_dynamic"
if (-not (Test-Path $DynamicDir)) { New-Item -ItemType Directory -Path $DynamicDir -Force | Out-Null }
$MapFile = "$DynamicDir\delegation-map.md"

# Load profiles manifest
$ProfileMap = @{}
$PF = "$KiroDir\settings\profiles.json"
if (Test-Path $PF) {
    $manifest = Get-Content $PF | ConvertFrom-Json
    foreach ($p in $manifest.profiles) {
        if ($p.installed) { foreach ($a in $p.agents) { $ProfileMap[$a] = $p.id } }
    }
}

# Load agents
$Agents = @()
Get-ChildItem "$KiroDir\agents\*.json" -ErrorAction SilentlyContinue | ForEach-Object {
    if ($_.Name.StartsWith("._")) { return }
    $d = Get-Content $_.FullName | ConvertFrom-Json
    $Agents += [PSCustomObject]@{ Name = $d.name; Description = $d.description; Profile = $ProfileMap[$d.name] }
}

# Compact output (stdout)
$ByProfile = $Agents | Group-Object Profile
Write-Output "## Delegation Map`n"
foreach ($g in ($ByProfile | Sort-Object Name)) {
    $names = ($g.Group | ForEach-Object { $_.Name }) -join ", "
    Write-Output "- **$($g.Name)**: $names"
}
Write-Output ""

# Full output (file)
$Full = @("# Delegation Map (auto-generated)", "", "Total: $($Agents.Count) agents across $($ByProfile.Count) profiles", "")
foreach ($g in ($ByProfile | Sort-Object Name)) {
    $Full += "## $($g.Name)", "", "| Agent | Description |", "|-------|-------------|"
    foreach ($a in ($g.Group | Sort-Object Name)) { $Full += "| $($a.Name) | $($a.Description) |" }
    $Full += ""
}
Set-Content -Path $MapFile -Value ($Full -join "`n")
