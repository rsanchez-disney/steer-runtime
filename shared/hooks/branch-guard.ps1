# preToolUse hook: block direct commits/pushes to main/master
$input = $input | ConvertFrom-Json -ErrorAction SilentlyContinue
$cmd = $input.tool_input.command

$branch = git branch --show-current 2>$null
if ($branch -match '^(main|master)$') {
    if ($cmd -match 'git\s+(commit|push|merge)') {
        Write-Error "Blocked: direct $cmd on '$branch' - use a feature branch"
        exit 2
    }
}
exit 0
