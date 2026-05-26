#!/bin/bash
# agentSpawn hook: ensure Chrome is running with remote debugging on port 9222
# Exit 0 = Chrome ready (stdout injected into agent context)
# Exit 2 = Chrome unavailable (stderr shown to user, agent blocked)
PORT=9222
# Platform-aware debug profile directory
case "$(uname -s)" in
    Darwin*) CHROME_DEBUG_DIR="$HOME/Library/Application Support/Google/Chrome-Debug" ;;
    *)       CHROME_DEBUG_DIR="$HOME/.config/google-chrome-debug" ;;
esac

if curl -s "http://localhost:$PORT/json/version" >/dev/null 2>&1; then
    echo "## Chrome Remote Debugging"
    echo "Chrome already running on port $PORT"
    exit 0
fi

# Launch Chrome with a separate user-data-dir (REQUIRED for debug port to bind)
case "$(uname -s)" in
    Darwin*)
        /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
            --remote-debugging-port=$PORT --headless=new \
            --user-data-dir="$CHROME_DEBUG_DIR" &>/dev/null &
        ;;
    MINGW*|MSYS*|CYGWIN*)
        for p in \
            "/c/Program Files/Google/Chrome/Application/chrome.exe" \
            "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" \
            "$LOCALAPPDATA/Google/Chrome/Application/chrome.exe"; do
            if [ -f "$p" ]; then
                "$p" --remote-debugging-port=$PORT --headless=new --user-data-dir="$CHROME_DEBUG_DIR" &
                break
            fi
        done
        ;;
    Linux*)
        if grep -qi microsoft /proc/version 2>/dev/null; then
            for p in \
                "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" \
                "/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe"; do
                if [ -f "$p" ]; then
                    "$p" --remote-debugging-port=$PORT --headless=new --user-data-dir="$CHROME_DEBUG_DIR" &
                    break
                fi
            done
        else
            chrome_bin=$(command -v google-chrome || command -v google-chrome-stable || command -v chromium-browser 2>/dev/null)
            [ -n "$chrome_bin" ] && "$chrome_bin" --remote-debugging-port=$PORT --headless=new --user-data-dir="$CHROME_DEBUG_DIR" &
        fi
        ;;
esac

for i in $(seq 1 10); do
    if curl -s "http://localhost:$PORT/json/version" >/dev/null 2>&1; then
        echo "## Chrome Remote Debugging"
        echo "Chrome launched (headless) on port $PORT"
        exit 0
    fi
    sleep 0.5
done

echo "Chrome failed to start on port $PORT." >&2
echo "Ensure Chrome is installed. Debug port requires --user-data-dir (non-default profile)." >&2
echo "  Manual: /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=$PORT --user-data-dir=\"\$HOME/Library/Application Support/Google/Chrome-Debug\"" >&2
exit 2
