/**
 * LangChain wrapper for Talor SERP API.
 *
 * Follows the same API surface as GoogleSerperAPIWrapper from langchain_community,
 * so users can swap integrations with minimal code changes.
 *
 * Engine schemas are bundled inside the package for full parameter awareness.
 */

import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  EngineRegistry,
  EngineSchema,
  allFields,
  toDescription,
  toParamSchema,
} from "./schema";
import { serialize, compactResponseData } from "./serialize";
import { DEFAULT_ENGINE } from "./engines";

const _DEFAULT_ENDPOINT = "https://serpapi.talordata.net/serp/v1/request";

// Singleton registry — lazily loaded
let _registry: EngineRegistry | null = null;

function _getRegistry(): EngineRegistry {
  if (!_registry) {
    _registry = new EngineRegistry();
  }
  return _registry;
}

export interface TalorDataSerpAPIWrapperOptions {
  talorApiKey?: string;
  endpoint?: string;
  engine?: string;
  gl?: string;
  hl?: string;
  device?: string;
  responseMode?: string;
  timeout?: number;
  k?: number;
}

export interface SearchResult {
  ok: boolean;
  status: number;
  engine?: string;
  data?: any;
  raw?: string;
}

export class TalorDataSerpAPIWrapper {
  private talorApiKey: string;
  private endpoint: string;
  private engine: string;
  private gl: string;
  private hl: string;
  private device: string;
  private responseMode: string;
  private timeout: number;
  private k: number;
  private httpClient: AxiosInstance;

  constructor(options: TalorDataSerpAPIWrapperOptions = {}) {
    this.talorApiKey = options.talorApiKey || "";
    this.endpoint = options.endpoint || _DEFAULT_ENDPOINT;
    this.engine = options.engine || DEFAULT_ENGINE;
    this.gl = options.gl || "us";
    this.hl = options.hl || "en";
    this.device = options.device || "desktop";
    this.responseMode = options.responseMode || "compact";
    this.timeout = options.timeout || 15000;
    this.k = options.k || 5;

    this.httpClient = axios.create({
      timeout: this.timeout,
    });
  }

  private _registry(): EngineRegistry {
    return _getRegistry();
  }

  getEngineSchema(engineKey?: string): EngineSchema | undefined {
    const key = engineKey || this.engine;
    return this._registry().engine(key);
  }

  listEngines(): string[] {
    return this._registry().engineKeys;
  }

  engineDescription(engineKey: string): string {
    const schema = this._registry().engine(engineKey);
    if (!schema) return `Unknown engine: ${engineKey}`;
    return toDescription(schema);
  }

  engineParamSchema(engineKey: string): Record<string, any> | null {
    const schema = this._registry().engine(engineKey);
    if (!schema) return null;
    return toParamSchema(schema);
  }

  private _resolveApiKey(kwargs: Record<string, any>): string {
    const key = kwargs.talorApiKey || this.talorApiKey;
    if (!key) {
      const envKey = process.env.TALOR_API_KEY;
      if (!envKey) {
        throw new Error(
          "Talor API key is required. Set TALOR_API_KEY environment variable or pass talorApiKey."
        );
      }
      return envKey;
    }
    return key;
  }

  private _buildPayload(
    query: string = "",
    engine?: string,
    kwargs: Record<string, any> = {}
  ): Record<string, any> {
    const engineKey = engine || kwargs.engine || this.engine;
    const schema = this._registry().engine(engineKey);
    const queryField = schema?.query_field || "q";

    // Build raw params dict
    const raw: Record<string, any> = { engine: engineKey };

    // Set query on the correct field
    raw[queryField] = query;

    // Set json format (default to "2" for JSON + HTML)
    if (!("json" in kwargs)) {
      raw["json"] = "2";
    }

    // Apply defaults from schema for common params
    const defaults: Record<string, any> = {
      gl: this.gl,
      hl: this.hl,
      device: this.device,
    };

    if (schema) {
      for (const f of allFields(schema)) {
        if (f.key === "q" || f.key === "engine" || f.key === "text" || f.key === queryField) {
          continue;
        }
        if (
          f.default_value !== null &&
          f.default_value !== undefined &&
          !(f.key in kwargs) &&
          !(f.key in defaults)
        ) {
          defaults[f.key] = f.default_value;
        }
      }
    }

    // Merge: schema defaults < wrapper defaults < user kwargs
    for (const [key, value] of Object.entries(defaults)) {
      if (!(key in kwargs)) {
        raw[key] = value;
      }
    }

    for (const [key, value] of Object.entries(kwargs)) {
      if (value !== null && value !== undefined) {
        raw[key] = value;
      }
    }

    // Serialize based on schema field types
    if (schema) {
      return serialize(schema, raw);
    }

    return raw;
  }

