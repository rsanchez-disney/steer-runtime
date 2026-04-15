# agentSpawn hook: inject available agents registry and workspace context

# --- Workspace Context ---
$settingsFile = Join-Path $env:USERPROFILE ".kiro\settings\koda\steer_settings.json"
$sharedFile = Join-Path $env:USERPROFILE ".kiro\settings\koda\shared_settings.json"
$ws = ""

foreach ($f in @($settingsFile, $sharedFile)) {
    if ((Test-Path $f) -and -not $ws) {
        try {
            $d = Get-Content $f -Raw | ConvertFrom-Json
            $ws = $d.steerRuntime.activeWorkspace
        } catch {}
    }
}

if ($ws) {
    Write-Output "## Workspace Context"
    Write-Output ""
    Write-Output "- **Active workspace:** $ws"

    $steerRoot = Join-Path $env:USERPROFILE ".kiro\steer-runtime"
    $wsFile = Join-Path $steerRoot "workspaces\$ws\workspace.json"
    if (Test-Path $wsFile) {
        try {
            $wsd = Get-Content $wsFile -Raw | ConvertFrom-Json
            if ($wsd.team) { Write-Output "- **Team:** $($wsd.team)" }
            if ($wsd.extends) { Write-Output "- **Extends:** $($wsd.extends)" }
            if ($wsd.profiles) { Write-Output "- **Profiles:** $($wsd.profiles -join ', ')" }
            if ($wsd.default_agent) { Write-Output "- **Default agent:** $($wsd.default_agent)" }
        } catch {}
    }
    Write-Output ""
}

# --- Installed Profiles ---
$profilesFile = Join-Path $env:USERPROFILE ".kiro\settings\profiles.json"
if (Test-Path $profilesFile) {
    try {
        $pd = Get-Content $profilesFile -Raw | ConvertFrom-Json
        $installed = ($pd.profiles | Where-Object { $_.installed } | ForEach-Object { $_.id }) -join ", "
        if ($installed) {
            Write-Output "## Installed Profiles"
            Write-Output ""
            Write-Output $installed
            Write-Output ""
        }
    } catch {}
}

# --- Agent Registry ---
Write-Output "## Agent Registry (auto-discovered)"
Write-Output ""
$agentsDir = Join-Path $env:USERPROFILE ".kiro\agents"
if (Test-Path $agentsDir) {
    foreach ($f in (Get-ChildItem "$agentsDir\*.json" -ErrorAction SilentlyContinue)) {
        if ($f.Name.StartsWith("._")) { continue }
        $content = Get-Content $f.FullName -Raw
        if ($content -match '"name"\s*:\s*"([^"]*)"') { $name = $Matches[1] } else { continue }
        if ($content -match '"description"\s*:\s*"([^"]*)"') { $desc = $Matches[1] } else { $desc = "" }
        Write-Output "- **${name}**: $desc"
    }
}
