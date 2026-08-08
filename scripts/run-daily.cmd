@echo off
REM ----------------------------------------------------------------
REM Daily scrape entry point, called by Windows Task Scheduler.
REM
REM Keep this file ASCII-only. cmd.exe reads .cmd files in the system
REM ANSI codepage (cp950 here), so UTF-8 Chinese comments get mangled
REM into garbage that cmd then tries to execute -- the whole script
REM fails with exit code 255 before doing anything. Chinese docs for
REM these scripts live in the .mjs headers and CLAUDE.md instead.
REM
REM Why wrap node in a .cmd at all:
REM   1. Task Scheduler's working directory is not the project root,
REM      so the scripts would fail to find .env.local.
REM   2. Scheduled runs are invisible; without this log nobody would
REM      ever see a failure.
REM ----------------------------------------------------------------
setlocal
cd /d "%~dp0.."

if not exist logs mkdir logs
set LOG=logs\daily.log

echo. >> "%LOG%"
echo ============================================== >> "%LOG%"
echo [START] %date% %time% >> "%LOG%"

echo --- properties --- >> "%LOG%"
node scripts\scrape-kenbiya.mjs >> "%LOG%" 2>&1
echo (exit %errorlevel%) >> "%LOG%"

echo --- news --- >> "%LOG%"
node scripts\scrape-news.mjs >> "%LOG%" 2>&1
echo (exit %errorlevel%) >> "%LOG%"

echo [DONE] %date% %time% >> "%LOG%"
endlocal
