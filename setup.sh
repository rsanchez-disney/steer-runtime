#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════════╗
# ║  ⛔ DEPRECATED — This script has been replaced by Koda.            ║
# ║                                                                      ║
# ║  Install Koda:                                                       ║
# ║    curl -fsSL https://raw.githubusercontent.com/rsanchez-disney/\    ║
# ║         Koda/main/install.sh | bash                                  ║
# ║                                                                      ║
# ║  Equivalent commands:                                                ║
# ║    koda install              Install profiles + MCP servers          ║
# ║    koda sync                 Update installed profiles               ║
# ║    koda workspace apply <n>  Apply team workspace                    ║
# ║    koda mcp-install          Configure MCP tokens                    ║
# ║                                                                      ║
# ║  Docs: https://github.disney.com/SANCR225/Koda                      ║
# ╚══════════════════════════════════════════════════════════════════════╝

echo ""
echo "⛔ setup.sh is deprecated. Use Koda instead:"
echo ""
echo "  Install:  curl -fsSL https://raw.githubusercontent.com/rsanchez-disney/Koda/main/install.sh | bash"
echo "  Then:     koda install"
echo ""
echo "  Mapping:"
echo "    setup.sh install <profiles>    →  koda install"
echo "    setup.sh sync                  →  koda sync"
echo "    setup.sh mcp-install           →  koda mcp-install"
echo "    setup.sh workspace apply <n>   →  koda workspace apply <n>"
echo ""
echo "  Docs: https://github.disney.com/SANCR225/Koda"
echo ""
exit 1
