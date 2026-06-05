# Migration Guide: Python to TypeScript

This document describes how to migrate from the Python `langchain_talor_serp` package to the TypeScript `langchain-talor-serp` package.

## Overview

The TypeScript version provides the same functionality as the Python version:

- **33 Search Engines**: Google, Bing, Yandex, DuckDuckGo
- **Engine-aware parameter validation**: Automatic validation based on engine schemas
- **LangChain integration**: Tools and wrappers for LangChain agents
- **Type safety**: Full TypeScript support with proper types

## Installation

### Python

```bash
pip install langchain-talor-serp
```

### TypeScript

```bash
npm install langchain-talor-serp
```

## API Comparison

### Wrapper Initialization

#### Python

```python
import os
from langchain_talor_serp import TalorSerpAPIWrapper

os.environ["TALOR_API_KEY"] = "your-token"
wrapper = TalorSerpAPIWrapper()

# Or with explicit key
wrapper = TalorSerpAPIWrapper(talor_api_key="your-token")
```

#### TypeScript

```typescript
import { TalorSerpAPIWrapper } from "langchain-talor-serp";

// Using environment variable
process.env.TALOR_API_KEY = "your-token";
const wrapper = new TalorSerpAPIWrapper();

// Or with explicit key
const wrapper = new TalorSerpAPIWrapper({
  talorApiKey: "your-token",
});
```

### Basic Search

#### Python

```python
# Synchronous
text = wrapper.run("LangChain tutorial")

# Asynchronous
text = await wrapper.arun("LangChain tutorial")
```

#### TypeScript

```typescript
// Asynchronous (always)
const text = await wrapper.run("LangChain tutorial");
```

### Engine-specific Search

#### Python

```python
# Google Shopping
text = wrapper.run(
    "laptop",
    engine="google_shopping",
    min_price="500",
    max_price="1000",
)

# Google Flights
text = wrapper.run(
    "flights",
    engine="google_flights",
    departure_id="SFO",
    arrival_id="NRT",
    outbound_date="2025-03-01",
    return_date="2025-03-15",
    adults=2,
)
```

#### TypeScript

```typescript
// Google Shopping
const text = await wrapper.run("laptop", "google_shopping", {
  min_price: "500",
  max_price: "1000",
});

// Google Flights
const text = await wrapper.run("flights", "google_flights", {
  departure_id: "SFO",
  arrival_id: "NRT",
  outbound_date: "2025-03-01",
  return_date: "2025-03-15",
  adults: 2,
});
```

### Raw Results

#### Python

```python
# Synchronous
results = wrapper.results("query")

# Asynchronous
results = await wrapper.aresults("query")
```

#### TypeScript

```typescript
const results = await wrapper.results("query");
```

### Engine Information

#### Python

```python
# List engines
engines = wrapper.list_engines()

# Get description
desc = wrapper.engine_description("google_flights")

# Get param schema
schema = wrapper.engine_param_schema("google_shopping")
```

#### TypeScript

```typescript
// List engines
const engines = wrapper.listEngines();

// Get description
const desc = wrapper.engineDescription("google_flights");

// Get param schema
const schema = wrapper.engineParamSchema("google_shopping");
```

### Creating Tools

#### Python

```python
from langchain_talor_serp import TalorSerpTool

# Create tools from environment
tools = TalorSerpTool.tools_from_env()

# Create tool from API key
tool = TalorSerpTool.from_api_key("your-token")

# Bind to agent
agent = llm.bind_tools(tools)
```

#### TypeScript

```typescript
import { TalorSerpTool } from "langchain-talor-serp";

// Create tools from API key
const [searchTool, listEnginesTool] = TalorSerpTool.toolsFromApiKey("your-token");

// Use tool
const result = await searchTool.execute({
  query: "TypeScript",
  engine: "google",
  params: { gl: "us" },
});
```

### History and Statistics

#### Python

```python
# History
history = wrapper.history(
    page=1,
    page_size=20,
    search_query="query",
    status="success",
)

# Statistics
stats = wrapper.statistics(
    start_date="2025-01-01",
    end_date="2025-01-31",
    engines="google,bing",
)
```

#### TypeScript

```typescript
// History
const history = await wrapper.history({
  page: 1,
  pageSize: 20,
  searchQuery: "query",
  status: "success",
});

// Statistics
const stats = await wrapper.statistics({
  startDate: "2025-01-01",
  endDate: "2025-01-31",
  engines: "google,bing",
});
```

## Key Differences

### 1. Async/Await

Python supports both synchronous and asynchronous operations. TypeScript uses async/await for all operations.

### 2. Parameter Passing

Python uses `**kwargs` for additional parameters. TypeScript uses an object for additional parameters.

### 3. Type Safety

TypeScript provides full type safety with interfaces and type definitions.

### 4. Tool Interface

TypeScript tools return objects with `name`, `description`, `inputSchema`, and `execute` function, rather than LangChain's `StructuredTool`.

## Migration Checklist

- [ ] Install the TypeScript package: `npm install langchain-talor-serp`
- [ ] Update import statements
- [ ] Convert synchronous calls to async/await
- [ ] Update parameter passing style
- [ ] Update tool creation and usage
- [ ] Test all functionality

## Examples

See the `examples/` directory for complete usage examples:

- `basic-usage.ts` - Basic search and engine information
- More examples coming soon...

## Support

For issues or questions, please refer to the main project repository.
