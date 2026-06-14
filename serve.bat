@echo off
cd /d "%~dp0"

call corepack enable >nul 2>&1

if not exist node_modules (
  echo Installing dependencies with pnpm...
  call pnpm install
  if errorlevel 1 exit /b 1
)

echo Open http://localhost:8080 in your browser
pnpm run dev
