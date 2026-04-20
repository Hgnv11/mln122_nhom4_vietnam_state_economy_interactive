@echo off
chcp 65001 > nul
title fpt.tokyo deploy launcher
setlocal

set "PROJECT=%~dp0"
set "TUNNEL_NAME=kimngan"
set "VITE_TAG=FPT_TOKYO_VITE"
set "CF_TAG=FPT_TOKYO_CF"

echo.
echo ================================================
echo    fpt.tokyo - Deploy Launcher
echo    MLN122 - Nhom 4 - Kinh te chinh tri
echo ================================================
echo.

cd /d "%PROJECT%" || (
    echo [LOI] Khong vao duoc thu muc project: %PROJECT%
    pause
    exit /b 1
)

echo [1/4] Kiem tra node_modules...
if not exist "node_modules\" (
    echo         Chua cai dependencies - chay npm install...
    call npm install
    if errorlevel 1 (
        echo [LOI] npm install that bai.
        pause
        exit /b 1
    )
) else (
    echo         OK.
)

echo.
echo [2/4] Build san pham (vite build)...
call npm run build
if errorlevel 1 (
    echo [LOI] Build that bai.
    pause
    exit /b 1
)

echo.
echo [3/4] Khoi dong Vite preview tren cong 5173...
start "%VITE_TAG%" /D "%PROJECT%" cmd /c "npm run preview"
timeout /t 4 /nobreak > nul

echo.
echo [4/4] Khoi dong Cloudflare tunnel: %TUNNEL_NAME%
start "%CF_TAG%" cmd /c "cloudflared tunnel run %TUNNEL_NAME%"
timeout /t 4 /nobreak > nul

echo.
echo ================================================
echo    DEPLOY DANG CHAY
echo.
echo    Local   : http://localhost:5173/
echo    Public  : https://fpt.tokyo/
echo.
echo    Nhan bat ki phim nao de DUNG va dong tat ca
echo ================================================
echo.
pause > nul

echo.
echo Dang dong tat ca tien trinh...
taskkill /FI "WINDOWTITLE eq %VITE_TAG%*" /T /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq %CF_TAG%*" /T /F > nul 2>&1

echo Da dong. Tam biet!
timeout /t 2 /nobreak > nul
endlocal
exit /b 0
