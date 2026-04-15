# preToolUse hook: block writes to sensitive paths
$input = $input | ConvertFrom-Json -ErrorAction SilentlyContinue
$file = $input.tool_input.path

if ($file -match '[\\/]node_modules[\\/]|[\\/]dist[\\/]|[\\/]\.git[\\/]') {
    Write-Error "Blocked: writing to $file is not allowed"
    exit 2
}
exit 0
