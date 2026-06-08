/**
 * Example: Using langchain-talordata with LangChain Agent
 *
 * This example shows how to integrate the Talor SERP tools
 * with a LangChain agent for web search capabilities.
 */

import { TalorSerpTool } from "../dist/index";

// Note: This example requires langchain to be installed
// npm install langchain @langchain/openai

async function main() {
  console.log("🤖 LangChain Agent with Talor SERP Tools\n");

  // 1. Create tools
  const [searchTool, listEnginesTool] = TalorSerpTool.toolsFromApiKey(
    process.env.TALOR_API_KEY || "your-api-key"
  );

  console.log("📦 Available tools:");
  console.log(`  - ${searchTool.name}: ${searchTool.description.substring(0, 50)}...`);
  console.log(`  - ${listEnginesTool.name}: ${listEnginesTool.description.substring(0, 50)}...`);
  console.log();

  // 2. Example: Using tools directly (without LangChain)
  console.log("🔍 Example 1: Direct tool usage");

  try {
    // List available engines
    const engines = await listEnginesTool.execute({});
    console.log("Available engines:\n", engines.substring(0, 300) + "...");
  } catch (error) {
    console.error("Error listing engines:", error);
  }

  console.log("\n" + "─".repeat(50) + "\n");

  // 3. Example: Search with specific engine
  console.log("🔍 Example 2: Search with Google Images");

  try {
    const imageResults = await searchTool.execute({
      query: "TypeScript logo",
      engine: "google_images",
      params: {
        gl: "us",
        hl: "en",
        image_size: "large",
      },
    });
    console.log("Image search results:\n", imageResults.substring(0, 300) + "...");
  } catch (error) {
    console.error("Error searching images:", error);
  }

  console.log("\n" + "─".repeat(50) + "\n");

  // 4. Example: Flight search
  console.log("🔍 Example 3: Flight search with Google Flights");

  try {
    const flightResults = await searchTool.execute({
      query: "flights",
      engine: "google_flights",
      params: {
        departure_id: "SFO",
        arrival_id: "NRT",
        outbound_date: "2025-03-01",
        return_date: "2025-03-15",
        adults: 2,
      },
    });
    console.log("Flight results:\n", flightResults.substring(0, 300) + "...");
  } catch (error) {
    console.error("Error searching flights:", error);
  }

  console.log("\n" + "─".repeat(50) + "\n");

  // 5. Example: Shopping search
  console.log("🔍 Example 4: Shopping search with Google Shopping");

  try {
    const shoppingResults = await searchTool.execute({
      query: "laptop",
      engine: "google_shopping",
      params: {
        min_price: "500",
        max_price: "1000",
        gl: "us",
      },
    });
    console.log("Shopping results:\n", shoppingResults.substring(0, 300) + "...");
  } catch (error) {
    console.error("Error searching shopping:", error);
  }

  console.log("\n" + "─".repeat(50) + "\n");

  // 6. Example: Using with LangChain (commented out - requires langchain)
  console.log("📝 Example 5: Integration with LangChain Agent");
  console.log(`
To use with LangChain agent:

\`\`\`typescript
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { TalorSerpTool } from "langchain-talordata";

// Create tools
const [searchTool, listEnginesTool] = TalorSerpTool.toolsFromApiKey("your-key");

// Create LLM
const llm = new ChatOpenAI({
  modelName: "gpt-4",
  temperature: 0,
});

// Create prompt
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant with web search capabilities."],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

// Create agent
const agent = await createToolCallingAgent({
  llm,
  tools: [searchTool, listEnginesTool],
  prompt,
});

// Create executor
const agentExecutor = new AgentExecutor({
  agent,
  tools: [searchTool, listEnginesTool],
});

// Run agent
const result = await agentExecutor.invoke({
  input: "What's the weather in Tokyo?",
});

console.log(result.output);
\`\`\`
  `);

  console.log("✅ Examples completed!");
}

main().catch(console.error);
