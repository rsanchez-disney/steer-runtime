# preToolUse hook: only allow writing .feature files
$FilePath = $env:KIRO_TOOL_INPUT_path
if ($FilePath -and $FilePath -notmatch '\.feature$') {
    Write-Error "BLOCKED: Only .feature files can be written. Attempted: $FilePath"
    exit 1
}
exit 0
