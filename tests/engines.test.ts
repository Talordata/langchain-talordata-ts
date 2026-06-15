import {
  DEFAULT_ENGINE,
  SUPPORTED_ENGINES,
  ENGINE_CATEGORIES,
  EngineKey,
} from "../src/engines";

describe("engines", () => {
  describe("DEFAULT_ENGINE", () => {
    it("should be google", () => {
      expect(DEFAULT_ENGINE).toBe("google");
    });
  });

  describe("SUPPORTED_ENGINES", () => {
    it("should be a non-empty array", () => {
      expect(Array.isArray(SUPPORTED_ENGINES)).toBe(true);
      expect(SUPPORTED_ENGINES.length).toBeGreaterThan(0);
    });

    it("should contain all google engines", () => {
      const googleEngines = SUPPORTED_ENGINES.filter((e) =>
        e.startsWith("google")
      );
      expect(googleEngines.length).toBeGreaterThanOrEqual(20);
    });

    it("should contain all bing engines", () => {
      const bingEngines = SUPPORTED_ENGINES.filter((e) =>
        e.startsWith("bing")
      );
      expect(bingEngines.length).toBeGreaterThanOrEqual(5);
    });

    it("should contain yandex", () => {
      expect(SUPPORTED_ENGINES).toContain("yandex");
    });

    it("should contain duckduckgo", () => {
      expect(SUPPORTED_ENGINES).toContain("duckduckgo");
    });

    it("should have no duplicates", () => {
      const unique = new Set(SUPPORTED_ENGINES);
      expect(unique.size).toBe(SUPPORTED_ENGINES.length);
    });
  });

  describe("ENGINE_CATEGORIES", () => {
    it("should have google category", () => {
      expect(ENGINE_CATEGORIES).toHaveProperty("google");
    });

    it("should have bing category", () => {
      expect(ENGINE_CATEGORIES).toHaveProperty("bing");
    });

    it("should have yandex category", () => {
      expect(ENGINE_CATEGORIES).toHaveProperty("yandex");
    });

    it("should have duckduckgo category", () => {
      expect(ENGINE_CATEGORIES).toHaveProperty("duckduckgo");
    });

    it("should cover all engines", () => {
      const allCategorized = Object.values(ENGINE_CATEGORIES).flat();
      expect(allCategorized.sort()).toEqual([...SUPPORTED_ENGINES].sort());
    });
  });
});
