/**
 * LangChain Tool adapter for Talor SERP API.
 *
 * Provides pre-built tools that can be directly bound to LangChain agents.
 * Engine schemas are used to generate rich descriptions and parameter metadata.
 */
import {
  EngineRegistry,
  EngineSchema,
  allFields,
  requiredFields,
  toDescription,
} from "./schema";
import { TalorDataSerpAPIWrapper, TalorDataSerpAPIWrapperOptions } from "./wrapper";

function _buildEnginesSummary(registry: EngineRegistry): string {
  const lines: string[] = [];
  for (const key of registry.engineKeys) {
    const schema = registry.engine(key);
    if (!schema) continue;

    const req = requiredFields(schema)
      .filter((f) => f.key !== "q" && f.key !== "text")
      .map((f) => f.key);
    const reqStr = req.length > 0 ? ` [required: ${req.join(", ")}]` : "";
    lines.push(`  ${key}: ${schema.name}${reqStr}`);
  }
  return lines.join("\n");
}

function _buildEngineParamsDescription(
  schema: EngineSchema,
  maxOptions: number = 8
): string {
  const lines: string[] = [];

  for (const group of schema.groups) {
    for (const f of group.fields) {
      if (f.key === "q" || f.key === "text" || f.key === "engine") continue;

      const req = f.required ? " *required*" : "";
      const default_ = f.default_value
        ? ` (default: ${f.default_value})`
        : "";
      let typeInfo = f.type;

      if (f.type === "select" && f.options.length > 0) {
        const vals = f.options
          .slice(0, maxOptions)
          .map((o: any) => String(o.value));
        const extra =
          f.options.length > maxOptions
            ? ` (+${f.options.length - maxOptions} more)`
            : "";
        typeInfo = `select: ${vals.join(", ")}${extra}`;
      } else if (f.type === "switch") {
        typeInfo = "boolean";
      } else if (f.type === "tags" && f.options.length > 0) {
        const vals = f.options
          .slice(0, maxOptions)
          .map((o: any) => String(o.value));
        const extra =
          f.options.length > maxOptions
            ? ` (+${f.options.length - maxOptions} more)`
            : "";
        typeInfo = `tags: ${vals.join(", ")}${extra}`;
      } else if (f.type === "number") {
        typeInfo = "number";
      } else if (f.type === "date_range") {
        typeInfo = "array [start_date, end_date]";
      } else if (f.type === "date") {
        typeInfo = "string YYYY-MM-DD";
      }

      lines.push(
        `    ${f.key} (${typeInfo})${req}${default_}: ${f.help || f.label}`
      );
    }
  }

  return lines.join("\n");
}

export interface TalorDataSerpSearchInput {
  query?: string;
  engine?: string;
  params?: Record<string, any> | string;
}

export interface TalorDataSerpHistoryInput {
  page?: number;
  page_size?: number;
  search_query?: string;
  search_engine?: string;
  status?: string;
  start_time?: number;
  end_time?: number;
  timezone?: string;
}

export interface TalorDataSerpStatisticsInput {
  start_date: string;
  end_date: string;
  engines?: string;
  timezone?: string;
}

export interface TalorDataSerpListEnginesInput {
  engine?: string;
  args?: string;
}

type TalorTool<TInput, TOutput> = {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  execute: (input: TInput) => Promise<TOutput>;
};

function parseParamsInput(
  params?: Record<string, any> | string
): Record<string, any> {
  if (!params) {
    return {};
  }
  if (typeof params === "string") {
    const parsed = JSON.parse(params);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("params JSON must decode to an object");
    }
    return parsed as Record<string, any>;
  }
  return params;
}

export function createTalorDataSerpTool(
  wrapper?: TalorDataSerpAPIWrapper,
  name: string = "talor_serp_search",
  description?: string
): TalorTool<TalorDataSerpSearchInput, string> {
  if (!wrapper) {
    const apiKey = process.env.TALOR_API_KEY || "";
    wrapper = new TalorDataSerpAPIWrapper({ talorApiKey: apiKey });
  }

  const registry = (wrapper as any)._registry();

  if (!description) {
    const enginesSummary = _buildEnginesSummary(registry);
    description = `Search the web using Talor SERP API.

Available engines:
${enginesSummary}

Parameters:
  query: the search query (optional)
  engine: engine key (default: google)
  params: engine-specific parameters as JSON object

Common params across all engines:
  gl: country/region code (e.g. 'us', 'cn', 'uk')
  hl: interface language (e.g. 'en', 'zh', 'ja')
  device: 'desktop' or 'mobile'
  location: geographic targeting
  no_cache: boolean, force fresh results`;
  }

  const inputSchema = {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "The search query to execute. Optional — some engines allow browsing without a query.",
      },
      engine: {
        type: "string",
        description:
          "Search engine key. Common engines: google, google_web, google_images, google_news, google_shopping, google_maps, google_flights, google_hotels, google_scholar, google_jobs, google_videos, google_trends, google_finance, bing, bing_images, bing_news, bing_shopping, bing_videos, yandex, duckduckgo. Use the talor_serp_list_engines tool to see all options.",
      },
      params: {
        oneOf: [{ type: "object" }, { type: "string" }],
        description:
          "Engine-specific parameters as a JSON object. Common params: gl (country code, e.g. 'us'), hl (language, e.g. 'en'), device ('desktop'/'mobile'), location, no_cache (boolean). Each engine has unique params — check the engine schema for details. Example: {\"gl\": \"cn\", \"hl\": \"zh\", \"device\": \"mobile\"}",
      },
    },
  };

  return {
    name,
    description,
    inputSchema,
    execute: async (input: TalorDataSerpSearchInput): Promise<string> => {
      const extra = parseParamsInput(input.params);
      return wrapper!.run(input.query, input.engine, extra);
    },
  };
}

