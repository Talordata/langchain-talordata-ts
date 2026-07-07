/**
 * Integration tests — these call the real Talor SERP API.
 *
 * Run with:
 *     TALOR_API_KEY=your-key npx jest tests/integration.test.ts
 *
 * Without TALOR_API_KEY, all tests are skipped.
 */

import { TalorDataSerpAPIWrapper } from "../src/wrapper";
import { createTalorDataSerpTool, createTalorDataSerpListEnginesTool } from "../src/tool";

const API_KEY = process.env.TALOR_API_KEY || "";

// Increase timeout for API calls
jest.setTimeout(30000);

const describeIfKey = API_KEY ? describe : describe.skip;

function makeWrapper(): TalorDataSerpAPIWrapper {
  return new TalorDataSerpAPIWrapper({ talorApiKey: API_KEY });
}

// ---------- Wrapper.results() ----------

describeIfKey("Wrapper.results() integration", () => {
  let wrapper: TalorDataSerpAPIWrapper;

  beforeEach(() => {
    wrapper = makeWrapper();
  });

  it("should return google results", async () => {
    const result = await wrapper.results("LangChain tutorial");
    expect(result.ok).toBe(true);
    expect(result.engine).toBe("google");
    expect(result.data).toBeDefined();
    // After unwrap, data should contain organic or similar results
    const data = result.data!;
    expect(
      data.organic || data.knowledge_graph || data.answer_box || data.data
    ).toBeDefined();
  });

  it("should return bing_news results", async () => {
    const result = await wrapper.results("AI news", "bing_news");
    expect(result.ok).toBe(true);
    expect(result.engine).toBe("bing_news");
  });

  it("should return duckduckgo results", async () => {
    const result = await wrapper.results("python programming", "duckduckgo");
    expect(result.ok).toBe(true);
  });

  it("should return yandex results", async () => {
    const result = await wrapper.results("test query", "yandex");
    expect(result.ok).toBe(true);
  });

  it("should return google results with custom params", async () => {
    const result = await wrapper.results("machine learning", "google", {
      gl: "cn",
      hl: "zh",
      num: 5,
    });
    expect(result.ok).toBe(true);
  });

  it("should return google_patents_details results", async () => {
    const result = await wrapper.results("", "google_patents_details", {
      parent_id: "patent/US11734097B1/en",
      gl: "us",
      hl: "en",
    });
    expect(result.ok).toBe(true);
  });
});

// ---------- Wrapper.run() ----------

describeIfKey("Wrapper.run() integration", () => {
  let wrapper: TalorDataSerpAPIWrapper;

  beforeEach(() => {
    wrapper = makeWrapper();
  });

  it("should return formatted text for google", async () => {
    const result = await wrapper.run("what is LangChain");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should return formatted text for bing", async () => {
    const result = await wrapper.run("hello world", "bing");
    expect(typeof result).toBe("string");
  });
});

// ---------- Engine info ----------

describeIfKey("Engine info integration", () => {
  let wrapper: TalorDataSerpAPIWrapper;

  beforeEach(() => {
    wrapper = makeWrapper();
  });

  it("should list all engines", () => {
    const engines = wrapper.listEngines();
    expect(engines.length).toBeGreaterThan(30);
    expect(engines).toContain("google");
  });

  it("should return google description", () => {
    const desc = wrapper.engineDescription("google");
    expect(desc.toLowerCase()).toContain("google");
  });

  it("should return google param schema", () => {
    const schema = wrapper.engineParamSchema("google");
    expect(schema).not.toBeNull();
    expect(schema!.type).toBe("object");
  });
});

// ---------- History & Statistics ----------

describeIfKey("History integration", () => {
  let wrapper: TalorDataSerpAPIWrapper;

  beforeEach(() => {
    wrapper = makeWrapper();
  });

  it("should return history", async () => {
    const result = await wrapper.history({ page: 1, pageSize: 5 });
    expect(result.ok).toBe(true);
  });

  it("should return statistics", async () => {
    const result = await wrapper.statistics({
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    });
    expect(result.ok).toBe(true);
  });
});

// ---------- Tool integration ----------

describeIfKey("Tool integration", () => {
  it("should execute search tool", async () => {
    const wrapper = makeWrapper();
    const tool = createTalorDataSerpTool(wrapper);
    const result = await tool.execute({ query: "hello" });
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("should execute list engines tool", async () => {
    const wrapper = makeWrapper();
    const tool = createTalorDataSerpListEnginesTool(wrapper);
    const result = await tool.execute({});
    expect(result).toContain("Total engines:");
    expect(result).toContain("google");
  });
});
