#!/bin/bash

# Publish script

echo "Starting publish for langchain-talor-serp..."

# 1. Check npm login status
echo "1. Checking npm login status..."
npm whoami 2>/dev/null
if [ $? -ne 0 ]; then
    echo "ERROR: Not logged in to npm. Run: npm login"
    exit 1
fi
echo "OK: Logged in to npm"

# 2. Clean previous build
echo "2. Cleaning previous build..."
npm run clean

# 3. Build project
echo "3. Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: Build failed"
    exit 1
fi
echo "OK: Build succeeded"

# 4. Run tests
echo "4. Running tests..."
npm test
if [ $? -ne 0 ]; then
    echo "ERROR: Tests failed"
    exit 1
fi
echo "OK: Tests passed"

# 5. Preview publish contents
echo "5. Previewing publish contents..."
npm pack --dry-run

# 6. Confirm publish
echo ""
echo "Ready to publish:"
echo "- Package: langchain-talor-serp"
echo "- Version: $(node -p "require('./package.json').version")"
echo "- Files: dist/, data/"
echo ""
read -p "Publish now? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Publish cancelled"
    exit 1
fi

# 7. Publish to npm
echo "6. Publishing to npm..."
npm publish
if [ $? -ne 0 ]; then
    echo "ERROR: Publish failed"
    exit 1
fi

echo ""
echo "Publish succeeded"
echo "Package URL: https://www.npmjs.com/package/langchain-talor-serp"
echo ""
echo "Install with:"
echo "  npm install langchain-talor-serp"
