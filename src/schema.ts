/**
 * Engine schema loader — reads bundled JSON schemas from the data/ directory.
 *
 * Mirrors internal/engines/registry.go to provide TypeScript-side access to
 * all 33 engine parameter definitions. The JSON files are bundled with
 * the package so it works as a standalone npm package.
 */

import * as fs from "fs";
import * as path from "path";

export interface RangeKeys {
  start: string;
  end: string;
}

export interface FieldOption {
  value: any;
  label: string;
  children?: FieldOption[];
}

export interface Field {
  key: string;
  type: string; // text, select, switch, tags, number, date_range, date
  required: boolean;
  label: string;
  help: string;
  default_value: any;
  options: FieldOption[];
  range_keys?: RangeKeys;
}

export interface FieldGroup {
  key: string;
  title: string;
  collapsible: boolean;
  fields: Field[];
}

export interface EngineSchema {
  key: string;
  name: string;
  query_field: string;
  groups: FieldGroup[];
  category: string;
  is_default: boolean;
}

export interface EngineIndex {
  default_engine: string;
  count: number;
  categories: Array<{
    key: string;
    name: string;
    icon: string;
    engine_count: number;
  }>;
  engines: Array<{
    key: string;
    name: string;
    category: string;
    file: string;
  }>;
}

export class EngineRegistry {
  private _schemas: Map<string, EngineSchema> = new Map();
  private _index: EngineIndex | null = null;
  private _dataDir: string;

  constructor(dataDir?: string) {
    this._dataDir = dataDir || path.join(__dirname, "..", "data");
    this._load();
  }

  private _load(): void {
    const indexPath = path.join(this._dataDir, "index.json");
    if (!fs.existsSync(indexPath)) {
      console.warn(`Index file not found: ${indexPath}`);
      return;
    }

    const indexText = fs.readFileSync(indexPath, "utf-8");
    this._index = JSON.parse(indexText);

    if (!this._index) return;

    for (const engineRef of this._index.engines) {
      const key = engineRef.key;
      const filename = engineRef.file;
      if (!key || !filename) continue;

      const schemaPath = path.join(this._dataDir, filename);
      if (!fs.existsSync(schemaPath)) {
        console.warn(`Schema file not found: ${schemaPath}`);
        continue;
      }

      const schemaText = fs.readFileSync(schemaPath, "utf-8");
      const data = JSON.parse(schemaText);

      const schema = this._parseEngineSchema(data);
      if (!schema.key) schema.key = key;
      if (!schema.name) schema.name = engineRef.name;
      if (!schema.category) schema.category = engineRef.category;

      this._schemas.set(key, schema);
    }
  }

  private _parseEngineSchema(data: any): EngineSchema {
    const groups: FieldGroup[] = (data.groups || []).map((g: any) => ({
      key: g.key || "",
      title: g.title || g.key || "",
      collapsible: g.collapsible || false,
      fields: (g.fields || []).map((f: any) => this._parseField(f)),
    }));

    const cat = data.category;
    const category = typeof cat === "object" ? cat?.key || "" : cat || "";

    return {
      key: data.key || "",
      name: data.name || "",
      query_field: data.query_field || "q",
      groups,
      category,
      is_default: data.is_default_engine || false,
    };
  }

  private _parseField(d: any): Field {
    let rangeKeys: RangeKeys | undefined;
    if (d.range_keys) {
      rangeKeys = {
        start: d.range_keys.start || "",
        end: d.range_keys.end || "",
      };
    }

    const options: FieldOption[] = (d.options || []).map((o: any) =>
      this._parseFieldOption(o)
    );

    return {
      key: d.key || "",
      type: d.type || "text",
      required: d.required || false,
      label: d.label || d.key || "",
      help: d.help || "",
      default_value: d.default_value,
      options,
      range_keys: rangeKeys,
    };
  }

  private _parseFieldOption(d: any): FieldOption {
    let children: FieldOption[] | undefined;
    if (d.children && d.children.length > 0) {
      children = d.children.map((c: any) => this._parseFieldOption(c));
    } else if (d.options && d.options.length > 0) {
      children = d.options.map((c: any) => this._parseFieldOption(c));
    }

    return {
      value: d.value || "",
      label: d.label || "",
      children,
    };
  }

  get defaultEngine(): string {
    return this._index?.default_engine || "google";
  }

