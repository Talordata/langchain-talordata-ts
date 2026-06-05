# 🚀 快速开始

## 安装

```bash
npm install langchain-talor-serp
```

## 基本使用

```typescript
import { TalorSerpAPIWrapper } from "langchain-talor-serp";

// 设置 API 密钥
process.env.TALOR_API_KEY = "your-token";

// 创建包装器
const wrapper = new TalorSerpAPIWrapper();

// 搜索
const results = await wrapper.run("TypeScript tutorial");
console.log(results);
```

## 引擎特定搜索

```typescript
// Google 购物
await wrapper.run("laptop", "google_shopping", {
  min_price: "500",
  max_price: "1000",
});

// Google 航班
await wrapper.run("flights", "google_flights", {
  departure_id: "SFO",
  arrival_id: "NRT",
  outbound_date: "2025-03-01",
  return_date: "2025-03-15",
  adults: 2,
});

// Google 图片
await wrapper.run("cats", "google_images", {
  image_size: "large",
  color: "blue",
});
```

## 使用工具

```typescript
import { TalorSerpTool } from "langchain-talor-serp";

// 创建工具
const [searchTool, listTool] = TalorSerpTool.toolsFromApiKey("your-token");

// 搜索
const result = await searchTool.execute({
  query: "TypeScript",
  engine: "google",
  params: { gl: "us" },
});

// 列出引擎
const engines = await listTool.execute({});
```

## 引擎信息

```typescript
// 列出所有引擎
const engines = wrapper.listEngines();
console.log(`Total: ${engines.length}`);

// 获取引擎描述
const desc = wrapper.engineDescription("google_flights");

// 获取参数 schema
const schema = wrapper.engineParamSchema("google_shopping");
```

## 发布到 npm

```bash
# 1. 登录 npm
npm login

# 2. 构建
npm run build

# 3. 发布
npm publish
```

## 本地开发

```bash
# 安装依赖
npm install

# 构建
npm run build

# 运行测试
npm test

# 监视模式
npm run dev
```

## 支持的引擎

- **Google**: 25 个引擎 (搜索、图片、新闻、购物、航班、酒店等)
- **Bing**: 6 个引擎 (搜索、图片、新闻、购物等)
- **Yandex**: 1 个引擎
- **DuckDuckGo**: 1 个引擎

## 更多信息

- [完整文档](README.md)
- [迁移指南](MIGRATION.md)
- [发布指南](PUBLISH_GUIDE.md)
- [实现总结](IMPLEMENTATION_SUMMARY.md)
