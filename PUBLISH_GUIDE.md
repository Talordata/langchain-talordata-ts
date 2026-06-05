# 使用和发布指南

## 📦 本地使用

### 1. 作为本地包使用

在你的项目中直接引用本地包：

```bash
# 在你的项目中
npm install ../langchain_talor_serp_ts
```

或者使用 npm link：

```bash
# 在 langchain_talor_serp_ts 目录
npm link

# 在你的项目中
npm link langchain-talor-serp
```

### 2. 直接使用源代码

```typescript
// 直接导入 TypeScript 文件
import { TalorSerpAPIWrapper } from "../langchain_talor_serp_ts/src/index";

const wrapper = new TalorSerpAPIWrapper({
  talorApiKey: "your-token",
});
```

## 🚀 发布到 npm

### 步骤 1: 准备发布

```bash
# 1. 确保已登录 npm
npm login

# 2. 检查包名是否可用
npm view langchain-talor-serp

# 3. 更新版本号（如果需要）
npm version patch   # 0.1.0 -> 0.1.1
npm version minor   # 0.1.0 -> 0.2.0
npm version major   # 0.1.0 -> 1.0.0
```

### 步骤 2: 构建和发布

```bash
# 1. 构建项目
npm run build

# 2. 预览将要发布的文件
npm pack --dry-run

# 3. 发布到 npm
npm publish

# 如果是 scoped 包（@your-org/package-name）
npm publish --access public
```

### 步骤 3: 发布到私有 registry（可选）

```bash
# 发布到私有 registry
npm publish --registry https://your-private-registry.com

# 或者使用 .npmrc 文件
echo "registry=https://your-private-registry.com" > .npmrc
npm publish
```

## 📖 使用方法

### 安装

```bash
npm install langchain-talor-serp
```

### 基本使用

```typescript
import { TalorSerpAPIWrapper, TalorSerpTool } from "langchain-talor-serp";

// 设置 API 密钥
process.env.TALOR_API_KEY = "your-token";

// 创建包装器
const wrapper = new TalorSerpAPIWrapper();

// 基本搜索
const results = await wrapper.run("TypeScript tutorial");
console.log(results);

// 引擎特定搜索
const shopping = await wrapper.run("laptop", "google_shopping", {
  min_price: "500",
  max_price: "1000",
});

// 航班搜索
const flights = await wrapper.run("flights", "google_flights", {
  departure_id: "SFO",
  arrival_id: "NRT",
  outbound_date: "2025-03-01",
  return_date: "2025-03-15",
  adults: 2,
});
```

### 使用工具

```typescript
import { TalorSerpTool } from "langchain-talor-serp";

// 创建工具
const [searchTool, listEnginesTool] = TalorSerpTool.toolsFromApiKey("your-token");

// 使用搜索工具
const result = await searchTool.execute({
  query: "TypeScript",
  engine: "google",
  params: { gl: "us", hl: "en" },
});

// 列出所有引擎
const engines = await listEnginesTool.execute({});
console.log(engines);
```

### 引擎信息

```typescript
import { TalorSerpAPIWrapper } from "langchain-talor-serp";

const wrapper = new TalorSerpAPIWrapper();

// 列出所有引擎
const engines = wrapper.listEngines();
console.log(`Total engines: ${engines.length}`);

// 获取引擎描述
const desc = wrapper.engineDescription("google_flights");
console.log(desc);

// 获取引擎参数 schema
const schema = wrapper.engineParamSchema("google_shopping");
console.log(schema);
```

### 历史和统计

```typescript
const wrapper = new TalorSerpAPIWrapper({
  talorApiKey: "your-token",
});

// 查询历史
const history = await wrapper.history({
  page: 1,
  pageSize: 20,
  searchQuery: "query",
  status: "success",
});

// 查询统计
const stats = await wrapper.statistics({
  startDate: "2025-01-01",
  endDate: "2025-01-31",
  engines: "google,bing",
});
```

## 🔧 配置选项

### TalorSerpAPIWrapper 配置

```typescript
const wrapper = new TalorSerpAPIWrapper({
  talorApiKey: "your-token",      // API 密钥
  engine: "google",               // 默认引擎
  endpoint: "https://...",        // API 端点
  gl: "us",                       // 国家代码
  hl: "en",                       // 语言
  device: "desktop",              // 设备类型
  responseMode: "compact",        // 响应模式
  timeout: 15000,                 // 超时时间（毫秒）
  k: 5,                           // 结果数量
});
```

### 环境变量

```bash
# 设置 API 密钥
export TALOR_API_KEY="your-token"

# 或者在 .env 文件中
TALOR_API_KEY=your-token
```

## 📝 发布检查清单

发布前请确保：

- [ ] 更新 `package.json` 中的版本号
- [ ] 运行 `npm run build` 确保编译成功
- [ ] 运行 `npm test` 确保测试通过
- [ ] 检查 `README.md` 文档是否完整
- [ ] 确认 `files` 字段包含所有必要文件
- [ ] 检查 `keywords` 是否合适
- [ ] 确认 `license` 正确

## 🐛 常见问题

### 1. 编译错误

```bash
# 清理并重新编译
npm run clean
npm run build
```

### 2. 类型错误

确保安装了正确的类型定义：

```bash
npm install --save-dev @types/node typescript
```

### 3. 发布权限错误

```bash
# 确保已登录
npm login

# 检查包名是否被占用
npm view package-name
```

### 4. 本地开发调试

```bash
# 使用 ts-node 直接运行 TypeScript
npx ts-node your-file.ts

# 或者使用 nodemon 监听变化
npx nodemon --exec ts-node your-file.ts
```

## 📚 示例项目

查看 `examples/` 目录获取完整示例：

```bash
cd examples
npx ts-node basic-usage.ts
```

## 🔗 相关资源

- [npm 文档](https://docs.npmjs.com/)
- [TypeScript 文档](https://www.typescriptlang.org/docs/)
- [LangChain 文档](https://js.langchain.com/docs/)

## 📞 获取帮助

如果遇到问题：

1. 查看 `README.md` 文档
2. 查看 `MIGRATION.md` 迁移指南
3. 检查 `IMPLEMENTATION_SUMMARY.md` 实现总结
4. 在 GitHub 上提交 issue
