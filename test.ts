/**
 * Simple test file to verify the TypeScript implementation
 */

import {
  TalorDataSerpAPIWrapper,
  TalorDataSerpTool,
  EngineRegistry,
  SUPPORTED_ENGINES,
  ENGINE_CATEGORIES,
} from "./dist/index";

async function testEngineRegistry() {
  console.log("=== Testing Engine Registry ===");

  const registry = new EngineRegistry();
  console.log(`Default engine: ${registry.defaultEngine}`);
  console.log(`Total engines: ${registry.engineKeys.length}`);

  // Test listing engines
  const categories = registry.categories();
  for (const [catKey, engineKeys] of Object.entries(categories)) {
    console.log(`\n[${catKey}]`);
    for (const key of engineKeys) {
      const schema = registry.engine(key);
      if (schema) {
        console.log(`  ${key}: ${schema.name}`);
      }
    }
  }

  // Test engine schema
  const googleSchema = registry.engine("google");
  if (googleSchema) {
    console.log(`\nGoogle schema query field: ${googleSchema.query_field}`);
    console.log(`Google schema groups: ${googleSchema.groups.length}`);
  }
}

async function testWrapper() {
  console.log("\n=== Testing TalorDataSerpAPIWrapper ===");

  // Note: This will fail without a valid API key
  const wrapper = new TalorDataSerpAPIWrapper({
    talorApiKey: "test-key",
  });

  console.log(`List engines: ${wrapper.listEngines().length} engines`);
  console.log(
    `Google description:\n${wrapper.engineDescription("google").substring(0, 200)}...`
  );

  const paramSchema = wrapper.engineParamSchema("google_flights");
  if (paramSchema) {
    console.log(`\nGoogle Flights params: ${Object.keys(paramSchema.properties || {}).length} parameters`);
  }
}

async function testTools() {
  console.log("\n=== Testing Tools ===");

  const tool = TalorDataSerpTool.fromApiKey("test-key");
  console.log(`Tool name: ${tool.name}`);
  console.log(`Tool description length: ${tool.description.length}`);
  console.log(`Input schema properties: ${Object.keys(tool.inputSchema.properties || {}).length}`);

  const listTool = TalorDataSerpTool.toolsFromApiKey("test-key");
  console.log(`Tools count: ${listTool.length}`);
}

async function main() {
  try {
    await testEngineRegistry();
    await testWrapper();
    await testTools();

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

main();
