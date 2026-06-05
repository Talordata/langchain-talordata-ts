/**
 * Basic usage examples for langchain-talor-serp
 */

import { TalorSerpAPIWrapper, TalorSerpTool } from "../dist/index";

// Example 1: Basic search
async function basicSearch() {
  console.log("=== Basic Search ===");

  const wrapper = new TalorSerpAPIWrapper({
    talorApiKey: process.env.TALOR_API_KEY || "your-api-key",
  });

  try {
    const results = await wrapper.run("TypeScript tutorial");
    console.log("Search results:", results.substring(0, 500) + "...");
  } catch (error) {
    console.error("Search failed:", error);
  }
}

// Example 2: Search with engine-specific params
async function engineSpecificSearch() {
  console.log("\n=== Engine-Specific Search ===");

  const wrapper = new TalorSerpAPIWrapper({
    talorApiKey: process.env.TALOR_API_KEY || "your-api-key",
  });

  try {
    // Google Images search
    const imageResults = await wrapper.run("cats", "google_images", {
      gl: "us",
      hl: "en",
      image_size: "large",
    });
    console.log("Image results:", imageResults.substring(0, 300) + "...");
  } catch (error) {
    console.error("Image search failed:", error);
  }
}

// Example 3: Using tools
async function usingTools() {
  console.log("\n=== Using Tools ===");

  const [searchTool, listEnginesTool] = TalorSerpTool.toolsFromApiKey(
    process.env.TALOR_API_KEY || "your-api-key"
  );

  // List all engines
  try {
    const enginesList = await listEnginesTool.execute({});
    console.log("Engines list:", enginesList.substring(0, 500) + "...");
  } catch (error) {
    console.error("List engines failed:", error);
  }

  // Search using tool
  try {
    const searchResult = await searchTool.execute({
      query: "Node.js tutorial",
      engine: "google",
      params: { gl: "us", hl: "en" },
    });
    console.log("Tool search result:", searchResult.substring(0, 300) + "...");
  } catch (error) {
    console.error("Tool search failed:", error);
  }
}

// Example 4: Get engine information
async function getEngineInfo() {
  console.log("\n=== Engine Information ===");

  const wrapper = new TalorSerpAPIWrapper();

  // Get Google Flights parameters
  const flightsSchema = wrapper.engineParamSchema("google_flights");
  if (flightsSchema) {
    console.log("Google Flights parameters:");
    console.log(JSON.stringify(flightsSchema, null, 2).substring(0, 500) + "...");
  }

  // Get Google Shopping description
  const shoppingDesc = wrapper.engineDescription("google_shopping");
  console.log("\nGoogle Shopping description:");
  console.log(shoppingDesc.substring(0, 500) + "...");
}

// Example 5: History and statistics
async function historyAndStats() {
  console.log("\n=== History and Statistics ===");

  const wrapper = new TalorSerpAPIWrapper({
    talorApiKey: process.env.TALOR_API_KEY || "your-api-key",
  });

  try {
    // Query history
    const history = await wrapper.history({
      page: 1,
      pageSize: 5,
      status: "success",
    });
    console.log("History:", JSON.stringify(history, null, 2).substring(0, 300) + "...");
  } catch (error) {
    console.error("History query failed:", error);
  }

  try {
    // Query statistics
    const stats = await wrapper.statistics({
      startDate: "2025-01-01",
      endDate: "2025-01-31",
    });
    console.log("Statistics:", JSON.stringify(stats, null, 2).substring(0, 300) + "...");
  } catch (error) {
    console.error("Statistics query failed:", error);
  }
}

// Run all examples
async function main() {
  console.log("🚀 langchain-talor-serp Examples\n");

  await basicSearch();
  await engineSpecificSearch();
  await usingTools();
  await getEngineInfo();
  await historyAndStats();

  console.log("\n✅ All examples completed!");
}

main().catch(console.error);
