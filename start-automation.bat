@echo off
title DakPost PLI - 6:00 AM Birthday Auto-Dispatcher
cd /d "%~dp0backend"
echo =========================================================
echo    DakPost India Post PLI - Birthday Automation
echo    Runs automatically every day at 6:00 AM IST
echo    Includes instant catch-up if computer starts after 6 AM
echo =========================================================
echo.
node index.js
pause
