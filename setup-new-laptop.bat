@echo off
title AI Healthcare Assistant - Setup
echo ==========================================================
echo  [AI Healthcare Assistant] Automated Setup for New Laptop
echo ==========================================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0setup-new-laptop.ps1"
pause
