# langchain (js)

**LangChain integration for TalorData SERP API**

[Installation](https://github.com/Talordata/langchain-talordata/edit/main/README.md#installation) • [Quick Start](https://github.com/Talordata/langchain-talordata/edit/main/README.md#quick-start) • [Tools](https://github.com/Talordata/langchain-talordata/edit/main/README.md#tools) • [Resources](https://github.com/Talordata/langchain-talordata/edit/main/README.md#resources)

PyPI version Python versions License: MIT

TalorData helps developers and AI applications connect to real-time, structured, and reliable search data through a single SERP API. With support for Google, Bing, News, Images, Shopping, Maps, Scholar, Trends, and more, TalorData makes it easier to build AI agents, search copilots, SEO workflows, and data-driven automations powered by live search results.

The langchain-talordata package brings TalorData’s real-time search capabilities into LangChain, so you can add live search, engine inspection, request history, and usage analytics directly to your LLM workflows and AI agent systems.

**Overview**

langchain-talordata provides LangChain tools for [TalorData](https://www.talordata.com/serp-api/langchain?campaignid=1cypxmLvv6k0zrDj&utm_source=langchain&utm_term=langchain29) SERP API, enabling your AI agents to:

*   **Search** - Query search engines with geo-targeting and language customization
    
*   **Inspect engines** - Discover supported engines and engine-specific parameters
    
*   **Query history** - Fetch SERP request history with filters
    
*   **View statistics** - Retrieve usage statistics by date range and engine
    

**This package provides:**

*   TalorDataSerpAPIWrapper for direct sync and async API access
    
*   TalorDataSerpTool for creating LangChain tools
    
*   20+ search types across four major search engines
    
*   support for search, history, and statistics endpoints
    

## Installation

```plaintext
npm install langchain-talordata
```

If you want to use the modern LangChain chat-model tool-calling flow, install a model integration too:

```plaintext
npm install @langchain/openai
```

## Quick Start

### 1. Get your API key

Sign up at [TalorData](https://talordata.com/) and get your API key from the dashboard.

### 2. Set up authentication

```plaintext
process.env.TALOR_API_KEY = "your-token";
```

### 3. Wrapper usage

```plaintext
import { TalorDataSerpAPIWrapper } from "langchain-talordata";

const wrapper = new TalorDataSerpAPIWrapper();
const result = await wrapper.run("LangChain tutorial");
console.log(result);
```

### 4. Modern tool-calling usage

Like the Python version, the recommended modern flow is: bind tools to a chat model, let the model emit , then execute the chosen tool. In the TypeScript package, Talor tools are lightweight descriptors with , , , and .`tool_calls``name``description``inputSchema``execute(input)`

```plaintext
import { ChatOpenAI } from "@langchain/openai";
import { TalorDataSerpTool } from "langchain-talordata";

process.env.TALOR_API_KEY = "your-token";

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

const searchTool = TalorDataSerpTool.fromEnv();

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

### 5. Search tool

```plaintext
import { TalorDataSerpTool } from "langchain-talordata";

const searchTool = TalorDataSerpTool.fromEnv();

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

Search parameters:

*   `query`: required search query text
    
*   `engine`: optional engine key such as , , , , `google``google_news``google_images``bing``duckduckgo`
    
*   `params`: optional engine-specific parameter object
    
*   common fields include , , , , and `params``gl``hl``device``location``no_cache`
    
*   use to inspect detailed parameters for a specific engine`talor_serp_list_engines`
    

`params` also accepts a JSON string when returned by a model tool call, for example:

```plaintext
const result = await searchTool.execute({
  query: "LangChain tutorial",
  engine: "google",
  params: "{\"hl\": \"zh-CN\", \"gl\": \"cn\"}",
});
```

### 6. History tool

```plaintext
import { TalorDataSerpTool } from "langchain-talordata";

const historyTool = TalorDataSerpTool.historyFromEnv();

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

History parameters:

*   `page`: page number, default `1`
    
*   `page_size`: page size, default `20`
    
*   `search_query`: optional keyword filter
    
*   `search_engine`: optional engine filter such as or `google``bing`
    
*   `status`: , , or `all``success``error`
    
*   `start_time`: optional unix timestamp in seconds
    
*   `end_time`: optional unix timestamp in seconds
    
*   `timezone`: optional timezone header such as or `Asia/Shanghai``+08:00`
    

### 7. Statistics tool

```plaintext
import { TalorDataSerpTool } from "langchain-talordata";

const statisticsTool = TalorDataSerpTool.statisticsFromEnv();

const result = await statisticsTool.execute({
  start_date: "2026-06-01",
  end_date: "2026-06-05",
  engines: "google,bing",
  timezone: "+08:00",
});

console.log(result);
```

Statistics parameters:

*   `start_date`: required, format `YYYY-MM-DD`
    
*   `end_date`: required, format `YYYY-MM-DD`
    
*   `engines`: optional comma-separated engine keys such as `google,bing`
    
*   `timezone`: optional timezone offset such as `+08:00`
    

### 8. Bind multiple tools

```plaintext
import { ChatOpenAI } from "@langchain/openai";
import { TalorDataSerpTool } from "langchain-talordata";

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

const tools = TalorDataSerpTool.toolsFromEnv();
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

These tool descriptors expose:

*   `name`
    
*   `description`
    
*   `inputSchema`
    
*   `execute(input)`
    

`bindTools()` only lets the model generate . To actually execute the selected tool, your code still needs to call .`tool_calls``tool.execute(...)`

## Tools

*   `talor_serp_search` - search the web with engine-specific parameters
    
*   `talor_serp_list_engines` - inspect supported engines and detailed parameter schemas
    
*   `talor_serp_history` - query historical SERP requests
    
*   `talor_serp_statistics` - query usage statistics for a date range
    

### Compatibility note

If you are using modern LangChain JavaScript packages such as:

*   `langchain@1.x`
    
*   `@langchain/openai@1.x`
    

prefer the chat-model tool-calling flow shown above. In this package, Talor tools are lightweight descriptors rather than auto-executing LangChain tools, so the recommended pattern is:

*   let the model generate `tool_calls`
    
*   match the tool by `name`
    
*   execute it with `tool.execute(call.args)`
    
*   optionally feed the tool result back into your own agent loop
    

## Wrapper API

```plaintext
import { TalorDataSerpAPIWrapper } from "langchain-talordata";

const wrapper = new TalorDataSerpAPIWrapper({
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

For direct wrapper calls:

*   `wrapper.run(query, engine?, kwargs?)`
    
*   `wrapper.results(query, engine?, kwargs?)`
    
*   `wrapper.history({ page, pageSize, searchQuery, ... })`
    
*   `wrapper.statistics({ startDate, endDate, ... })`
    

## Engine Parameters

Each engine has unique parameters. Use or to discover available parameters.`engineDescription()``engineParamSchema()`

### Common Parameters

*   `gl` - Country/region code (for example , , `us``cn``uk`)
    
*   `hl` - Interface language (for example , , `en``zh``ja`)
    
*   `device` - Device type: , , `desktop``mobile``tablet`
    
*   `location` - Geographic targeting
    
*   `no_cache` - Boolean, force fresh results
    

## Development

```plaintext
npm install
npm run build
npm run dev
npm test
npm run clean
```

## Resources

*   npm: [langchain-talordata](https://www.npmjs.com/package/langchain-talordata)
    
*   TalorData: [talordata.com](https://www.talordata.com/serp-api/langchain?campaignid=1cypxmLvv6k0zrDj&utm_source=langchain&utm_term=langchain29)
    
*   Quick start: [QUICK\_START.md](https://github.com/Talordata/langchain-talordata-ts/blob/main/QUICK_START.md)
    
*   Migration: [MIGRATION.md](https://github.com/Talordata/langchain-talordata-ts/blob/main/MIGRATION.md)
    

## Support

For issues with the LangChain integration package, report an issue in the [GitHub repository](https://github.com/talordata).

For TalorData SERP API account, quota, or API key issues, contact TalorData support through the support channel listed in your TalorData account or dashboard.

For detailed integration tutorials and API documentation, visit the TalorData Documentation.

---

## Learn More

Ready to build AI agents with real-time search in LangChain?

**Explore the** [**TalorData LangChain Integration Guide**](https://www.talordata.com/serp-api/langchain?campaignid=1cypxmLvv6k0zrDj&utm_source=langchain&utm_term=langchain29)

**Read the** [**Integration Documentation**](https://www.talordata.com/serp-api/langchain?campaignid=1cypxmLvv6k0zrDj&utm_source=langchain&utm_term=langchain29)

---
> **TalorData brings real-time search to LangChain, enabling developers to build AI agents and workflows with fresh, structured, and reliable search data.**