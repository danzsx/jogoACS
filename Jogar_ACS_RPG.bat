@echo off
title Territorio Vivo - Cronicas de um ACS (Desktop RPG)
echo Iniciando Territorio Vivo: Cronicas de um ACS...

set INDEX_PATH=%~dp0public\index.html
set FILE_URL=file:///%INDEX_PATH:\=/%

if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="%FILE_URL%" --window-size=1366,820
    exit /b
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="%FILE_URL%" --window-size=1366,820
    exit /b
)
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="%FILE_URL%" --window-size=1366,820
    exit /b
)

start "" "%INDEX_PATH%"

