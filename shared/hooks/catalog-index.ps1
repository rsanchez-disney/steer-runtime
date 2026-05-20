# agentSpawn hook: generate managed services catalog index for the current workspace scope
# Stdout: full index with BAPP IDs, paths, and instructions (injected into agent context)
# Also writes backup to _dynamic/catalog-index.md

$KiroDir = if ($env:KIRO_HOME) { $env:KIRO_HOME } else { Join-Path $env:USERPROFILE ".kiro" }
$DynamicDir = Join-Path $KiroDir "context/_dynamic"
$IndexFile = Join-Path $DynamicDir "catalog-index.md"
$CatalogDir = Join-Path $KiroDir "steer-runtime/profiles/sustainment/managed-services-catalog/studios"

if (-not (Test-Path $CatalogDir)) { exit 0 }
New-Item -ItemType Directory -Force -Path $DynamicDir | Out-Null

# Resolve active workspace
$WsName = ""
foreach ($f in @("kite.json", "settings.json")) {
    $p = Join-Path $KiroDir "settings/$f"
    if (Test-Path $p) {
        try {
            $d = Get-Content $p | ConvertFrom-Json
            $ws = $d.steerRuntime.activeWorkspace
            if ($ws) { $WsName = $ws; break }
        } catch {}
    }
}

# Read catalog_scope from workspace source (supports nested subdirs)
$ScopeDirs = @("*")
if ($WsName) {
    $found = $null
    # Search flat and nested workspace directories
    $patterns = @(
        (Join-Path $KiroDir "steer-runtime/workspaces/$WsName/workspace.json"),
        (Join-Path $KiroDir "steer-runtime/workspaces/*/$WsName/workspace.json")
    )
    foreach ($pattern in $patterns) {
        $matches = Get-Item $pattern -ErrorAction SilentlyContinue
        if ($matches) { $found = $matches | Select-Object -First 1; break }
    }
    if ($found) {
        try {
            $wsData = Get-Content $found.FullName | ConvertFrom-Json
            $scope = $wsData.context.catalog_scope
            if (-not $scope -and $wsData.extends) {
                # Follow extends chain
                $parentPatterns = @(
                    (Join-Path $KiroDir "steer-runtime/workspaces/$($wsData.extends)/workspace.json"),
                    (Join-Path $KiroDir "steer-runtime/workspaces/*/$($wsData.extends)/workspace.json")
                )
                foreach ($pp in $parentPatterns) {
                    $pm = Get-Item $pp -ErrorAction SilentlyContinue
                    if ($pm) {
                        $parentData = Get-Content ($pm | Select-Object -First 1).FullName | ConvertFrom-Json
                        $scope = $parentData.context.catalog_scope
                        break
                    }
                }
            }
            if ($scope) { $ScopeDirs = $scope }
        } catch {}
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

        $Lines += "| $bappId | $fullName | $supportStudio | $ci | $studioName/$($appDir.Name)/ |"
        $Total++
    }
}

# === OUTPUT (stdout — this is what the agent actually sees) ===
$output = @"
## Managed Services Catalog — $Total applications in scope

Workspace: $(if ($WsName) { $WsName } else { 'default' })
Scope: $($ScopeDirs -join ' ')

| BAPP ID | Full Name | Studio | CI | Catalog Path |
|---------|-----------|--------|-----|--------------|
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
