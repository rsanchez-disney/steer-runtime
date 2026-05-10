# agentComplete hook: summarize session into active-context.md
$KiroDir = if ($env:KIRO_HOME) { $env:KIRO_HOME } else { "$env:USERPROFILE\.kiro" }
$ActiveCtx = "$KiroDir\memory-bank\active-context.md"

$Meta = $input | Out-String
if (-not $Meta.Trim()) { exit 0 }

$Obj = $Meta | ConvertFrom-Json
if ($Obj.duration_ms -lt 60000) { exit 0 }
if ($Obj.tool_calls -lt 5) { exit 0 }
if (-not (Test-Path $ActiveCtx)) { exit 0 }

$Date = (Get-Date).ToString("yyyy-MM-dd HH:mm")
$Dur = [math]::Floor($Obj.duration_ms / 1000)
$Pct = [math]::Floor($Obj.context_usage_pct * 100)
$Entry = "- $Date — $($Obj.agent): ${Dur}s, $($Obj.tool_calls) tools, ${Pct}% context"
Add-Content -Path $ActiveCtx -Value "`n$Entry"

# Trim >7 days
$Cutoff = (Get-Date).AddDays(-7)
$Lines = Get-Content $ActiveCtx
$Kept = @()
foreach ($line in $Lines) {
    if ($line -match '^- (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) —') {
        $ts = [datetime]::ParseExact($Matches[1], "yyyy-MM-dd HH:mm", $null)
        if ($ts -lt $Cutoff) { continue }
    }
    $Kept += $line
}
Set-Content -Path $ActiveCtx -Value ($Kept -join "`n")
