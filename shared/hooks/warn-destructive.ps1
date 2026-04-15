# postToolUse hook: log destructive bash commands
$input = $input | ConvertFrom-Json -ErrorAction SilentlyContinue
$cmd = $input.tool_input.command

if ($cmd -match 'rm\s+-rf|DROP\s+TABLE|DELETE\s+FROM|force\s+push|--force') {
    Write-Output "⚠️  Destructive command detected: $cmd"
}
exit 0
