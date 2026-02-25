@echo off
title Backend
cd /d %~dp0backend
call gradlew.bat bootRun
pause
