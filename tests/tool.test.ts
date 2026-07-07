import {
  createTalorDataSerpTool,
  createTalorDataSerpHistoryTool,
  createTalorDataSerpListEnginesTool,
  createTalorDataSerpStatisticsTool,
  TalorDataSerpTool,
  TalorDataSerpSearchInput,
} from "../src/tool";
import { TalorDataSerpAPIWrapper } from "../src/wrapper";

describe("createTalorDataSerpTool()", () => {
  let wrapper: TalorDataSerpAPIWrapper;

  beforeEach(() => {
    wrapper = new TalorDataSerpAPIWrapper({ talorApiKey: "test-key" });
  });

  it("should return a tool with correct name", () => {
    const tool = createTalorDataSerpTool(wrapper);
    expect(tool.name).toBe("talor_serp_search");
  });

  it("should accept custom name", () => {
    const tool = createTalorDataSerpTool(wrapper, "my_search");
    expect(tool.name).toBe("my_search");
  });

  it("should have description", () => {
    const tool = createTalorDataSerpTool(wrapper);
    expect(tool.description.length).toBeGreaterThan(0);
  });

  it("should have input schema", () => {
    const tool = createTalorDataSerpTool(wrapper);
    expect(tool.inputSchema.type).toBe("object");
    expect(tool.inputSchema.properties.query).toBeDefined();
    expect(tool.inputSchema.properties.engine).toBeDefined();
    expect(tool.inputSchema.properties.params).toBeDefined();
  });

  it("should accept custom description", () => {
    const tool = createTalorDataSerpTool(wrapper, "t", "Custom desc");
    expect(tool.description).toBe("Custom desc");
  });
});

describe("createTalorDataSerpHistoryTool()", () => {
  it("should return a tool with correct name", () => {
    const wrapper = new TalorDataSerpAPIWrapper({ talorApiKey: "test-key" });
    const tool = createTalorDataSerpHistoryTool(wrapper);
    expect(tool.name).toBe("talor_serp_history");
  });

  it("should have input schema with page and page_size", () => {
    const wrapper = new TalorDataSerpAPIWrapper({ talorApiKey: "test-key" });
    const tool = createTalorDataSerpHistoryTool(wrapper);
    expect(tool.inputSchema.properties.page).toBeDefined();
    expect(tool.inputSchema.properties.page_size).toBeDefined();
  });
});

describe("createTalorDataSerpListEnginesTool()", () => {
  it("should return a tool with correct name", () => {
    const wrapper = new TalorDataSerpAPIWrapper({ talorApiKey: "test-key" });
    const tool = createTalorDataSerpListEnginesTool(wrapper);
    expect(tool.name).toBe("talor_serp_list_engines");
  });

  it("should list all engines when no engine specified", async () => {
    const wrapper = new TalorDataSerpAPIWrapper({ talorApiKey: "test-key" });
    const tool = createTalorDataSerpListEnginesTool(wrapper);
    const result = await tool.execute({});
    expect(result).toContain("Total engines:");
    expect(result).toContain("google");
  });

  it("should inspect specific engine", async () => {
    const wrapper = new TalorDataSerpAPIWrapper({ talorApiKey: "test-key" });
    const tool = createTalorDataSerpListEnginesTool(wrapper);
    const result = await tool.execute({ engine: "google" });
    expect(result.toLowerCase()).toContain("google");
    expect(result).toContain("Parameters:");
  });

  it("should return unknown for nonexistent engine", async () => {
    const wrapper = new TalorDataSerpAPIWrapper({ talorApiKey: "test-key" });
    const tool = createTalorDataSerpListEnginesTool(wrapper);
    const result = await tool.execute({ engine: "nonexistent" });
    expect(result).toContain("Unknown engine");
  });
});

describe("createTalorDataSerpStatisticsTool()", () => {
  it("should return a tool with correct name", () => {
    const wrapper = new TalorDataSerpAPIWrapper({ talorApiKey: "test-key" });
    const tool = createTalorDataSerpStatisticsTool(wrapper);
    expect(tool.name).toBe("talor_serp_statistics");
  });

  it("should have required start_date and end_date", () => {
    const wrapper = new TalorDataSerpAPIWrapper({ talorApiKey: "test-key" });
    const tool = createTalorDataSerpStatisticsTool(wrapper);
    expect(tool.inputSchema.required).toContain("start_date");
    expect(tool.inputSchema.required).toContain("end_date");
  });
});

describe("TalorDataSerpTool", () => {
  it("fromApiKey should return a tool", () => {
    const tool = TalorDataSerpTool.fromApiKey("test-key");
    expect(tool.name).toBe("talor_serp_search");
  });

  it("fromEnv should return a tool", () => {
    process.env.TALOR_API_KEY = "test-key";
    const tool = TalorDataSerpTool.fromEnv();
    expect(tool.name).toBe("talor_serp_search");
    delete process.env.TALOR_API_KEY;
  });

  it("fromWrapper should return a tool", () => {
    const wrapper = new TalorDataSerpAPIWrapper({ talorApiKey: "test-key" });
    const tool = TalorDataSerpTool.fromWrapper(wrapper);
    expect(tool.name).toBe("talor_serp_search");
  });

  it("historyFromEnv should return a tool", () => {
    process.env.TALOR_API_KEY = "test-key";
    const tool = TalorDataSerpTool.historyFromEnv();
    expect(tool.name).toBe("talor_serp_history");
    delete process.env.TALOR_API_KEY;
  });

  it("statisticsFromEnv should return a tool", () => {
    process.env.TALOR_API_KEY = "test-key";
    const tool = TalorDataSerpTool.statisticsFromEnv();
    expect(tool.name).toBe("talor_serp_statistics");
    delete process.env.TALOR_API_KEY;
  });

  it("toolsFromEnv should return 4 tools", () => {
    process.env.TALOR_API_KEY = "test-key";
    const tools = TalorDataSerpTool.toolsFromEnv();
    expect(tools.length).toBe(4);
    const names = tools.map((t) => t.name);
    expect(names).toContain("talor_serp_search");
    expect(names).toContain("talor_serp_list_engines");
    expect(names).toContain("talor_serp_history");
    expect(names).toContain("talor_serp_statistics");
    delete process.env.TALOR_API_KEY;
  });

  it("toolsFromApiKey should return 4 tools", () => {
    const tools = TalorDataSerpTool.toolsFromApiKey("test-key");
    expect(tools.length).toBe(4);
  });
});
