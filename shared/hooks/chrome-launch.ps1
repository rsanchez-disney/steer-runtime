# agentSpawn hook: ensure Chrome is running with remote debugging on port 9222
$Port = 9222

try {
    $null = Invoke-WebRequest -Uri "http://localhost:$Port/json/version" -TimeoutSec 2 -ErrorAction Stop
    Write-Output "## Chrome Remote Debugging"
    Write-Output "Chrome already running on port $Port"
    exit 0
} catch {}

# Chrome must be fully closed before launching with --remote-debugging-port
Stop-Process -Name "chrome" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

$chromePaths = @(
    "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "${env:LOCALAPPDATA}\Google\Chrome\Application\chrome.exe"
)
foreach ($p in $chromePaths) {
    if (Test-Path $p) {
        Start-Process -FilePath $p -ArgumentList "--remote-debugging-port=$Port"
        break
    }
}

for ($i = 0; $i -lt 10; $i++) {
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:$Port/json/version" -TimeoutSec 1 -ErrorAction Stop
        Write-Output "## Chrome Remote Debugging"
        Write-Output "Chrome launched on port $Port"
        exit 0
    } catch {}
    Start-Sleep -Milliseconds 500
}

Write-Output "## Chrome Remote Debugging"
Write-Output "WARNING: Chrome did not start on port $Port"
