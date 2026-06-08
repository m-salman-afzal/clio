import "server-only";

import {parse} from "csv-parse/sync";
import fs from "node:fs/promises";
import path from "node:path";
import type {TProductColumn, TProductParsed} from "@/types/product.types";
import type {InfoField, Options} from "csv-parse";

const CSV_PARSE_BASE_OPTIONS = {
  cast_date: true,
  columns: true,
  skip_empty_lines: true,
  skip_records_with_empty_values: true
} satisfies Options;

const castProductValue = (value: string, context: InfoField) => {
  try {
    switch (context.column as TProductColumn) {
      case "_AIRBYTE_META":
      case "FEATURED_IMAGE":
      case "FEATURED_MEDIA":
      case "IMAGES":
      case "METAFIELDS":
      case "OPTIONS":
      case "PRICE_RANGE":
      case "PRICE_RANGE_V2":
      case "SEO":
      case "VARIANTS":
        return JSON.parse(value);

      case "HAS_ONLY_DEFAULT_VARIANT":
      case "HAS_OUT_OF_STOCK_VARIANTS":
      case "IS_GIFT_CARD":
        return value === "true";

      case "MEDIA_COUNT":
      case "TOTAL_VARIANTS":
      case "TOTAL_INVENTORY":
        return Number(value);

      default:
        return value;
    }
  } catch {
    return value;
  }
};

let cachedProducts: TProductParsed[] | undefined;

export const getAllProducts = async (): Promise<TProductParsed[]> => {
  if (cachedProducts) {
    return cachedProducts;
  }

  const csvPath = path.join(process.cwd(), "src/services/csv.csv");
  const csv = await fs.readFile(csvPath, "utf-8");
  cachedProducts = parse<TProductParsed>(csv, {
    ...CSV_PARSE_BASE_OPTIONS,
    cast: castProductValue
  });

  return cachedProducts;
};
