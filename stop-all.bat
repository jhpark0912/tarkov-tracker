@echo off
title Stop Servers
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8090 " ^| findstr "LISTENING"') do taskkill /F /PID %%a
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 " ^| findstr "LISTENING"') do taskkill /F /PID %%a
echo Done.
pause
