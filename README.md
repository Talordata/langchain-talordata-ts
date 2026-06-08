# langchain-talordata

**LangChain integration for TalorData's SERP APIs - TypeScript**

[![npm version](https://img.shields.io/npm/v/langchain-talordata?color=blue)](https://www.npmjs.com/package/langchain-talordata)
[![Node versions](https://img.shields.io/node/v/langchain-talordata)](https://www.npmjs.com/package/langchain-talordata)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

[Installation](#installation) •
[Quick Start](#quick-start) •
[Tools](#tools) •
[Resources](#resources)

LangChain integration for the Talor SERP API.

This package provides:

- `TalorSerpAPIWrapper` for direct async API access
- `TalorSerpTool` for creating tool descriptors for model tool routing
- bundled engine schemas for 30+ search engines
- support for search, history, and statistics endpoints

## Overview

`langchain-talordata` provides TypeScript tools for [TalorData](https://talordata.com)'s SERP APIs, enabling your AI apps to:

- **Search** - Query search engines with geo-targeting and language customization
- **Inspect engines** - Discover supported engines and engine-specific parameters
- **Query history** - Fetch SERP request history with filters
- **View statistics** - Retrieve usage statistics by date range and engine

## Installation

```bash
npm install langchain-talordata
```

If you want to use the modern LangChain chat-model tool-calling flow, install a model integration too:

```bash
npm install @langchain/openai
```

## Quick Start

### 1. Get your API key

Sign up at [TalorData](https://talordata.com) and get your API key from the dashboard.

### 2. Set up authentication

```typescript
process.env.TALOR_API_KEY = "your-token";
```

### 3. Wrapper usage

```typescript
import { TalorSerpAPIWrapper } from "langchain-talordata";

const wrapper = new TalorSerpAPIWrapper();
const result = await wrapper.run("LangChain tutorial");
console.log(result);
```

### 4. Modern tool-calling usage

Like the Python version, the recommended modern flow is: bind tools to a chat
model, let the model emit `tool_calls`, then execute the chosen tool. In the
TypeScript package, Talor tools are lightweight descriptors with `name`,
`description`, `inputSchema`, and `execute(input)`.

```typescript
import { ChatOpenAI } from "@langchain/openai";
import { TalorSerpTool } from "langchain-talordata";

process.env.TALOR_API_KEY = "your-token";

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

const searchTool = TalorSerpTool.fromEnv();

const modelWithTools = llm.bindTools([
  {
    type: "function",
    function: {
      name: searchTool.name,
      description: searchTool.description,
      parameters: searchTool.inputSchema,
    },
  },
]);

const response = await modelWithTools.invoke(
  "Search for the latest LangChain news"
);

console.log(response);

for (const call of response.tool_calls ?? []) {
  if (call.name === searchTool.name) {
    const toolResult = await searchTool.execute(call.args);
    console.log(toolResult);
  }
}
```

### 5. Search tool

```typescript
import { TalorSerpTool } from "langchain-talordata";

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

### 6. History tool

```typescript
import { TalorSerpTool } from "langchain-talordata";

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

### 7. Statistics tool

```typescript
import { TalorSerpTool } from "langchain-talordata";

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

### 8. Bind multiple tools

```typescript
import { ChatOpenAI } from "@langchain/openai";
import { TalorSerpTool } from "langchain-talordata";

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

const tools = TalorSerpTool.toolsFromEnv();
const toolsByName = Object.fromEntries(tools.map((tool) => [tool.name, tool]));

const modelWithTools = llm.bindTools(
  tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }))
);

const response = await modelWithTools.invoke(
  "Show my SERP usage statistics for 2026-06-01 to 2026-06-05"
);

for (const call of response.tool_calls ?? []) {
  const tool = toolsByName[call.name];
  if (!tool) continue;

  const result = await tool.execute(call.args);
  console.log(call.name, result);
}
```

These tool descriptors expose:

- `name`
- `description`
- `inputSchema`
- `execute(input)`

`bindTools()` only lets the model generate `tool_calls`. To actually execute
the selected tool, your code still needs to call `tool.execute(...)`.

## Tools

- `talor_serp_search` - search the web with engine-specific parameters
- `talor_serp_list_engines` - inspect supported engines and detailed parameter schemas
- `talor_serp_history` - query historical SERP requests
- `talor_serp_statistics` - query usage statistics for a date range

### Compatibility note

If you are using modern LangChain JavaScript packages such as:

- `langchain@1.x`
- `@langchain/openai@1.x`

prefer the chat-model tool-calling flow shown above. In this package, Talor
tools are lightweight descriptors rather than auto-executing LangChain tools,
so the recommended pattern is:

- let the model generate `tool_calls`
- match the tool by `name`
- execute it with `tool.execute(call.args)`
- optionally feed the tool result back into your own agent loop

## Wrapper API

```typescript
import { TalorSerpAPIWrapper } from "langchain-talordata";

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

- npm: [langchain-talordata](https://www.npmjs.com/package/langchain-talordata)
- TalorData: [talordata.com](https://talordata.com)
- Quick start: [QUICK_START.md](QUICK_START.md)
- Migration: [MIGRATION.md](MIGRATION.md)

## License

MIT
