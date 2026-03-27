@echo off
setlocal
call "%~dp0deploy-live.cmd"
exit /b %ERRORLEVEL%
