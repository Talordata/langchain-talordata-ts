import { TalorDataSerpAPIWrapper, SearchResult } from "../src/wrapper";
import axios from "axios";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("TalorDataSerpAPIWrapper", () => {
  let wrapper: TalorDataSerpAPIWrapper;

  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = new TalorDataSerpAPIWrapper({ talorApiKey: "test-key" });

    // Setup mock axios instance
    const mockPost = jest.fn();
    const mockGet = jest.fn();
    (mockedAxios.create as jest.Mock).mockReturnValue({
      post: mockPost,
      get: mockGet,
      interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
    } as any);
  });

  describe("constructor", () => {
    it("should set default values", () => {
      const w = new TalorDataSerpAPIWrapper({ talorApiKey: "key" });
      expect(w).toBeDefined();
    });

    it("should use provided options", () => {
      const w = new TalorDataSerpAPIWrapper({
        talorApiKey: "key",
        engine: "bing",
        gl: "cn",
        hl: "zh",
      });
      expect(w).toBeDefined();
    });
  });

  describe("listEngines()", () => {
    it("should return more than 30 engines", () => {
      const engines = wrapper.listEngines();
      expect(engines.length).toBeGreaterThan(30);
      expect(engines).toContain("google");
    });
  });

  describe("engineDescription()", () => {
    it("should contain engine name", () => {
      const desc = wrapper.engineDescription("google");
      expect(desc.toLowerCase()).toContain("google");
    });

    it("should return unknown for nonexistent engine", () => {
      const desc = wrapper.engineDescription("nonexistent");
      expect(desc).toContain("Unknown");
    });
  });

  describe("engineParamSchema()", () => {
    it("should return a valid schema", () => {
      const schema = wrapper.engineParamSchema("google");
      expect(schema).not.toBeNull();
      expect(schema!.type).toBe("object");
    });

    it("should return null for unknown engine", () => {
      expect(wrapper.engineParamSchema("nonexistent")).toBeNull();
    });
  });

  describe("getEngineSchema()", () => {
    it("should return google schema", () => {
      const schema = wrapper.getEngineSchema("google");
      expect(schema).toBeDefined();
      expect(schema!.key).toBe("google");
    });
  });
});
