/**
 * LangChain integration for Talor SERP API.
 *
 * Provides a drop-in replacement for GoogleSerperAPIWrapper with support
 * for 33 search engines across Google, Bing, Yandex, and DuckDuckGo.
 *
 * Quick start:
 * ```typescript
 * process.env.TALOR_API_KEY = "your-token";
 * import { TalorSerpAPIWrapper, TalorSerpTool } from "langchain-talor-serp";
 *
 * const wrapper = new TalorSerpAPIWrapper();
 * await wrapper.run("LangChain tutorial");
 *
 * const tool = TalorSerpTool.fromEnv();
 * ```
 */

export {
  EngineRegistry,
  EngineSchema,
  Field,
  FieldGroup,
  FieldOption,
  RangeKeys,
  allFields,
  fieldMap,
  requiredFields,
  toParamSchema,
  toDescription,
} from "./schema";

export {
  TalorSerpAPIWrapper,
  TalorSerpAPIWrapperOptions,
  SearchResult,
} from "./wrapper";

export {
  TalorSerpTool,
  createTalorSerpHistoryTool,
  createTalorSerpTool,
  createTalorSerpListEnginesTool,
  createTalorSerpStatisticsTool,
  TalorSerpHistoryInput,
  TalorSerpListEnginesInput,
  TalorSerpSearchInput,
  TalorSerpStatisticsInput,
} from "./tool";

export {
  DEFAULT_ENGINE,
  SUPPORTED_ENGINES,
  ENGINE_CATEGORIES,
  EngineKey,
} from "./engines";

export { serialize, compactResponseData } from "./serialize";

export const __version = "0.1.0";
