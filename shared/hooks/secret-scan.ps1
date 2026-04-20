# preToolUse hook: scan file content for potential secrets before writing
$input = $input | ConvertFrom-Json -ErrorAction SilentlyContinue
$content = $input.tool_input.content

if ($content -match '(?i)(password|secret|api_key|apikey|token|private_key)\s*[:=]\s*["''][^"'']{8,}') {
    Write-Error "Blocked: potential secret detected in file content - use environment variables"
    exit 2
}
exit 0
