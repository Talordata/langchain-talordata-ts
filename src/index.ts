/**
 * LangChain integration for Talor SERP API.
 *
 * Provides a drop-in replacement for GoogleSerperAPIWrapper with support
 * for 33 search engines across Google, Bing, Yandex, and DuckDuckGo.
 *
 * Quick start:
 * ```typescript
 * process.env.TALOR_API_KEY = "your-token";
 * import { TalorDataSerpAPIWrapper, TalorDataSerpTool } from "langchain-talordata";
 *
 * const wrapper = new TalorDataSerpAPIWrapper();
 * await wrapper.run("LangChain tutorial");
 *
 * const tool = TalorDataSerpTool.fromEnv();
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
  TalorDataSerpAPIWrapper,
  TalorDataSerpAPIWrapperOptions,
  SearchResult,
} from "./wrapper";

export {
  TalorDataSerpTool,
  createTalorDataSerpHistoryTool,
  createTalorDataSerpTool,
  createTalorDataSerpListEnginesTool,
  createTalorDataSerpStatisticsTool,
  TalorDataSerpHistoryInput,
  TalorDataSerpListEnginesInput,
  TalorDataSerpSearchInput,
  TalorDataSerpStatisticsInput,
} from "./tool";

export {
  DEFAULT_ENGINE,
  SUPPORTED_ENGINES,
  ENGINE_CATEGORIES,
  EngineKey,
} from "./engines";

export { serialize, compactResponseData } from "./serialize";

export const __version = "0.1.0";
