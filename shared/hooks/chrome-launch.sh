#!/bin/bash
# agentSpawn hook: ensure Chrome is running with remote debugging on port 9222
PORT=9222

if curl -s "http://localhost:$PORT/json/version" >/dev/null 2>&1; then
    echo "## Chrome Remote Debugging"
    echo "Chrome already running on port $PORT"
    exit 0
fi

case "$(uname -s)" in
    Darwin*)
        /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
            --remote-debugging-port=$PORT \
            --user-data-dir="$HOME/.chrome-debug-profile" &>/dev/null &
        ;;
    MINGW*|MSYS*|CYGWIN*)
        for p in \
            "/c/Program Files/Google/Chrome/Application/chrome.exe" \
            "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" \
            "$LOCALAPPDATA/Google/Chrome/Application/chrome.exe"; do
            if [ -f "$p" ]; then
                "$p" --remote-debugging-port=$PORT --user-data-dir="$HOME/.chrome-debug-profile" &
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
                    "$p" --remote-debugging-port=$PORT --user-data-dir="$HOME/.chrome-debug-profile" &
                    break
                fi
            done
        else
            chrome_bin=$(command -v google-chrome || command -v google-chrome-stable || command -v chromium-browser 2>/dev/null)
            [ -n "$chrome_bin" ] && "$chrome_bin" --remote-debugging-port=$PORT --user-data-dir="$HOME/.chrome-debug-profile" &
        fi
        ;;
esac

for i in $(seq 1 10); do
    if curl -s "http://localhost:$PORT/json/version" >/dev/null 2>&1; then
        echo "## Chrome Remote Debugging"
        echo "Chrome launched on port $PORT"
        exit 0
    fi
    sleep 0.5
done

echo "## Chrome Remote Debugging"
echo "WARNING: Chrome did not start on port $PORT"
echo "Launch manually: /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=$PORT --user-data-dir=\$HOME/.chrome-debug-profile"
