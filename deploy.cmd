@echo off
REM Double-click this, or run `deploy` from the blog folder.
REM It builds first and refuses to push if the build fails.
REM Everything it does lives in scripts\deploy.mjs.

cd /d "%~dp0"
call npm run deploy -- %*

REM Keep the window open when double-clicked, so the result is readable.
echo.
pause
