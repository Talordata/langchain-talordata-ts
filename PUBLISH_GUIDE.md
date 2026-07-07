# Usage and Publishing Guide

## Local usage

### 1. Use as a local package

Install the package directly from a local path:

```bash
# In your app
npm install ../langchain_talor_serp_ts
```

Or use `npm link`:

```bash
# In the langchain_talor_serp_ts directory
npm link

# In your app
npm link langchain-talordata
```

### 2. Import source code directly

```typescript
import { TalorDataSerpAPIWrapper } from "../langchain_talor_serp_ts/src/index";

const wrapper = new TalorDataSerpAPIWrapper({
  talorApiKey: "your-token",
});
```

## Publish to npm

### Step 1: Prepare the release

```bash
# 1. Make sure you are logged in
npm login

# 2. Check whether the package name is available
npm view langchain-talordata

# 3. Bump the version if needed
npm version patch   # 0.1.0 -> 0.1.1
npm version minor   # 0.1.0 -> 0.2.0
npm version major   # 0.1.0 -> 1.0.0
```

### Step 2: Build and publish

```bash
# 1. Build the project
npm run build

# 2. Preview the files that will be published
npm pack --dry-run

# 3. Publish to npm
npm publish

# For a scoped package such as @your-org/package-name
npm publish --access public
```

### Step 3: Publish to a private registry (optional)

```bash
# Publish to a private registry
npm publish --registry https://your-private-registry.com

# Or use an .npmrc file
echo "registry=https://your-private-registry.com" > .npmrc
npm publish
```

## Usage

### Install

```bash
npm install langchain-talordata
```

### Basic usage

```typescript
import { TalorDataSerpAPIWrapper } from "langchain-talordata";

process.env.TALOR_API_KEY = "your-token";

const wrapper = new TalorDataSerpAPIWrapper();

const results = await wrapper.run("TypeScript tutorial");
console.log(results);

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

### Tool usage

```typescript
import { TalorDataSerpTool } from "langchain-talordata";

process.env.TALOR_API_KEY = "your-token";

const [searchTool, listEnginesTool] = TalorDataSerpTool.toolsFromApiKey("your-token");

const result = await searchTool.execute({
  query: "TypeScript",
  engine: "google",
  params: { gl: "us", hl: "en" },
});

const engines = await listEnginesTool.execute({});
console.log(result);
console.log(engines);
```

### Engine metadata

```typescript
import { TalorDataSerpAPIWrapper } from "langchain-talordata";

const wrapper = new TalorDataSerpAPIWrapper();

const engines = wrapper.listEngines();
console.log(`Total engines: ${engines.length}`);

const desc = wrapper.engineDescription("google_flights");
console.log(desc);

const schema = wrapper.engineParamSchema("google_shopping");
console.log(schema);
```

### History and statistics

```typescript
const wrapper = new TalorDataSerpAPIWrapper({
  talorApiKey: "your-token",
});

const history = await wrapper.history({
  page: 1,
  pageSize: 20,
  searchQuery: "query",
  status: "success",
});

const stats = await wrapper.statistics({
  startDate: "2025-01-01",
  endDate: "2025-01-31",
  engines: "google,bing",
});

console.log(history);
console.log(stats);
```

## Configuration

### TalorDataSerpAPIWrapper options

```typescript
const wrapper = new TalorDataSerpAPIWrapper({
  talorApiKey: "your-token",   // API key
  engine: "google",            // default engine
  endpoint: "https://...",     // API endpoint
  gl: "us",                    // country code
  hl: "en",                    // language
  device: "desktop",           // device type
  responseMode: "compact",     // response mode
  timeout: 15000,              // timeout in ms
  k: 5,                        // number of results
});
```

### Environment variables

```bash
# Set the API key
export TALOR_API_KEY="your-token"

# Or in a .env file
TALOR_API_KEY=your-token
```

## Release checklist

Before publishing, make sure that:

- [ ] `package.json` has the correct version
- [ ] `npm run build` succeeds
- [ ] `npm test` succeeds
- [ ] `README.md` is up to date
- [ ] the `files` field includes all required publishable files
- [ ] the `keywords` are appropriate
- [ ] the `license` is correct

## Troubleshooting

### 1. Build errors

```bash
# Clean and rebuild
npm run clean
npm run build
```

### 2. Type errors

Make sure the required type packages are installed:

```bash
npm install --save-dev @types/node typescript
```

### 3. Publish permission errors

```bash
# Make sure you are logged in
npm login

# Check whether the package name is already taken
npm view package-name
```

### 4. Local development and debugging

```bash
# Run TypeScript directly with ts-node
npx ts-node your-file.ts

# Or watch changes with nodemon
npx nodemon --exec ts-node your-file.ts
```

## Example projects

Check the `examples/` directory for complete examples:

```bash
cd examples
npx ts-node basic-usage.ts
```

## Resources

- [npm docs](https://docs.npmjs.com/)
- [TypeScript docs](https://www.typescriptlang.org/docs/)
- [LangChain docs](https://js.langchain.com/docs/)

## Support

If you run into issues:

1. Read `README.md`
2. Read `MIGRATION.md`
3. Check `IMPLEMENTATION_SUMMARY.md`
4. Open an issue on GitHub
