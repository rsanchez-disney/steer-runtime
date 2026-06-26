#Requires -Version 5.1
<#
.SYNOPSIS
    ⛔ DEPRECATED — This script has been replaced by Koda.

.DESCRIPTION
    Install Koda:
      irm https://raw.githubusercontent.com/rsanchez-disney/Koda/main/install.ps1 | iex

    Equivalent commands:
      koda install              Install profiles + MCP servers
      koda sync                 Update installed profiles
      koda workspace apply <n>  Apply team workspace
      koda mcp-install          Configure MCP tokens

    Docs: https://github.disney.com/SANCR225/Koda
#>

Write-Host ""
Write-Host "⛔ setup.ps1 is deprecated. Use Koda instead:" -ForegroundColor Red
Write-Host ""
Write-Host "  Install:  irm https://raw.githubusercontent.com/rsanchez-disney/Koda/main/install.ps1 | iex"
Write-Host "  Then:     koda install"
Write-Host ""
Write-Host "  Mapping:"
Write-Host "    setup.ps1 install <profiles>    →  koda install"
Write-Host "    setup.ps1 sync                  →  koda sync"
Write-Host "    setup.ps1 mcp-install           →  koda mcp-install"
Write-Host "    setup.ps1 workspace apply <n>   →  koda workspace apply <n>"
Write-Host ""
Write-Host "  Docs: https://github.disney.com/SANCR225/Koda"
Write-Host ""
exit 1
