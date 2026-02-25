@echo off
title Tarkov - Launcher

start "Backend" cmd /k "cd /d %~dp0backend && gradlew.bat bootRun"

timeout /t 10 /nobreak >nul

start "Frontend" cmd /k "cd /d %~dp0frontend && if not exist node_modules npm install && npm run dev"

echo Servers starting...
echo Backend  : http://localhost:8090
echo Frontend : http://localhost:3000
pause