  get engineKeys(): string[] {
    return Array.from(this._schemas.keys()).sort();
  }

  engine(key: string): EngineSchema | undefined {
    return this._schemas.get(key);
  }

  engines(): Map<string, EngineSchema> {
    return new Map(this._schemas);
  }

  categories(): Record<string, string[]> {
    if (!this._index) return {};

    const result: Record<string, string[]> = {};
    for (const cat of this._index.categories) {
      result[cat.key] = this._index.engines
        .filter((e) => e.category === cat.key)
        .map((e) => e.key);
    }
    return result;
  }
}

// Helper functions to extract fields from schema

export function allFields(schema: EngineSchema): Field[] {
  const fields: Field[] = [];
  for (const group of schema.groups) {
    fields.push(...group.fields);
  }
  return fields;
}

export function fieldMap(schema: EngineSchema): Map<string, Field> {
  const map = new Map<string, Field>();
  for (const f of allFields(schema)) {
    map.set(f.key, f);
  }
  return map;
}

export function requiredFields(schema: EngineSchema): Field[] {
  return allFields(schema).filter((f) => f.required);
}

export function toParamSchema(schema: EngineSchema): Record<string, any> {
  const props: Record<string, any> = {};
  const requiredKeys: string[] = [];

  for (const f of allFields(schema)) {
    const prop: Record<string, any> = { description: f.help || f.label };

    if (f.type === "select" && f.options.length > 0) {
      const values = f.options
        .map((o) => String(o.value))
        .filter((v) => v !== "");
      if (values.length > 0) {
        prop.enum = values;
      }
      prop.type = "string";
      if (f.default_value) {
        prop.default = f.default_value;
      }
    } else if (f.type === "switch") {
      prop.type = "boolean";
      if (f.default_value !== null && f.default_value !== undefined) {
        prop.default = f.default_value;
      }
    } else if (f.type === "tags" && f.options.length > 0) {
      const values = f.options.map((o) => String(o.value));
      prop.type = "array";
      prop.items = { type: "string", enum: values };
      prop.description = `${f.help} (select one or more)`;
    } else if (f.type === "number") {
      prop.type = "number";
      if (f.default_value !== null && f.default_value !== undefined) {
        prop.default = f.default_value;
      }
    } else if (f.type === "date_range") {
      prop.type = "array";
      prop.items = { type: "string", format: "date" };
      prop.description = `${f.help} (array of [start_date, end_date])`;
    } else if (f.type === "date") {
      prop.type = "string";
      prop.format = "date";
      prop.description = `${f.help} (YYYY-MM-DD)`;
    } else {
      // text or unknown
      prop.type = "string";
      if (f.default_value) {
        prop.default = String(f.default_value);
      }
    }

    props[f.key] = prop;
    if (f.required) {
      requiredKeys.push(f.key);
    }
  }

  const schema_: Record<string, any> = {
    type: "object",
    properties: props,
  };
  if (requiredKeys.length > 0) {
    schema_.required = requiredKeys;
  }

  return schema_;
}

export function toDescription(schema: EngineSchema): string {
  const lines: string[] = [];
  lines.push(`Engine: ${schema.name} (${schema.key})`);
  lines.push(`Query field: ${schema.query_field}`);
  lines.push("");

  for (const group of schema.groups) {
    lines.push(`[${group.title}]`);
    for (const f of group.fields) {
      const req = f.required ? " (required)" : "";
      const default_ = f.default_value ? ` (default: ${f.default_value})` : "";
      let typeInfo = f.type;

      if (f.type === "select" && f.options.length > 0) {
        const vals = f.options.slice(0, 10).map((o) => String(o.value));
        const extra = f.options.length > 10 ? "..." : "";
        typeInfo = `select(${vals.join(", ")}${extra})`;
      } else if (f.type === "switch") {
        typeInfo = "boolean";
      } else if (f.type === "tags" && f.options.length > 0) {
        const vals = f.options.slice(0, 5).map((o) => String(o.value));
        const extra = f.options.length > 5 ? "..." : "";
        typeInfo = `tags(${vals.join(", ")}${extra})`;
      } else if (f.type === "number") {
        typeInfo = "number";
      } else if (f.type === "date_range") {
        typeInfo = "date_range [start, end]";
      }

      lines.push(
        `  ${f.key}: ${typeInfo}${req}${default_} — ${f.help || f.label}`
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}
