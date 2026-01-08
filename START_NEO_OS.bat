@echo off
echo INICIANDO SERVIDOR LOCAL NEO-OS...
echo Esto es necesario para que las texturas 3D y el Audio funcionen correctamente.
echo (Evita bloqueos de seguridad CORS del navegador)
echo.
echo Abriendo navegador...
call npx -y http-server . -o -c-1
pause
