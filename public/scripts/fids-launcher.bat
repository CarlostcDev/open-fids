@echo off
setlocal EnableExtensions

title Flight Information Display System

set "URL=__FIDS_URL__"
set "CHROME="

echo ========================================
echo        FIDS Launcher
echo ========================================
echo.
echo Target:
echo %URL%
echo.

echo [1/5] Checking for Google Chrome...

if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" set "CHROME=%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe"
if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" set "CHROME=%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe"
if exist "%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe" set "CHROME=%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe"
if exist "%ProgramW6432%\\Google\\Chrome\\Application\\chrome.exe" set "CHROME=%ProgramW6432%\\Google\\Chrome\\Application\\chrome.exe"

if not defined CHROME (
    for /f "delims=" %%C in ('where chrome.exe 2^>nul') do (
        if not defined CHROME set "CHROME=%%C"
    )
)

if defined CHROME (
    echo Google Chrome found:
    echo %CHROME%
    echo.
    goto CLOSE_CHROME
)

echo Google Chrome was not found.
echo.

echo [2/5] Checking for Winget...

where winget.exe >nul 2>&1
if errorlevel 1 (
    echo ERROR: Windows Package Manager (winget) is not available.
    echo.
    echo Please install Google Chrome manually and run this file again.
    echo.
    pause
    exit /b 1
)

echo Winget found.
echo.

echo [3/5] Installing Google Chrome...

winget install --id Google.Chrome --exact --silent --accept-package-agreements --accept-source-agreements

if errorlevel 1 (
    echo.
    echo ERROR: Google Chrome installation failed.
    echo.
    pause
    exit /b 1
)

echo.
echo Google Chrome installation completed.
echo.

set "CHROME="
if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" set "CHROME=%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe"
if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" set "CHROME=%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe"
if exist "%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe" set "CHROME=%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe"
if exist "%ProgramW6432%\\Google\\Chrome\\Application\\chrome.exe" set "CHROME=%ProgramW6432%\\Google\\Chrome\\Application\\chrome.exe"

if not defined CHROME (
    for /f "delims=" %%C in ('where chrome.exe 2^>nul') do (
        if not defined CHROME set "CHROME=%%C"
    )
)

if not defined CHROME (
    echo ERROR: Google Chrome was installed but chrome.exe could not be located.
    echo.
    pause
    exit /b 1
)

:CLOSE_CHROME

echo [4/5] Closing existing Google Chrome processes...
echo.

taskkill /F /IM chrome.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul

tasklist /FI "IMAGENAME eq chrome.exe" 2>nul | find /I "chrome.exe" >nul
if not errorlevel 1 (
    echo ERROR: Chrome processes are still running.
    echo Please close Google Chrome manually and run this file again.
    echo.
    pause
    exit /b 1
)

echo Chrome processes closed.
echo.

echo [5/5] Starting FIDS in kiosk mode...
echo.

set "FIDS_PROFILE=%TEMP%\\FIDS-Kiosk"

if exist "%FIDS_PROFILE%" (
    rmdir /S /Q "%FIDS_PROFILE%" >nul 2>&1
)

mkdir "%FIDS_PROFILE%" >nul 2>&1

if not exist "%FIDS_PROFILE%" (
    echo ERROR: Could not create the temporary FIDS profile.
    echo.
    pause
    exit /b 1
)

start "" "%CHROME%" --kiosk --user-data-dir="%FIDS_PROFILE%" --no-first-run --no-default-browser-check "%URL%"

if errorlevel 1 (
    echo ERROR: Failed to start Google Chrome.
    echo.
    pause
    exit /b 1
)

exit /b 0
