@echo off
setlocal
title Planeacion Inclusiva PIAR
cd /d "%~dp0"

if not exist "node_modules" (
    echo Instalando dependencias por primera vez, esto puede tardar unos minutos...
    call npm install
    if errorlevel 1 (
        echo.
        echo Hubo un error instalando las dependencias. Revisa el mensaje de arriba.
        pause
        exit /b 1
    )
)

echo Iniciando el servidor de la aplicacion...
start "Planeacion Inclusiva - Servidor (no cerrar)" cmd /k "npm run dev"

echo Esperando a que la aplicacion este lista...
set INTENTOS=0

:esperar
set /a INTENTOS+=1
curl -s -o NUL -w "%%{http_code}" http://localhost:3000 > "%TEMP%\pi_status.txt" 2>NUL
set /p STATUS=<"%TEMP%\pi_status.txt"
if "%STATUS%"=="200" goto listo
if %INTENTOS% GEQ 40 goto agotado
timeout /t 1 /nobreak >nul
goto esperar

:listo
start "" "http://localhost:3000"
echo.
echo La aplicacion se abrio en tu navegador.
echo Para detenerla, cierra la ventana "Planeacion Inclusiva - Servidor".
goto fin

:agotado
echo.
echo El servidor esta tardando mas de lo normal. Revisa la ventana del servidor.
echo Cuando veas "Ready", abre manualmente http://localhost:3000 en tu navegador.

:fin
pause
endlocal
