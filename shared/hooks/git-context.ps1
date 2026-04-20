# agentSpawn hook: inject git context into agent
Write-Output "## Current Git Context"
$branch = git branch --show-current 2>$null
if (-not $branch) { $branch = "not a git repo" }
Write-Output "Branch: $branch"
$status = git status --short 2>$null | Select-Object -First 10
Write-Output "Status: "
if ($status) {
    $status | ForEach-Object { Write-Output $_ }
    $dirty = (git status --short 2>$null | Measure-Object).Count
    Write-Output "($dirty uncommitted changes)"
} else {
    Write-Output "(clean)"
}
