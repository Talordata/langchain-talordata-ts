@echo off
REM Publish script (Windows)

echo Starting publish for langchain-talordata...

REM 1. Check npm login status
echo 1. Checking npm login status...
npm whoami 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Not logged in to npm. Run: npm login
    pause
    exit /b 1
)
echo OK: Logged in to npm

REM 2. Clean previous build
echo 2. Cleaning previous build...
npm run clean

REM 3. Build project
echo 3. Building project...
npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo OK: Build succeeded

REM 4. Run tests
echo 4. Running tests...
npm test
if %errorlevel% neq 0 (
    echo ERROR: Tests failed
    pause
    exit /b 1
)
echo OK: Tests passed

REM 5. Preview publish contents
echo 5. Previewing publish contents...
npm pack --dry-run

REM 6. Confirm publish
echo.
echo Ready to publish:
echo - Package: langchain-talordata
echo - Version: (read from package.json)
echo - Files: dist/, data/
echo.
set /p confirm="Publish now? (y/N): "
if /i not "%confirm%"=="y" (
    echo Publish cancelled
    pause
    exit /b 1
)

REM 7. Publish to npm
echo 6. Publishing to npm...
npm publish
if %errorlevel% neq 0 (
    echo ERROR: Publish failed
    pause
    exit /b 1
)

echo.
echo Publish succeeded
echo Package URL: https://www.npmjs.com/package/langchain-talordata
echo.
echo Install with:
echo   npm install langchain-talordata
echo.
pause