  async results(
    query: string = "",
    engine?: string,
    kwargs: Record<string, any> = {}
  ): Promise<SearchResult> {
    const apiKey = this._resolveApiKey(kwargs);
    const payload = this._buildPayload(query, engine, kwargs);

    // Stringify all values for form encoding (like Go version)
    const formPayload: Record<string, string> = {};
    for (const [key, value] of Object.entries(payload)) {
      const stringValue = this._stringifyValue(value);
      if (stringValue !== "") {
        formPayload[key] = stringValue;
      }
    }

    try {
      const response: AxiosResponse = await this.httpClient.post(
        this.endpoint,
        new URLSearchParams(formPayload).toString(),
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
            Origin: "langchain_ts",
          },
        }
      );

      const result: SearchResult = {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        engine: payload.engine || this.engine,
      };

      try {
        result.data = response.data;
      } catch {
        result.raw = JSON.stringify(response.data);
      }

      return result;
    } catch (error: any) {
      if (error.response) {
        return {
          ok: false,
          status: error.response.status,
          engine: payload.engine || this.engine,
          raw: error.message,
        };
      }
      throw error;
    }
  }

  private _stringifyValue(value: any): string {
    if (value === null || value === undefined) {
      return "";
    }
    if (typeof value === "string") {
      return value.trim();
    }
    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }
    if (Array.isArray(value)) {
      return value
        .map((item) => this._stringifyValue(item))
        .filter((item) => item !== "")
        .join(",");
    }
    // For numbers and other types
    return String(value).trim();
  }

  private _unwrapData(data: any): Record<string, any> {
    if (!data || typeof data !== "object") return {};

    // Handle nested {"code": 0, "data": {...}} wrapper
    if ("code" in data && "data" in data && typeof data.data === "object") {
      data = data.data;
    }

    // Handle json_html format: {"html": "...", "json": "{...}"}
    if ("json" in data && "html" in data) {
      const jsonField = data.json;
      if (typeof jsonField === "string") {
        try {
          data = JSON.parse(jsonField);
        } catch {
          // ignore parse error
        }
      } else if (typeof jsonField === "object") {
        data = jsonField;
      }
    }

    return typeof data === "object" ? data : {};
  }

  private _processResponse(res: SearchResult, k?: number): string {
    const resultK = k || this.k;
    const snippets: string[] = [];

    let data = res.data;
    if (!data) {
      return res.raw || "No results found.";
    }

    // Unwrap nested/json_html format
    data = this._unwrapData(data);

    // In compact mode, strip metadata
    if (this.responseMode === "compact") {
      data = compactResponseData(data);
    }

    // Organic results
    const organic = data.organic || [];
    if (organic.length > 0) {
      for (let i = 0; i < Math.min(organic.length, resultK); i++) {
        const result = organic[i];
        const title = result.title || "";
        const link = result.link || "";
        const snippet = result.snippet || "";
        const position = result.position || i + 1;

        const parts = [`${position}. ${title}`];
        if (snippet) parts.push(`   ${snippet}`);
        if (link) parts.push(`   URL: ${link}`);
        snippets.push(parts.join("\n"));
      }
    }

    // Knowledge graph
    const kg = data.knowledge_graph;
    if (kg) {
      const title = kg.title || "";
      const description = kg.description || "";
      if (title) {
        const kgParts = [`Knowledge Graph: ${title}`];
        if (description) kgParts.push(`  ${description}`);
        if (kg.attributes) {
          for (const [attrKey, attrValue] of Object.entries(kg.attributes)) {
            kgParts.push(`  ${attrKey}: ${attrValue}`);
          }
        }
        snippets.unshift(kgParts.join("\n"));
      }
    }

    // Answer box
    const answerBox = data.answer_box;
    if (answerBox) {
      const answer = answerBox.answer || answerBox.snippet || "";
      if (answer) {
        snippets.unshift(`Answer: ${answer}`);
      }
    }

    // AI Overview
    const aiOverview = data.ai_overview;
    if (aiOverview) {
      const overviewText = aiOverview.text || "";
      if (overviewText) {
        snippets.unshift(`AI Overview: ${overviewText}`);
      }
    }

    // Google Flights results
    const bestFlights = data.best_flights || [];
    if (bestFlights.length > 0) {
      for (let i = 0; i < Math.min(bestFlights.length, 3); i++) {
        const option = bestFlights[i];
        const tripType = option.type || "trip";
        const legs = option.flight || [];
        const parts = [`Option ${i + 1} (${tripType}):`];

        for (const leg of legs) {
          const airline = leg.airline || "";
          const flightNo = leg.flight_number || "";
          const dep = leg.departure_airport || {};
          const arr = leg.arrival_airport || {};
          const depInfo = `${dep.id || ""} ${dep.time || ""}`;
          const arrInfo = `${arr.id || ""} ${arr.time || ""}`;
          parts.push(`  ${airline} ${flightNo}: ${depInfo} -> ${arrInfo}`);
        }

        snippets.push(parts.join("\n"));
      }
    }

    if (snippets.length === 0) {
      return data ? JSON.stringify(data) : "No results found.";
    }

    return snippets.join("\n\n");
  }

  async run(
    query: string = "",
    engine?: string,
    kwargs: Record<string, any> = {}
  ): Promise<string> {
    const k = kwargs.k || this.k;
    const res = await this.results(query, engine, kwargs);
    return this._processResponse(res, k);
  }

  // History

  private _historyEndpoint =
    "https://api.talordata.com/accounts/v1/serp/mcp/history";

  async history(options: {
    page?: number;
    pageSize?: number;
    searchQuery?: string;
    searchEngine?: string;
    status?: string;
    startTime?: number;
    endTime?: number;
    timezone?: string;
  } = {}): Promise<SearchResult> {
    const {
      page = 1,
      pageSize = 20,
      searchQuery,
      searchEngine,
      status = "all",
      startTime,
      endTime,
      timezone,
    } = options;

    const apiKey = this._resolveApiKey({});
    const params: Record<string, any> = {
      page,
      page_size: pageSize,
      status,
      api_token_id: apiKey,
    };

    if (searchQuery) params.search_query = searchQuery;
    if (searchEngine) params.search_engine = searchEngine;
    if (startTime) params.start_time = startTime;
    if (endTime) params.end_time = endTime;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: "langchain_ts",
    };
    if (timezone) headers["X-Time-Zone"] = timezone;

    try {
      const response = await this.httpClient.get(this._historyEndpoint, {
        params,
        headers,
      });

      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.data,
      };
    } catch (error: any) {
      if (error.response) {
        return {
          ok: false,
          status: error.response.status,
          raw: error.message,
        };
      }
      throw error;
    }
  }

  // Statistics

  private _statisticsEndpoint =
    "https://api.talordata.com/pay_package_view/v1/serp/mcp/statistics";

  async statistics(options: {
    startDate: string;
    endDate: string;
    engines?: string;
    timezone?: string;
  }): Promise<SearchResult> {
    const { startDate, endDate, engines, timezone } = options;

    const apiKey = this._resolveApiKey({});
    const params: Record<string, any> = {
      start_date: startDate,
      end_date: endDate,
      api_token_id: apiKey,
    };

    if (engines) params.engines = engines;
    if (timezone) params.timezone = timezone;

    try {
      const response = await this.httpClient.get(this._statisticsEndpoint, {
        params,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "langchain_ts",
        },
      });

      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.data,
      };
    } catch (error: any) {
      if (error.response) {
        return {
          ok: false,
          status: error.response.status,
          raw: error.message,
        };
      }
      throw error;
    }
  }
}