export function createTalorDataSerpHistoryTool(
  wrapper?: TalorDataSerpAPIWrapper,
  name: string = "talor_serp_history",
  description?: string
): TalorTool<TalorDataSerpHistoryInput, any> {
  if (!wrapper) {
    const apiKey = process.env.TALOR_API_KEY || "";
    wrapper = new TalorDataSerpAPIWrapper({ talorApiKey: apiKey });
  }

  return {
    name,
    description:
      description ||
      `Query Talor SERP search history.

Parameters:
  page: page number (default: 1)
  page_size: page size (default: 20)
  search_query: optional keyword filter
  search_engine: optional engine filter such as google or bing
  status: all, success, or error
  start_time: optional start unix timestamp in seconds
  end_time: optional end unix timestamp in seconds
  timezone: optional timezone header such as Asia/Shanghai or +08:00`,
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number", description: "Page number." },
        page_size: { type: "number", description: "Page size." },
        search_query: {
          type: "string",
          description: "Filter by search keyword.",
        },
        search_engine: {
          type: "string",
          description: "Filter by engine name, such as 'google' or 'bing'.",
        },
        status: {
          type: "string",
          description: "Status filter: all, success, or error.",
        },
        start_time: {
          type: "number",
          description: "Start unix timestamp in seconds.",
        },
        end_time: {
          type: "number",
          description: "End unix timestamp in seconds.",
        },
        timezone: {
          type: "string",
          description: "Timezone header, e.g. 'Asia/Shanghai' or '+08:00'.",
        },
      },
    },
    execute: async (input: TalorDataSerpHistoryInput) =>
      wrapper!.history({
        page: input.page,
        pageSize: input.page_size,
        searchQuery: input.search_query,
        searchEngine: input.search_engine,
        status: input.status,
        startTime: input.start_time,
        endTime: input.end_time,
        timezone: input.timezone,
      }),
  };
}

export function createTalorDataSerpListEnginesTool(
  wrapper?: TalorDataSerpAPIWrapper,
  name: string = "talor_serp_list_engines"
): TalorTool<TalorDataSerpListEnginesInput, string> {
  if (!wrapper) {
    const apiKey = process.env.TALOR_API_KEY || "";
    wrapper = new TalorDataSerpAPIWrapper({ talorApiKey: apiKey });
  }

  const registry = (wrapper as any)._registry();

  return {
    name,
    description:
      "List all available Talor SERP search engines and their parameters. Call with engine='engine_key' to get detailed param info for a specific engine.",
    inputSchema: {
      type: "object",
      properties: {
        engine: {
          type: "string",
          description: "Engine key to get detailed parameter info for.",
        },
        args: {
          type: "string",
          description:
            "Compatibility field for models that emit a generic 'args' string.",
        },
      },
    },
    execute: async (input: TalorDataSerpListEnginesInput): Promise<string> => {
      const engine = input.engine || input.args;
      if (engine) {
        const schema = registry.engine(engine);
        if (!schema) {
          return `Unknown engine: ${engine}. Available: ${registry.engineKeys.join(", ")}`;
        }
        return `${toDescription(schema)}\n\nParameters:\n${_buildEngineParamsDescription(schema)}`;
      }

      const lines: string[] = [`Total engines: ${registry.engineKeys.length}`];
      const categories = registry.categories();
      for (const [catKey, engineKeys] of Object.entries(categories)) {
        lines.push(`\n[${catKey}]`);
        for (const key of engineKeys as string[]) {
          const schema = registry.engine(key);
          if (schema) {
            lines.push(`  ${key}: ${schema.name}`);
          }
        }
      }
      lines.push(`\nDefault engine: ${registry.defaultEngine}`);
      lines.push(
        "\nUse engine='engine_key' to get detailed parameter info for a specific engine."
      );
      return lines.join("\n");
    },
  };
}

