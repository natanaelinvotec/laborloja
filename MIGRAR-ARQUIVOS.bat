@echo off
chcp 65001 >nul
echo Migrando fotos e PDFs do WordPress para a pasta "uploads"...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\migrar-arquivos.ps1" %*
echo.
pause
