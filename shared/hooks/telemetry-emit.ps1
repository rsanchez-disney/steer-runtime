# agentComplete/agentFailed hook: emit structured telemetry
$KiroDir = if ($env:KIRO_HOME) { $env:KIRO_HOME } else { "$env:USERPROFILE\.kiro" }
$LogFile = "$KiroDir\logs\telemetry.jsonl"
$MaxSize = 5MB

$Meta = $input | Out-String
if (-not $Meta.Trim()) { exit 0 }

$dir = Split-Path $LogFile
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

$Obj = $Meta | ConvertFrom-Json
$Obj | Add-Member -NotePropertyName "ts" -NotePropertyValue ((Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")) -Force
if (-not $Obj.event) { $evt = if ($Obj.error) { "failed" } else { "complete" }; $Obj | Add-Member -NotePropertyName "event" -NotePropertyValue $evt -Force }
$Entry = $Obj | ConvertTo-Json -Compress

if ((Test-Path $LogFile) -and (Get-Item $LogFile).Length -gt $MaxSize) { Move-Item $LogFile "$LogFile.old" -Force }
Add-Content -Path $LogFile -Value $Entry
