# agentComplete hook: append session telemetry to JSONL log
# Stdin: {"agent","sessionId","duration_ms","tool_calls","context_usage_pct"}

$KiroDir = if ($env:KIRO_HOME) { $env:KIRO_HOME } else { "$env:USERPROFILE\.kiro" }
$LogDir = "$KiroDir\logs"
$LogFile = "$LogDir\session-history.jsonl"
$MaxSize = 1MB

if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

$Meta = $input | Out-String
if (-not $Meta.Trim()) { exit 0 }

$Ts = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$Obj = $Meta | ConvertFrom-Json
$Obj | Add-Member -NotePropertyName "ts" -NotePropertyValue $Ts -Force
$Entry = $Obj | ConvertTo-Json -Compress

if ((Test-Path $LogFile) -and (Get-Item $LogFile).Length -gt $MaxSize) {
    Move-Item $LogFile "$LogFile.old" -Force
}

Add-Content -Path $LogFile -Value $Entry
