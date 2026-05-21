#!/bin/bash
# agentSpawn hook: ensure Chrome is running with remote debugging on port 9222
# Exit 0 = Chrome ready (stdout injected into agent context)
# Exit 2 = Chrome unavailable (stderr shown to user, agent blocked)
PORT=9222

if curl -s "http://localhost:$PORT/json/version" >/dev/null 2>&1; then
    echo "## Chrome Remote Debugging"
    echo "Chrome already running on port $PORT"
    exit 0
fi

# Launch headless Chrome — avoids killing user's browser session
case "$(uname -s)" in
    Darwin*)
        /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
            --remote-debugging-port=$PORT --headless=new --disable-gpu &>/dev/null &
        ;;
    MINGW*|MSYS*|CYGWIN*)
        for p in \
            "/c/Program Files/Google/Chrome/Application/chrome.exe" \
            "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" \
            "$LOCALAPPDATA/Google/Chrome/Application/chrome.exe"; do
            if [ -f "$p" ]; then
                "$p" --remote-debugging-port=$PORT --headless=new --disable-gpu &
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
                    "$p" --remote-debugging-port=$PORT --headless=new --disable-gpu &
                    break
                fi
            done
        else
            chrome_bin=$(command -v google-chrome || command -v google-chrome-stable || command -v chromium-browser 2>/dev/null)
            [ -n "$chrome_bin" ] && "$chrome_bin" --remote-debugging-port=$PORT --headless=new --disable-gpu &
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

echo "Chrome failed to start on port $PORT. Ensure Chrome is installed or start manually:" >&2
echo "  google-chrome --remote-debugging-port=$PORT --headless=new" >&2
exit 2
