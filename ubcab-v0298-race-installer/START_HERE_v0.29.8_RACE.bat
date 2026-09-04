@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0BUILD_AND_INSTALL_v0.29.8_RACE.ps1"
pause
