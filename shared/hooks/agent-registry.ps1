# agentSpawn hook: inject orchestrator awareness context
# Emits: workspace context, installed profiles, MCP status, agent registry

$kiroDir = if ($env:KIRO_HOME) { $env:KIRO_HOME } else { Join-Path $env:USERPROFILE ".kiro" }
$steerRoot = Join-Path $kiroDir "steer-runtime"

# --- Workspace Context ---
$ws = ""
foreach ($f in @(
    (Join-Path $kiroDir "settings\kite.json"),
    (Join-Path $kiroDir "settings\koda\steer_settings.json"),
    (Join-Path $kiroDir "settings\koda\shared_settings.json")
)) {
    if ((Test-Path $f) -and -not $ws) {
        try { $ws = (Get-Content $f -Raw | ConvertFrom-Json).steerRuntime.activeWorkspace } catch {}
    }
}

if ($ws) {
    Write-Output "## Workspace Context"
    Write-Output ""
    Write-Output "- **Active workspace:** $ws"

    # Fast path: read resolved snapshot from settings
    $wsSnapshot = Join-Path $kiroDir "settings\workspace.json"
    $wsFile = $null
    if (Test-Path $wsSnapshot) {
        $wsFile = Get-Item $wsSnapshot
    } else {
        # Fallback: search steer-runtime recursively
        $wsFile = Get-ChildItem -Path (Join-Path $steerRoot "workspaces") -Filter "workspace.json" -Recurse -ErrorAction SilentlyContinue |
            Where-Object { (Get-Content $_.FullName -Raw | ConvertFrom-Json).name -eq $ws } | Select-Object -First 1
    }
    if ($wsFile) {
        $d = Get-Content $wsFile.FullName -Raw | ConvertFrom-Json
        if ($d.team) { Write-Output "- **Team:** $($d.team)" }
        if ($d.extends) { Write-Output "- **Extends:** $($d.extends)" }
        if ($d.profiles) { Write-Output "- **Profiles:** $($d.profiles -join ', ')" }
        if ($d.default_agent) { Write-Output "- **Default agent:** $($d.default_agent)" }
        if ($d.jira_prefix) { $jp = if ($d.jira_prefix -is [array]) { $d.jira_prefix -join ', ' } else { $d.jira_prefix }; Write-Output "- **Jira prefix:** $jp" }
        if ($d.projects) { Write-Output "- **Projects:** $($d.projects.Count)" }
        if ($d.services) { Write-Output "- **Services:** $($d.services -join ', ')" }
        if ($d.channels) { Write-Output "- **Channels:** $($d.channels -join ', ')" }
        if ($d.teams) {
            Write-Output "- **Teams:** $($d.teams.Count)"
            foreach ($t in $d.teams) {
                $info = $t.name
                if ($t.jira_projects) { $info += " ($($t.jira_projects -join ', '))" }
                if ($t.studio) { $info += " — Studio: $($t.studio)" }
                elseif ($t.team_id) { $info += " — Team ID: $($t.team_id)" }
                if ($t.board_ids) { $info += " [boards: $($t.board_ids -join ', ')]" }
                Write-Output "  - $info"
            }
        }
    }
    Write-Output ""
}

# --- Installed Profiles (with agent counts) ---
$profilesFile = Join-Path $kiroDir "settings\profiles.json"
if (Test-Path $profilesFile) {
    $pd = Get-Content $profilesFile -Raw | ConvertFrom-Json
    $installed = $pd.profiles | Where-Object { $_.installed }
    if ($installed) {
        Write-Output "## Installed Profiles"
        Write-Output ""
        foreach ($p in $installed) {
            $count = if ($p.agent_count) { $p.agent_count } else { $p.agents.Count }
            $agents = $p.agents -join ", "
            Write-Output "- **$($p.id)** ($count agents): $agents"
        }
        Write-Output ""
    }
}

# --- MCP Server Status ---
$mcpJson = Join-Path $kiroDir "mcp.json"
if (Test-Path $mcpJson) {
    Write-Output "## MCP Servers"
    Write-Output ""
    try {
        $d = Get-Content $mcpJson -Raw | ConvertFrom-Json
        $servers = $d.mcpServers.PSObject.Properties
        foreach ($s in ($servers | Sort-Object Name)) {
            $cmd = $s.Value.command
            $arg = if ($s.Value.args) { $s.Value.args[0] } else { "" }
            Write-Output "- **$($s.Name)**: $cmd $arg"
        }
        if (-not $servers) { Write-Output "- (none configured)" }
    } catch { Write-Output "- (error reading mcp.json)" }
    Write-Output ""
}

# --- Agent Registry ---
Write-Output "## Agent Registry (auto-discovered)"
Write-Output ""
$agentsDir = Join-Path $kiroDir "agents"
if (Test-Path $agentsDir) {
    foreach ($f in (Get-ChildItem "$agentsDir\*.json" -ErrorAction SilentlyContinue)) {
        if ($f.Name.StartsWith("._")) { continue }
        $content = Get-Content $f.FullName -Raw
        if ($content -match '"name"\s*:\s*"([^"]*)"') { $name = $Matches[1] } else { continue }
        if ($content -match '"description"\s*:\s*"([^"]*)"') { $desc = $Matches[1] } else { $desc = "" }
        Write-Output "- **${name}**: $desc"
    }
}
