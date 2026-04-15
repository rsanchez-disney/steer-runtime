# postToolUse hook: check that references in agent JSON still resolve
$file = $env:KIRO_FILE_PATH
if (-not $file) { exit 0 }
if ($file -notmatch '[\\/]profiles[\\/]') { exit 0 }

$profileDir = $file -replace '(profiles[\\/][^\\/]*[\\/]).*', '$1'
if (-not (Test-Path $profileDir)) { exit 0 }

Write-Output "## Cross-Reference Check"
Write-Output ""

$broken = 0
foreach ($agentJson in (Get-ChildItem "$profileDir\agents\*.json" -ErrorAction SilentlyContinue)) {
    $agent = $agentJson.BaseName
    $content = Get-Content $agentJson.FullName -Raw

    if ($content -match '"prompt"\s*:\s*"([^"]*)"') {
        $prompt = $Matches[1]
        if ($prompt -and -not (Test-Path (Join-Path $profileDir $prompt))) {
            Write-Output "✗ ${agent}: prompt `"$prompt`" not found"
            $broken++
        }
    }

    [regex]::Matches($content, '"(context/[^"]*)"') | ForEach-Object {
        $res = $_.Groups[1].Value
        if (-not (Test-Path (Join-Path $profileDir $res))) {
            Write-Output "✗ ${agent}: resource `"$res`" not found"
            $broken++
        }
    }
}

if ($broken -eq 0) { Write-Output "✓ All references resolve" }
