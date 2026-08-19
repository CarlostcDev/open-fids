#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

export LC_ALL=C

URL="__FIDS_URL__"
CHROME=""

echo "========================================"
echo "          OpenFIDS Launcher"
echo "========================================"
echo
echo "Target:"
echo "$URL"
echo

if [[ -z "$URL" || "$URL" == "__FIDS_URL__" ]]; then
    echo "ERROR: FIDS URL is not defined."
    echo
    exit 1
fi

find_browser() {
    local browser

    for browser in \
        chromium \
        chromium-browser \
        chromium-freeworld \
        google-chrome-stable \
        google-chrome \
        chrome
    do
        if command -v "$browser" >/dev/null 2>&1; then
            command -v "$browser"
            return 0
        fi
    done

    return 1
}

run_root() {
    if [[ "$EUID" -eq 0 ]]; then
        "$@"
    elif command -v sudo >/dev/null 2>&1; then
        sudo "$@"
    else
        echo "ERROR: Root privileges are required but sudo is not available."
        echo
        exit 1
    fi
}

install_chromium() {
    local manager

    echo "[2/5] Detecting installation method..."
    echo

    if command -v apt-get >/dev/null 2>&1; then
        manager="apt"

    elif command -v dnf >/dev/null 2>&1; then
        manager="dnf"

    elif command -v yum >/dev/null 2>&1; then
        manager="yum"

    elif command -v pacman >/dev/null 2>&1; then
        manager="pacman"

    elif command -v zypper >/dev/null 2>&1; then
        manager="zypper"

    elif command -v apk >/dev/null 2>&1; then
        manager="apk"

    elif command -v emerge >/dev/null 2>&1; then
        manager="emerge"

    elif command -v xbps-install >/dev/null 2>&1; then
        manager="xbps"

    elif command -v nix-env >/dev/null 2>&1; then
        manager="nix"

    elif command -v snap >/dev/null 2>&1; then
        manager="snap"

    elif command -v flatpak >/dev/null 2>&1; then
        manager="flatpak"

    else
        manager=""
    fi

    if [[ -z "$manager" ]]; then
        echo "ERROR: No supported package manager was found."
        echo
        echo "The operating system does not provide a supported way"
        echo "to install Chromium automatically."
        echo
        exit 1
    fi

    echo "Installation method:"
    echo "$manager"
    echo

    case "$manager" in
        apt)
            run_root apt-get update
            run_root apt-get install -y chromium
            ;;

        dnf)
            run_root dnf install -y chromium
            ;;

        yum)
            run_root yum install -y chromium
            ;;

        pacman)
            run_root pacman -Sy --noconfirm chromium
            ;;

        zypper)
            run_root zypper --non-interactive install chromium
            ;;

        apk)
            run_root apk add chromium
            ;;

        emerge)
            run_root emerge --ask=n www-client/chromium
            ;;

        xbps)
            run_root xbps-install -Sy chromium
            ;;

        nix)
            if [[ "$EUID" -eq 0 ]]; then
                nix-env -iA nixpkgs.chromium
            else
                nix-env -iA nixpkgs.chromium
            fi
            ;;

        snap)
            run_root snap install chromium
            ;;

        flatpak)
            if ! flatpak remotes | awk '{print $1}' | grep -qx "flathub"; then
                run_root flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
            fi

            flatpak install -y flathub org.chromium.Chromium
            ;;
    esac
}

echo "[1/5] Checking for Chromium or Google Chrome..."
echo

if CHROME="$(find_browser)"; then
    echo "Browser found:"
    echo "$CHROME"
    echo
else
    echo "No supported browser was found."
    echo

    install_chromium

    echo
    echo "Chromium installation completed."
    echo

    echo "[3/5] Verifying Chromium installation..."
    echo

    if CHROME="$(find_browser)"; then
        echo "Browser found:"
        echo "$CHROME"
        echo
    else
        if command -v flatpak >/dev/null 2>&1 &&
           flatpak info org.chromium.Chromium >/dev/null 2>&1; then
            CHROME="flatpak run org.chromium.Chromium"
        elif command -v snap >/dev/null 2>&1 &&
             snap list chromium >/dev/null 2>&1; then
            CHROME="snap run chromium"
        else
            echo "ERROR: Chromium installation completed but no executable could be found."
            echo
            exit 1
        fi
    fi
fi

echo "[4/5] Closing existing browser processes..."
echo

pkill -TERM -x chromium 2>/dev/null || true
pkill -TERM -x chromium-browser 2>/dev/null || true
pkill -TERM -x chromium-freeworld 2>/dev/null || true
pkill -TERM -x google-chrome 2>/dev/null || true
pkill -TERM -x google-chrome-stable 2>/dev/null || true
pkill -TERM -x chrome 2>/dev/null || true

sleep 2

pkill -KILL -x chromium 2>/dev/null || true
pkill -KILL -x chromium-browser 2>/dev/null || true
pkill -KILL -x chromium-freeworld 2>/dev/null || true
pkill -KILL -x google-chrome 2>/dev/null || true
pkill -KILL -x google-chrome-stable 2>/dev/null || true
pkill -KILL -x chrome 2>/dev/null || true

if pgrep -x chromium >/dev/null 2>&1 ||
   pgrep -x chromium-browser >/dev/null 2>&1 ||
   pgrep -x chromium-freeworld >/dev/null 2>&1 ||
   pgrep -x google-chrome >/dev/null 2>&1 ||
   pgrep -x google-chrome-stable >/dev/null 2>&1 ||
   pgrep -x chrome >/dev/null 2>&1; then
    echo "ERROR: Browser processes are still running."
    echo
    exit 1
fi

echo "Browser processes closed."
echo

FIDS_PROFILE="${XDG_RUNTIME_DIR:-/tmp}/OpenFIDS-Kiosk"

if [[ -d "$FIDS_PROFILE" ]]; then
    rm -rf "$FIDS_PROFILE"
fi

if ! mkdir -p "$FIDS_PROFILE"; then
    echo "ERROR: Could not create the FIDS profile."
    echo
    exit 1
fi

if [[ ! -d "$FIDS_PROFILE" ]]; then
    echo "ERROR: FIDS profile was not created."
    echo
    exit 1
fi

echo "FIDS profile:"
echo "$FIDS_PROFILE"
echo

if [[ "$CHROME" == "flatpak run org.chromium.Chromium" ]]; then
    flatpak run org.chromium.Chromium \
        --kiosk \
        --user-data-dir="$FIDS_PROFILE" \
        --no-first-run \
        --no-default-browser-check \
        "$URL" >/dev/null 2>&1 &
elif [[ "$CHROME" == "snap run chromium" ]]; then
    snap run chromium \
        --kiosk \
        --user-data-dir="$FIDS_PROFILE" \
        --no-first-run \
        --no-default-browser-check \
        "$URL" >/dev/null 2>&1 &
else
    "$CHROME" \
        --kiosk \
        --user-data-dir="$FIDS_PROFILE" \
        --no-first-run \
        --no-default-browser-check \
        "$URL" >/dev/null 2>&1 &
fi

CHROME_PID=$!

sleep 3

if ! kill -0 "$CHROME_PID" 2>/dev/null; then
    echo "ERROR: Chromium failed to start."
    echo
    exit 1
fi

echo
echo "OpenFIDS started successfully."
echo

exit 0
