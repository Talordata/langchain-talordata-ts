@echo off
REM 发布脚本 (Windows)

echo 🚀 开始发布 langchain-talor-serp...

REM 1. 检查是否已登录 npm
echo 1. 检查 npm 登录状态...
npm whoami 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未登录 npm，请先运行: npm login
    pause
    exit /b 1
)
echo ✅ 已登录 npm

REM 2. 清理旧的构建
echo 2. 清理旧的构建...
npm run clean

REM 3. 构建项目
echo 3. 构建项目...
npm run build
if %errorlevel% neq 0 (
    echo ❌ 构建失败
    pause
    exit /b 1
)
echo ✅ 构建成功

REM 4. 运行测试
echo 4. 运行测试...
npm test
if %errorlevel% neq 0 (
    echo ❌ 测试失败
    pause
    exit /b 1
)
echo ✅ 测试通过

REM 5. 预览发布内容
echo 5. 预览发布内容...
npm pack --dry-run

REM 6. 确认发布
echo.
echo 准备发布以下内容:
echo - 包名: langchain-talor-serp
echo - 版本: (从 package.json 读取)
echo - 文件: dist/, data/
echo.
set /p confirm="确认发布? (y/N): "
if /i not "%confirm%"=="y" (
    echo ❌ 发布已取消
    pause
    exit /b 1
)

REM 7. 发布到 npm
echo 6. 发布到 npm...
npm publish
if %errorlevel% neq 0 (
    echo ❌ 发布失败
    pause
    exit /b 1
)

echo.
echo 🎉 发布成功!
echo 📦 包已发布到: https://www.npmjs.com/package/langchain-talor-serp
echo.
echo 安装命令:
echo   npm install langchain-talor-serp
echo.
pause
