import {
  createTalorSerpTool,
  createTalorSerpHistoryTool,
  createTalorSerpListEnginesTool,
  createTalorSerpStatisticsTool,
  TalorSerpTool,
  TalorSerpSearchInput,
} from "../src/tool";
import { TalorSerpAPIWrapper } from "../src/wrapper";

describe("createTalorSerpTool()", () => {
  let wrapper: TalorSerpAPIWrapper;

  beforeEach(() => {
    wrapper = new TalorSerpAPIWrapper({ talorApiKey: "test-key" });
  });

  it("should return a tool with correct name", () => {
    const tool = createTalorSerpTool(wrapper);
    expect(tool.name).toBe("talor_serp_search");
  });

  it("should accept custom name", () => {
    const tool = createTalorSerpTool(wrapper, "my_search");
    expect(tool.name).toBe("my_search");
  });

  it("should have description", () => {
    const tool = createTalorSerpTool(wrapper);
    expect(tool.description.length).toBeGreaterThan(0);
  });

  it("should have input schema", () => {
    const tool = createTalorSerpTool(wrapper);
    expect(tool.inputSchema.type).toBe("object");
    expect(tool.inputSchema.properties.query).toBeDefined();
    expect(tool.inputSchema.properties.engine).toBeDefined();
    expect(tool.inputSchema.properties.params).toBeDefined();
  });

  it("should accept custom description", () => {
    const tool = createTalorSerpTool(wrapper, "t", "Custom desc");
    expect(tool.description).toBe("Custom desc");
  });
});

describe("createTalorSerpHistoryTool()", () => {
  it("should return a tool with correct name", () => {
    const wrapper = new TalorSerpAPIWrapper({ talorApiKey: "test-key" });
    const tool = createTalorSerpHistoryTool(wrapper);
    expect(tool.name).toBe("talor_serp_history");
  });

  it("should have input schema with page and page_size", () => {
    const wrapper = new TalorSerpAPIWrapper({ talorApiKey: "test-key" });
    const tool = createTalorSerpHistoryTool(wrapper);
    expect(tool.inputSchema.properties.page).toBeDefined();
    expect(tool.inputSchema.properties.page_size).toBeDefined();
  });
});

describe("createTalorSerpListEnginesTool()", () => {
  it("should return a tool with correct name", () => {
    const wrapper = new TalorSerpAPIWrapper({ talorApiKey: "test-key" });
    const tool = createTalorSerpListEnginesTool(wrapper);
    expect(tool.name).toBe("talor_serp_list_engines");
  });

  it("should list all engines when no engine specified", async () => {
    const wrapper = new TalorSerpAPIWrapper({ talorApiKey: "test-key" });
    const tool = createTalorSerpListEnginesTool(wrapper);
    const result = await tool.execute({});
    expect(result).toContain("Total engines:");
    expect(result).toContain("google");
  });

  it("should inspect specific engine", async () => {
    const wrapper = new TalorSerpAPIWrapper({ talorApiKey: "test-key" });
    const tool = createTalorSerpListEnginesTool(wrapper);
    const result = await tool.execute({ engine: "google" });
    expect(result.toLowerCase()).toContain("google");
    expect(result).toContain("Parameters:");
  });

  it("should return unknown for nonexistent engine", async () => {
    const wrapper = new TalorSerpAPIWrapper({ talorApiKey: "test-key" });
    const tool = createTalorSerpListEnginesTool(wrapper);
    const result = await tool.execute({ engine: "nonexistent" });
    expect(result).toContain("Unknown engine");
  });
});

describe("createTalorSerpStatisticsTool()", () => {
  it("should return a tool with correct name", () => {
    const wrapper = new TalorSerpAPIWrapper({ talorApiKey: "test-key" });
    const tool = createTalorSerpStatisticsTool(wrapper);
    expect(tool.name).toBe("talor_serp_statistics");
  });

  it("should have required start_date and end_date", () => {
    const wrapper = new TalorSerpAPIWrapper({ talorApiKey: "test-key" });
    const tool = createTalorSerpStatisticsTool(wrapper);
    expect(tool.inputSchema.required).toContain("start_date");
    expect(tool.inputSchema.required).toContain("end_date");
  });
});

describe("TalorSerpTool", () => {
  it("fromApiKey should return a tool", () => {
    const tool = TalorSerpTool.fromApiKey("test-key");
    expect(tool.name).toBe("talor_serp_search");
  });

  it("fromEnv should return a tool", () => {
    process.env.TALOR_API_KEY = "test-key";
    const tool = TalorSerpTool.fromEnv();
    expect(tool.name).toBe("talor_serp_search");
    delete process.env.TALOR_API_KEY;
  });

  it("fromWrapper should return a tool", () => {
    const wrapper = new TalorSerpAPIWrapper({ talorApiKey: "test-key" });
    const tool = TalorSerpTool.fromWrapper(wrapper);
    expect(tool.name).toBe("talor_serp_search");
  });

  it("historyFromEnv should return a tool", () => {
    process.env.TALOR_API_KEY = "test-key";
    const tool = TalorSerpTool.historyFromEnv();
    expect(tool.name).toBe("talor_serp_history");
    delete process.env.TALOR_API_KEY;
  });

  it("statisticsFromEnv should return a tool", () => {
    process.env.TALOR_API_KEY = "test-key";
    const tool = TalorSerpTool.statisticsFromEnv();
    expect(tool.name).toBe("talor_serp_statistics");
    delete process.env.TALOR_API_KEY;
  });

  it("toolsFromEnv should return 4 tools", () => {
    process.env.TALOR_API_KEY = "test-key";
    const tools = TalorSerpTool.toolsFromEnv();
    expect(tools.length).toBe(4);
    const names = tools.map((t) => t.name);
    expect(names).toContain("talor_serp_search");
    expect(names).toContain("talor_serp_list_engines");
    expect(names).toContain("talor_serp_history");
    expect(names).toContain("talor_serp_statistics");
    delete process.env.TALOR_API_KEY;
  });

  it("toolsFromApiKey should return 4 tools", () => {
    const tools = TalorSerpTool.toolsFromApiKey("test-key");
    expect(tools.length).toBe(4);
  });
});
