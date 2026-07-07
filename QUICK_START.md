# Quick Start

## Installation

Basic installation:

```bash
npm install langchain-talordata
```

If you want to use modern LangChain chat-model tool calling, install a model integration too:

```bash
npm install @langchain/openai
```

## 1. Set the API key

```typescript
process.env.TALOR_API_KEY = "your-token";
```

## 2. Simplest wrapper usage

```typescript
import { TalorDataSerpAPIWrapper } from "langchain-talordata";

process.env.TALOR_API_KEY = "your-token";

const wrapper = new TalorDataSerpAPIWrapper();
const result = await wrapper.run("TypeScript tutorial");

console.log(result);
```

## 3. Search with a specific engine

```typescript
import { TalorDataSerpAPIWrapper } from "langchain-talordata";

const wrapper = new TalorDataSerpAPIWrapper();

const shopping = await wrapper.run("laptop", "google_shopping", {
  min_price: "500",
  max_price: "1000",
});

const flights = await wrapper.run("flights", "google_flights", {
  departure_id: "SFO",
  arrival_id: "NRT",
  outbound_date: "2025-03-01",
  return_date: "2025-03-15",
  adults: 2,
});

console.log(shopping);
console.log(flights);
```

## 4. Use a tool descriptor directly

```typescript
import { TalorDataSerpTool } from "langchain-talordata";

process.env.TALOR_API_KEY = "your-token";

const searchTool = TalorDataSerpTool.fromEnv();

const result = await searchTool.execute({
  query: "TypeScript",
  engine: "google",
  params: {
    gl: "us",
    hl: "en",
  },
});

console.log(result);
```

## 5. Modern LangChain tool-calling

As in the Python package, the recommended pattern is: let the model generate
`tool_calls`, then execute the selected tool in your own code.

```typescript
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

for (const call of response.tool_calls ?? []) {
  if (call.name === searchTool.name) {
    const toolResult = await searchTool.execute(call.args);
    console.log(toolResult);
  }
}
```

## 6. Multiple tools

```typescript
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

## 7. Query history and statistics

```typescript
import { TalorDataSerpTool } from "langchain-talordata";

const historyTool = TalorDataSerpTool.historyFromEnv();
const statisticsTool = TalorDataSerpTool.statisticsFromEnv();

const history = await historyTool.execute({
  page: 1,
  page_size: 20,
  search_query: "langchain",
  search_engine: "google",
  status: "success",
  timezone: "Asia/Shanghai",
});

const statistics = await statisticsTool.execute({
  start_date: "2026-06-01",
  end_date: "2026-06-05",
  engines: "google,bing",
  timezone: "+08:00",
});

console.log(history);
console.log(statistics);
```

## 8. Inspect engine metadata

```typescript
import { TalorDataSerpAPIWrapper } from "langchain-talordata";

const wrapper = new TalorDataSerpAPIWrapper();

const engines = wrapper.listEngines();
const desc = wrapper.engineDescription("google_flights");
const schema = wrapper.engineParamSchema("google_shopping");

console.log(engines.length);
console.log(desc);
console.log(schema);
```

## Development commands

```bash
npm install
npm run build
npm run dev
npm test
```

## More information

- [Full documentation](README.md)
- [Migration guide](MIGRATION.md)
- [Publish guide](PUBLISH_GUIDE.md)
- [Implementation summary](IMPLEMENTATION_SUMMARY.md)
