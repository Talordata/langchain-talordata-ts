import {
  EngineRegistry,
  EngineSchema,
  Field,
  FieldGroup,
  allFields,
  fieldMap,
  requiredFields,
  toParamSchema,
  toDescription,
} from "../src/schema";

describe("EngineRegistry", () => {
  let registry: EngineRegistry;

  beforeEach(() => {
    registry = new EngineRegistry();
  });

  describe("constructor", () => {
    it("should load all engines", () => {
      expect(registry.engineKeys.length).toBeGreaterThan(30);
    });
  });

  describe("defaultEngine", () => {
    it("should return google", () => {
      expect(registry.defaultEngine).toBe("google");
    });
  });

  describe("engine()", () => {
    it("should return google schema", () => {
      const schema = registry.engine("google");
      expect(schema).toBeDefined();
      expect(schema!.key).toBe("google");
    });

    it("should return undefined for unknown engine", () => {
      expect(registry.engine("nonexistent")).toBeUndefined();
    });
  });

  describe("engines()", () => {
    it("should return a Map with google", () => {
      const engines = registry.engines();
      expect(engines).toBeInstanceOf(Map);
      expect(engines.has("google")).toBe(true);
    });
  });

  describe("categories()", () => {
    it("should have google category", () => {
      const cats = registry.categories();
      expect(cats).toHaveProperty("google");
    });

    it("should have bing category", () => {
      const cats = registry.categories();
      expect(cats).toHaveProperty("bing");
    });
  });

  describe("all engines", () => {
    it("should have valid schema for every engine", () => {
      for (const key of registry.engineKeys) {
        const schema = registry.engine(key);
        expect(schema).toBeDefined();
        expect(schema!.key).toBe(key);
        expect(schema!.name).not.toBe("");
        // Each schema should produce a valid param schema
        const ps = toParamSchema(schema!);
        expect(ps.type).toBe("object");
      }
    });
  });
});

describe("allFields()", () => {
  it("should return fields from all groups", () => {
    const registry = new EngineRegistry();
    const schema = registry.engine("google")!;
    const fields = allFields(schema);
    expect(fields.length).toBeGreaterThan(0);
    const fieldKeys = fields.map((f) => f.key);
    expect(fieldKeys).toContain("q");
  });
});

describe("fieldMap()", () => {
  it("should return a Map with field keys", () => {
    const registry = new EngineRegistry();
    const schema = registry.engine("google")!;
    const map = fieldMap(schema);
    expect(map).toBeInstanceOf(Map);
    expect(map.has("q")).toBe(true);
    expect(map.get("q")!.type).toBe("text");
  });
});

describe("requiredFields()", () => {
  it("should return only required fields", () => {
    const registry = new EngineRegistry();
    const schema = registry.engine("google")!;
    const req = requiredFields(schema);
    expect(req.length).toBeGreaterThan(0);
    expect(req.every((f) => f.required)).toBe(true);
  });

  it("patents_details should have patent_id as required", () => {
    const registry = new EngineRegistry();
    const schema = registry.engine("google_patents_details")!;
    const req = requiredFields(schema);
    expect(req.some((f) => f.key === "patent_id")).toBe(true);
  });
});

describe("toParamSchema()", () => {
  it("should return a valid JSON Schema object", () => {
    const registry = new EngineRegistry();
    const schema = registry.engine("google")!;
    const ps = toParamSchema(schema);
    expect(ps.type).toBe("object");
    expect(ps.properties).toBeDefined();
    expect(ps.properties.q).toBeDefined();
    expect(ps.required).toContain("q");
  });

  it("should include select enum for device field", () => {
    const registry = new EngineRegistry();
    const schema = registry.engine("google")!;
    const ps = toParamSchema(schema);
    expect(ps.properties.device).toBeDefined();
    expect(ps.properties.device.enum).toBeDefined();
  });

  it("should include switch type for no_cache", () => {
    const registry = new EngineRegistry();
    const schema = registry.engine("google")!;
    const ps = toParamSchema(schema);
    expect(ps.properties.no_cache).toBeDefined();
    expect(ps.properties.no_cache.type).toBe("boolean");
  });
});

describe("toDescription()", () => {
  it("should contain engine name", () => {
    const registry = new EngineRegistry();
    const schema = registry.engine("google")!;
    const desc = toDescription(schema);
    expect(desc.toLowerCase()).toContain("google");
    expect(desc).toContain("Search");
  });

  it("should contain query field info", () => {
    const registry = new EngineRegistry();
    const schema = registry.engine("google")!;
    const desc = toDescription(schema);
    expect(desc).toContain("Query field:");
  });
});
