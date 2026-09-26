@echo off
title DevStation Local AI Proxy
echo Starting DevStation Local AI proxy...
echo Keep this window open while using the workstation.
echo.
node "%~dp0server.mjs"
pause
