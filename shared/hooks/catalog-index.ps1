# agentSpawn hook: generate managed services catalog index for the current workspace scope
# Stdout: full index with BAPP IDs, paths, and instructions (injected into agent context)
# Also writes backup to _dynamic/catalog-index.md

$KiroDir = if ($env:KIRO_HOME) { $env:KIRO_HOME } else { Join-Path $env:USERPROFILE ".kiro" }
$DynamicDir = Join-Path $KiroDir "context/_dynamic"
$IndexFile = Join-Path $DynamicDir "catalog-index.md"
$CatalogDir = Join-Path $KiroDir "steer-runtime/profiles/sustainment/managed-services-catalog/studios"

if (-not (Test-Path $CatalogDir)) { exit 0 }
New-Item -ItemType Directory -Force -Path $DynamicDir | Out-Null

# Read managed_studios from workspace snapshot (with fallback for older Koda versions)
$WsName = "default"
$ScopeDirs = @("*")
$SnapshotFile = Join-Path $KiroDir "settings/workspace.json"
if (Test-Path $SnapshotFile) {
    try {
        $wsData = Get-Content $SnapshotFile -Raw | ConvertFrom-Json
        if ($wsData.name) { $WsName = $wsData.name }
        if ($wsData.managed_studios -and $wsData.managed_studios.Count -gt 0) {
            $ScopeDirs = @($wsData.managed_studios)
        }
    } catch {}
} else {
    # Fallback: older Koda versions write activeWorkspace to kite.json or settings.json
    foreach ($f in @("kite.json", "settings.json")) {
        $p = Join-Path $KiroDir "settings/$f"
        if (Test-Path $p) {
            try {
                $d = Get-Content $p -Raw | ConvertFrom-Json
                $ws = $d.steerRuntime.activeWorkspace
                if ($ws) { $WsName = $ws; break }
            } catch {}
        }
    }
}

# Determine studio directories to scan
if ($ScopeDirs -contains "*") {
    $Studios = Get-ChildItem -Directory $CatalogDir | Where-Object { $_.Name -like "studio-*" }
} else {
    $Studios = $ScopeDirs | ForEach-Object {
        $p = Join-Path $CatalogDir $_
        if (Test-Path $p) { Get-Item $p }
    }
}

# Collect apps
$Lines = @()
$Total = 0

foreach ($studio in $Studios) {
    $studioName = $studio.Name

    foreach ($appDir in (Get-ChildItem -Directory $studio.FullName | Where-Object { $_.Name -like "BAPP*" })) {
        $yamlFile = Join-Path $appDir.FullName "app.yaml"
        if (-not (Test-Path $yamlFile)) { continue }

        $content = Get-Content $yamlFile -Raw
        $bappId = if ($content -match '(?m)^bapp_id:\s*"([^"]*)"') { $Matches[1] } else { "" }
        $fullName = if ($content -match '(?m)^full_name:\s*"([^"]*)"') { $Matches[1] } else { "" }
        $supportStudio = if ($content -match '(?m)^support_studio:\s*"([^"]*)"') { $Matches[1] } else { "" }
        $ci = if ($content -match '(?m)\s+configuration_item:\s*"([^"]*)"') { $Matches[1] } else { "" }
        # Extract ServiceNow assignment group for incident routing
        $assignGroup = if ($content -match '(?m)\s+assignment_group:\s*"([^"]*)"') { $Matches[1] } else { "" }
        # Extract full app description (collapsed to single line for table format)
        $desc = ""
        if ($content -match '(?ms)^description:\s*[>|]-?\s*\n((?:\s+.+\n?)+)') {
            $desc = ($Matches[1] -replace '\r?\n\s*', ' ').Trim()
        } elseif ($content -match '(?m)^description:\s*"([^"]*)"') {
            $desc = $Matches[1]
        }

        $Lines += "| $bappId | $fullName | $supportStudio | $ci | $assignGroup | $desc | $studioName/$($appDir.Name)/ |"
        $Total++
    }
}

# === OUTPUT (stdout — this is what the agent actually sees) ===
$output = @"
## Managed Services Catalog — $Total applications in scope

Workspace: $(if ($WsName) { $WsName } else { 'default' })
Scope: $($ScopeDirs -join ' ')

| BAPP ID | Full Name | Studio | CI | Assignment Group | Description | Catalog Path |
|---------|-----------|--------|-----|------------------|-------------|--------------|
$($Lines -join "`n")

### How to Get App Details

To get full details for any app listed above, use your file reading tool:

1. Take the "Catalog Path" from the table (e.g., studio-mars/BAPP0012680-Booking_Service/)
2. Read: ~/.kiro/steer-runtime/profiles/sustainment/managed-services-catalog/studios/<Catalog Path>/app.yaml
3. The app.yaml contains: repositories, splunk queries, health checks, cloud infra, contacts, CI/CD, and more

For troubleshooting context, read the troubleshooting.md in the same directory.
"@

Write-Output $output

# === FULL (file — backup copy) ===
$output | Set-Content -Path $IndexFile -Encoding UTF8
