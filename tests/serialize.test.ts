import { serialize, compactResponseData } from "../src/serialize";
import { EngineRegistry, EngineSchema } from "../src/schema";

function makeSchema(
  key: string,
  fields: Array<{ key: string; type: string; default_value?: any; options?: any[]; range_keys?: any }>
): EngineSchema {
  return {
    key,
    name: key,
    query_field: "q",
    groups: [
      {
        key: "g",
        title: "G",
        collapsible: false,
        fields: fields.map((f) => ({
          key: f.key,
          type: f.type,
          required: false,
          label: f.key,
          help: "",
          default_value: f.default_value ?? null,
          options: f.options || [],
          range_keys: f.range_keys,
        })),
      },
    ],
    category: "",
    is_default: false,
  };
}

describe("serialize()", () => {
  it("should handle switch true", () => {
    const schema = makeSchema("test", [
      { key: "no_cache", type: "switch", default_value: false },
    ]);
    const result = serialize(schema, { q: "test", no_cache: true });
    expect(result.no_cache).toBe("true");
  });

  it("should handle switch false", () => {
    const schema = makeSchema("test", [
      { key: "no_cache", type: "switch", default_value: false },
    ]);
    const result = serialize(schema, { q: "test", no_cache: false });
    expect(result.no_cache).toBe("false");
  });

  it("should handle number", () => {
    const schema = makeSchema("test", [
      { key: "num", type: "number", default_value: 10 },
    ]);
    const result = serialize(schema, { q: "test", num: 20 });
    expect(result.num).toBe("20");
  });

  it("should handle number empty", () => {
    const schema = makeSchema("test", [
      { key: "num", type: "number", default_value: 10 },
    ]);
    const result = serialize(schema, { q: "test", num: null });
    expect(result.num).toBe("");
  });

  it("should handle tags", () => {
    const schema = makeSchema("test", [
      { key: "lr", type: "tags", options: [{ value: "en", label: "English" }] },
    ]);
    const result = serialize(schema, { q: "test", lr: ["en", "fr"] });
    expect(result.lr).toBe("en,fr");
  });

  it("should handle cr (country restrict)", () => {
    const schema = makeSchema("test", [
      { key: "cr", type: "tags", options: [{ value: "us", label: "US" }] },
    ]);
    const result = serialize(schema, { q: "test", cr: ["us"] });
    expect(result.cr).toBe("countryUS");
  });

  it("should handle date_range", () => {
    const schema = makeSchema("test", [
      {
        key: "date_range",
        type: "date_range",
        range_keys: { start: "start_date", end: "end_date" },
      },
    ]);
    const result = serialize(schema, {
      q: "test",
      date_range: ["2024-01-01", "2024-12-31"],
    });
    expect(result.start_date).toBe("2024-01-01");
    expect(result.end_date).toBe("2024-12-31");
    expect(result.date_range).toBeUndefined();
  });

  it("should filter out null values", () => {
    const schema = makeSchema("test", [
      { key: "opt", type: "select", default_value: "a" },
    ]);
    const result = serialize(schema, { q: "test" });
    expect(result.opt).toBeUndefined();
  });

  it("should return empty for null schema", () => {
    expect(serialize(null as any, { q: "test" })).toEqual({});
  });

  it("should return empty for empty values", () => {
    const schema = makeSchema("test", [{ key: "q", type: "text" }]);
    expect(serialize(schema, {})).toEqual({});
  });

  it("should normalize flight IATA codes to uppercase", () => {
    const schema = makeSchema("google_flights", [
      { key: "departure_id", type: "text" },
      { key: "arrival_id", type: "text" },
    ]);
    const result = serialize(schema, {
      q: "flights",
      departure_id: "sfo",
      arrival_id: "nrt",
    });
    expect(result.departure_id).toBe("SFO");
    expect(result.arrival_id).toBe("NRT");
  });

  it("should keep already uppercase IATA codes", () => {
    const schema = makeSchema("google_flights", [
      { key: "departure_id", type: "text" },
    ]);
    const result = serialize(schema, { q: "flights", departure_id: "SFO" });
    expect(result.departure_id).toBe("SFO");
  });
});

describe("compactResponseData()", () => {
  it("should remove metadata keys", () => {
    const data = {
      organic: [{ title: "A" }],
      search_metadata: { engine: "google" },
      search_parameters: { q: "test" },
      search_information: { total_results: 100 },
      pagination: { next: "url" },
    };
    const result = compactResponseData(data);
    expect(result.organic).toBeDefined();
    expect(result.search_metadata).toBeUndefined();
    expect(result.search_parameters).toBeUndefined();
    expect(result.search_information).toBeUndefined();
    expect(result.pagination).toBeUndefined();
  });

  it("should pass through non-object", () => {
    expect(compactResponseData("string")).toBe("string");
    expect(compactResponseData(42)).toBe(42);
  });

  it("should handle empty dict", () => {
    expect(compactResponseData({})).toEqual({});
  });
});
