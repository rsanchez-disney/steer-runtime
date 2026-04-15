# preToolUse hook: validate agent JSON structure before writing
$file = $env:KIRO_FILE_PATH
if (-not $file) { exit 0 }
if ($file -notmatch '[\\/]agents[\\/].*\.json$') { exit 0 }

Write-Output "## Agent JSON Validation"
Write-Output ""

if (-not (Test-Path $file)) { exit 0 }
$content = Get-Content $file -Raw

$missing = @()
foreach ($field in @("name", "description", "prompt", "tools", "resources")) {
    if ($content -notmatch "`"$field`"") { $missing += $field }
}

if ($missing.Count -gt 0) {
    Write-Output "⚠️ Missing required fields: $($missing -join ', ')"
    Write-Output "Required: name, description, prompt, tools, resources"
} else {
    Write-Output "✓ All required fields present"
}

$basename = [System.IO.Path]::GetFileNameWithoutExtension($file)
if ($content -match '"name"\s*:\s*"([^"]*)"') {
    $name = $Matches[1]
    if ($name -ne $basename) {
        Write-Output "⚠️ name field `"$name`" does not match filename `"$basename`""
    }
}
