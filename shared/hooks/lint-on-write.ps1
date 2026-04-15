# postToolUse hook: auto-run linter after file writes
$input = $input | ConvertFrom-Json -ErrorAction SilentlyContinue
$file = $input.tool_input.path

switch -Regex ($file) {
    '\.(ts|tsx|js|jsx)$' {
        npx eslint --fix $file 2>$null
        if ($LASTEXITCODE -eq 0) { Write-Output "✓ Linted $file" }
    }
    '\.py$' {
        if (Get-Command ruff -ErrorAction SilentlyContinue) {
            ruff format $file 2>$null
            if ($LASTEXITCODE -eq 0) { Write-Output "✓ Formatted $file" }
        }
    }
    '\.java$' {
        if (Get-Command google-java-format -ErrorAction SilentlyContinue) {
            google-java-format -i $file 2>$null
            if ($LASTEXITCODE -eq 0) { Write-Output "✓ Formatted $file" }
        }
    }
}
exit 0
