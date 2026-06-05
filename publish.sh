#!/bin/bash

# 发布脚本

echo "🚀 开始发布 langchain-talor-serp..."

# 1. 检查是否已登录 npm
echo "1. 检查 npm 登录状态..."
npm whoami 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ 未登录 npm，请先运行: npm login"
    exit 1
fi
echo "✅ 已登录 npm"

# 2. 清理旧的构建
echo "2. 清理旧的构建..."
npm run clean

# 3. 构建项目
echo "3. 构建项目..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi
echo "✅ 构建成功"

# 4. 运行测试
echo "4. 运行测试..."
npm test
if [ $? -ne 0 ]; then
    echo "❌ 测试失败"
    exit 1
fi
echo "✅ 测试通过"

# 5. 预览发布内容
echo "5. 预览发布内容..."
npm pack --dry-run

# 6. 确认发布
echo ""
echo "准备发布以下内容:"
echo "- 包名: langchain-talor-serp"
echo "- 版本: $(node -p "require('./package.json').version")"
echo "- 文件: dist/, data/"
echo ""
read -p "确认发布? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 发布已取消"
    exit 1
fi

# 7. 发布到 npm
echo "6. 发布到 npm..."
npm publish
if [ $? -ne 0 ]; then
    echo "❌ 发布失败"
    exit 1
fi

echo ""
echo "🎉 发布成功!"
echo "📦 包已发布到: https://www.npmjs.com/package/langchain-talor-serp"
echo ""
echo "安装命令:"
echo "  npm install langchain-talor-serp"
