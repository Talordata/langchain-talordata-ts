# langchain-talor-serp

**LangChain integration for TalorData's SERP APIs - TypeScript**

[![npm version](https://img.shields.io/npm/v/langchain-talor-serp?color=blue)](https://www.npmjs.com/package/langchain-talor-serp)
[![Node versions](https://img.shields.io/node/v/langchain-talor-serp)](https://www.npmjs.com/package/langchain-talor-serp)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

[Installation](#installation) •
[Quick Start](#quick-start) •
[Tools](#tools) •
[Resources](#resources)

TypeScript integration for the Talor SERP API.

This package provides:

- `TalorSerpAPIWrapper` for direct async API access
- `TalorSerpTool` for creating tool-like objects for agents and model tool routing
- bundled engine schemas for 30+ search engines
- support for search, history, and statistics endpoints

## Overview

`langchain-talor-serp` provides TypeScript tools for [TalorData](https://talordata.com)'s SERP APIs, enabling your AI apps to:

- **Search** - Query search engines with geo-targeting and language customization
- **Inspect engines** - Discover supported engines and engine-specific parameters
- **Query history** - Fetch SERP request history with filters
- **View statistics** - Retrieve usage statistics by date range and engine

## Installation

```bash
npm install langchain-talor-serp
```

## Quick Start

### 1. Set up authentication

```typescript
process.env.TALOR_API_KEY = "your-token";
```

### 2. Wrapper usage

```typescript
import { TalorSerpAPIWrapper } from "langchain-talor-serp";

const wrapper = new TalorSerpAPIWrapper();
const result = await wrapper.run("LangChain tutorial");
console.log(result);
```

### 3. Search tool

```typescript
import { TalorSerpTool } from "langchain-talor-serp";

const searchTool = TalorSerpTool.fromEnv();

const result = await searchTool.execute({
  query: "LangChain tutorial",
  engine: "google",
  params: {
    gl: "us",
    hl: "en",
    device: "desktop",
  },
});

console.log(result);
```

Search parameters:

- `query`: required search query text
- `engine`: optional engine key such as `google`, `google_news`, `google_images`, `bing`, `duckduckgo`
- `params`: optional engine-specific parameter object
- common `params` fields include `gl`, `hl`, `device`, `location`, and `no_cache`
- use `talor_serp_list_engines` to inspect detailed parameters for a specific engine

`params` also accepts a JSON string when returned by a model tool call, for example:

```typescript
const result = await searchTool.execute({
  query: "LangChain tutorial",
  engine: "google",
  params: "{\"hl\": \"zh-CN\", \"gl\": \"cn\"}",
});
```

### 4. History tool

```typescript
import { TalorSerpTool } from "langchain-talor-serp";

const historyTool = TalorSerpTool.historyFromEnv();

const result = await historyTool.execute({
  page: 1,
  page_size: 20,
  search_query: "langchain",
  search_engine: "google",
  status: "success",
  timezone: "Asia/Shanghai",
});

console.log(result);
```

History parameters:

- `page`: page number, default `1`
- `page_size`: page size, default `20`
- `search_query`: optional keyword filter
- `search_engine`: optional engine filter such as `google` or `bing`
- `status`: `all`, `success`, or `error`
- `start_time`: optional unix timestamp in seconds
- `end_time`: optional unix timestamp in seconds
- `timezone`: optional timezone header such as `Asia/Shanghai` or `+08:00`

### 5. Statistics tool

```typescript
import { TalorSerpTool } from "langchain-talor-serp";

const statisticsTool = TalorSerpTool.statisticsFromEnv();

const result = await statisticsTool.execute({
  start_date: "2026-06-01",
  end_date: "2026-06-05",
  engines: "google,bing",
  timezone: "+08:00",
});

console.log(result);
```

Statistics parameters:

- `start_date`: required, format `YYYY-MM-DD`
- `end_date`: required, format `YYYY-MM-DD`
- `engines`: optional comma-separated engine keys such as `google,bing`
- `timezone`: optional timezone offset such as `+08:00`

### 6. Bind multiple tools

```typescript
import { TalorSerpTool } from "langchain-talor-serp";

const tools = TalorSerpTool.toolsFromEnv();

for (const tool of tools) {
  console.log(tool.name, tool.description);
}
```

These tools expose:

- `name`
- `description`
- `inputSchema`
- `execute(input)`

If you integrate them with your own model tool-calling loop, remember that the
model only decides which tool to call. You still need to execute the selected
tool yourself by calling `tool.execute(...)`.

## Tools

- `talor_serp_search` - search the web with engine-specific parameters
- `talor_serp_list_engines` - inspect supported engines and detailed parameter schemas
- `talor_serp_history` - query historical SERP requests
- `talor_serp_statistics` - query usage statistics for a date range

## Wrapper API

```typescript
import { TalorSerpAPIWrapper } from "langchain-talor-serp";

const wrapper = new TalorSerpAPIWrapper({
  talorApiKey: "your-token",
  engine: "google",
  gl: "us",
  hl: "en",
  device: "desktop",
  responseMode: "compact",
  timeout: 15000,
  k: 5,
});

const results = await wrapper.run("query", "google_images", {
  gl: "cn",
  hl: "zh",
});

const raw = await wrapper.results("query");
const engines = wrapper.listEngines();
const desc = wrapper.engineDescription("google_flights");
const schema = wrapper.engineParamSchema("google_shopping");
```

For direct wrapper calls:

- `wrapper.run(query, engine?, kwargs?)`
- `wrapper.results(query, engine?, kwargs?)`
- `wrapper.history({ page, pageSize, searchQuery, ... })`
- `wrapper.statistics({ startDate, endDate, ... })`

## Engine Parameters

Each engine has unique parameters. Use `engineDescription()` or `engineParamSchema()` to discover available parameters.

### Common Parameters

- `gl` - Country/region code (for example `us`, `cn`, `uk`)
- `hl` - Interface language (for example `en`, `zh`, `ja`)
- `device` - Device type: `desktop`, `mobile`, `tablet`
- `location` - Geographic targeting
- `no_cache` - Boolean, force fresh results

## Development

```bash
npm install
npm run build
npm run dev
npm test
npm run clean
```

## Resources

- npm: [langchain-talor-serp](https://www.npmjs.com/package/langchain-talor-serp)
- TalorData: [talordata.com](https://talordata.com)
- Quick start: [QUICK_START.md](QUICK_START.md)
- Migration: [MIGRATION.md](MIGRATION.md)

## License

MIT
