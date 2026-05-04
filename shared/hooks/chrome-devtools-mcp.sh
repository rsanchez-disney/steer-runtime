#!/bin/bash
# Wrapper for @anthropic-ai/chrome-devtools-mcp that ensures Chrome is running
# before starting the MCP server. Used as the mcp.json command instead of npx directly.
PORT=9222

# Check if Chrome remote debugging is already available
if ! curl -s "http://localhost:$PORT/json/version" >/dev/null 2>&1; then
    # Launch Chrome based on OS
    case "$(uname -s)" in
        Darwin*)
            osascript -e 'quit app "Google Chrome"' 2>/dev/null
            sleep 1
            /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=$PORT &>/dev/null &
            ;;
        MINGW*|MSYS*|CYGWIN*)
            taskkill //IM chrome.exe //F 2>/dev/null
            sleep 1
            for p in "/c/Program Files/Google/Chrome/Application/chrome.exe" \
                     "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" \
                     "$LOCALAPPDATA/Google/Chrome/Application/chrome.exe"; do
                [ -f "$p" ] && "$p" --remote-debugging-port=$PORT & break
            done
            ;;
        Linux*)
            if grep -qi microsoft /proc/version 2>/dev/null; then
                taskkill.exe /IM chrome.exe /F 2>/dev/null
                sleep 1
                for p in "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" \
                         "/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe"; do
                    [ -f "$p" ] && "$p" --remote-debugging-port=$PORT & break
                done
            else
                pkill -f chrome 2>/dev/null
                sleep 1
                chrome_bin=$(command -v google-chrome || command -v google-chrome-stable || command -v chromium-browser 2>/dev/null)
                [ -n "$chrome_bin" ] && "$chrome_bin" --remote-debugging-port=$PORT &
            fi
            ;;
    esac

    # Wait for Chrome to be ready
    for i in $(seq 1 20); do
        curl -s "http://localhost:$PORT/json/version" >/dev/null 2>&1 && break
        sleep 0.5
    done
fi

# Start the actual MCP server
exec npx -y @anthropic-ai/chrome-devtools-mcp@latest