export function createTalorDataSerpStatisticsTool(
  wrapper?: TalorDataSerpAPIWrapper,
  name: string = "talor_serp_statistics",
  description?: string
): TalorTool<TalorDataSerpStatisticsInput, any> {
  if (!wrapper) {
    const apiKey = process.env.TALOR_API_KEY || "";
    wrapper = new TalorDataSerpAPIWrapper({ talorApiKey: apiKey });
  }

  return {
    name,
    description:
      description ||
      `Query Talor SERP usage statistics.

Parameters:
  start_date: start date in YYYY-MM-DD (required)
  end_date: end date in YYYY-MM-DD (required)
  engines: optional comma-separated engine keys such as google,bing
  timezone: optional timezone offset such as +08:00`,
    inputSchema: {
      type: "object",
      properties: {
        start_date: {
          type: "string",
          description: "Start date in YYYY-MM-DD.",
        },
        end_date: {
          type: "string",
          description: "End date in YYYY-MM-DD.",
        },
        engines: {
          type: "string",
          description: "Comma-separated engine keys, e.g. 'google,bing'.",
        },
        timezone: {
          type: "string",
          description: "Timezone offset, e.g. '+08:00'.",
        },
      },
      required: ["start_date", "end_date"],
    },
    execute: async (input: TalorDataSerpStatisticsInput) =>
      wrapper!.statistics({
        startDate: input.start_date,
        endDate: input.end_date,
        engines: input.engines,
        timezone: input.timezone,
      }),
  };
}

export class TalorDataSerpTool {
  static fromApiKey(
    apiKey: string,
    engine: string = "google",
    endpoint: string = "https://serpapi.talordata.net/serp/v1/request",
    options?: Partial<TalorDataSerpAPIWrapperOptions>
  ): ReturnType<typeof createTalorDataSerpTool> {
    const wrapper = new TalorDataSerpAPIWrapper({
      talorApiKey: apiKey,
      engine,
      endpoint,
      ...options,
    });
    return createTalorDataSerpTool(wrapper);
  }

  static fromEnv(
    options?: Partial<TalorDataSerpAPIWrapperOptions>
  ): ReturnType<typeof createTalorDataSerpTool> {
    if (!options) {
      return createTalorDataSerpTool(undefined, undefined, undefined);
    }
    const apiKey = process.env.TALOR_API_KEY || "";
    const wrapper = new TalorDataSerpAPIWrapper({ talorApiKey: apiKey, ...options });
    return createTalorDataSerpTool(wrapper);
  }

  static fromWrapper(
    wrapper: TalorDataSerpAPIWrapper,
    options?: Partial<TalorDataSerpAPIWrapperOptions>
  ): ReturnType<typeof createTalorDataSerpTool> {
    return createTalorDataSerpTool(wrapper);
  }

  static historyFromEnv(
    options?: Partial<TalorDataSerpAPIWrapperOptions>
  ): ReturnType<typeof createTalorDataSerpHistoryTool> {
    if (!options) {
      return createTalorDataSerpHistoryTool();
    }
    const apiKey = process.env.TALOR_API_KEY || "";
    const wrapper = new TalorDataSerpAPIWrapper({ talorApiKey: apiKey, ...options });
    return createTalorDataSerpHistoryTool(wrapper);
  }

  static historyFromWrapper(
    wrapper: TalorDataSerpAPIWrapper
  ): ReturnType<typeof createTalorDataSerpHistoryTool> {
    return createTalorDataSerpHistoryTool(wrapper);
  }

  static statisticsFromEnv(
    options?: Partial<TalorDataSerpAPIWrapperOptions>
  ): ReturnType<typeof createTalorDataSerpStatisticsTool> {
    if (!options) {
      return createTalorDataSerpStatisticsTool();
    }
    const apiKey = process.env.TALOR_API_KEY || "";
    const wrapper = new TalorDataSerpAPIWrapper({ talorApiKey: apiKey, ...options });
    return createTalorDataSerpStatisticsTool(wrapper);
  }

  static statisticsFromWrapper(
    wrapper: TalorDataSerpAPIWrapper
  ): ReturnType<typeof createTalorDataSerpStatisticsTool> {
    return createTalorDataSerpStatisticsTool(wrapper);
  }

  static toolsFromEnv(
    options?: Partial<TalorDataSerpAPIWrapperOptions>
  ): Array<TalorTool<any, any>> {
    const apiKey = process.env.TALOR_API_KEY || "";
    const wrapper = new TalorDataSerpAPIWrapper({ talorApiKey: apiKey, ...options });
    return [
      createTalorDataSerpTool(wrapper),
      createTalorDataSerpListEnginesTool(wrapper),
      createTalorDataSerpHistoryTool(wrapper),
      createTalorDataSerpStatisticsTool(wrapper),
    ];
  }

  static toolsFromApiKey(
    apiKey: string,
    options?: Partial<TalorDataSerpAPIWrapperOptions>
  ): Array<TalorTool<any, any>> {
    const wrapper = new TalorDataSerpAPIWrapper({ talorApiKey: apiKey, ...options });
    return [
      createTalorDataSerpTool(wrapper),
      createTalorDataSerpListEnginesTool(wrapper),
      createTalorDataSerpHistoryTool(wrapper),
      createTalorDataSerpStatisticsTool(wrapper),
    ];
  }
}
