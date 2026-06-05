/**
 * Parameter serialization — mirrors internal/serp/serialize.go.
 *
 * Transforms user-facing parameter values into the format expected by
 * the upstream Talor SERP API.
 */

import { EngineSchema, allFields } from "./schema";

const FLIGHT_CODE_RE = /^[A-Za-z]{3}$/;

export function serialize(
  schema: EngineSchema,
  values: Record<string, any>
): Record<string, any> {
  if (!schema || !values) return {};

  const out = { ...values };

  for (const group of schema.groups) {
    for (const field of group.fields) {
      if (!(field.key in values)) continue;

      const value = values[field.key];

      if (field.type === "date_range" && field.range_keys) {
        const [start, end] = splitDateRange(value);
        out[field.range_keys.start] = start;
        out[field.range_keys.end] = end;
        delete out[field.key];
      } else if (field.type === "tags") {
        if (field.key === "cr") {
          out[field.key] = serializeCountryRestrict(value);
        } else {
          out[field.key] = joinList(value, ",");
        }
      } else if (field.type === "switch") {
        out[field.key] = boolString(value);
      } else if (field.type === "date") {
        out[field.key] = stringify(value);
      } else if (field.type === "number") {
        if (isEmpty(value)) {
          out[field.key] = "";
        } else {
          out[field.key] = stringify(value);
        }
      }
    }
  }

  normalizeEngineParams(schema, out);
  return out;
}

export function compactResponseData(data: any): any {
  if (!data || typeof data !== "object") return data;

  const out = { ...data };
  const keysToRemove = [
    "search_metadata",
    "search_parameters",
    "search_information",
    "pagination",
    "serpapi_pagination",
  ];

  for (const key of keysToRemove) {
    delete out[key];
  }

  return out;
}

// Internal helpers

function splitDateRange(value: any): [string, string] {
  const items = splitList(value);
  if (!items.length) return ["", ""];
  if (items.length === 1) return [items[0].trim(), ""];
  return [items[0].trim(), items[1].trim()];
}

function joinList(value: any, sep: string): string {
  const items = splitList(value);
  return items
    .map((item) => item.trim())
    .filter((item) => item)
    .join(sep);
}

function serializeCountryRestrict(value: any): string {
  const items = splitList(value);
  const out: string[] = [];

  for (let item of items) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    if (!trimmed.toLowerCase().startsWith("country")) {
      item = "country" + trimmed.toUpperCase();
    }
    out.push(item);
  }

  return out.join("|");
}

function boolString(value: any): string {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) {
      return "true";
    }
    return "false";
  }
  if (typeof value === "number") {
    return value !== 0 ? "true" : "false";
  }
  return "false";
}

function stringify(value: any): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

function splitList(value: any): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  if (typeof value === "string") {
    if (!value) return [];
    return value.split(",");
  }
  if (value === null || value === undefined) return [];
  return [String(value)];
}

function normalizeEngineParams(
  schema: EngineSchema,
  out: Record<string, any>
): void {
  if (schema.key !== "google_flights") return;

  for (const key of ["departure_id", "arrival_id"]) {
    if (key in out) {
      out[key] = normalizeFlightIds(out[key]);
    }
  }
}

function normalizeFlightIds(value: any): string {
  const items = splitList(value);
  for (let i = 0; i < items.length; i++) {
    const trimmed = items[i].trim();
    if (FLIGHT_CODE_RE.test(trimmed) && !trimmed.startsWith("/")) {
      items[i] = trimmed.toUpperCase();
    } else {
      items[i] = trimmed;
    }
  }
  return items.join(",");
}
