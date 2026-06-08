import type {TPaginatedHttpResponse} from "@/types/http.types";
import type {TProductParsed, TProductSearchParams} from "@/types/product.types";

const buildSearchParams = (params: TProductSearchParams) => {
  const query = new URLSearchParams();
  query.set("pageNumber", String(params.pageNumber));
  query.set("pageSize", String(params.pageSize));

  if (params.q) {
    query.set("q", params.q);
  }

  if (params.vendor) {
    query.set("vendor", params.vendor);
  }

  if (params.minPrice != null) {
    query.set("minPrice", String(params.minPrice));
  }

  if (params.maxPrice != null) {
    query.set("maxPrice", String(params.maxPrice));
  }

  if (params.availability !== "all") {
    query.set("availability", params.availability);
  }

  return query.toString();
};

export const getProducts = async (params: TProductSearchParams) => {
  const response = await fetch(`http://localhost:3000/api/products?${buildSearchParams(params)}`);

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {message?: string} | null;
    throw new Error(errorBody?.message ?? "Failed to fetch products");
  }

  return (await response.json()) as TPaginatedHttpResponse<TProductParsed[]>;
};
