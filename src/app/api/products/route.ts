import {ProductSearchValidationError, searchProducts} from "@/services/product-search.service";
import type {NextRequest} from "next/server";
import type {TProductAvailability, TProductSearchParams} from "@/types/product.types";

const parseOptionalNumber = (value: string | null) => {
  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseSearchParams = (request: NextRequest): TProductSearchParams => {
  const {searchParams} = request.nextUrl;

  return {
    pageNumber: Number(searchParams.get("pageNumber") ?? 1),
    pageSize: Number(searchParams.get("pageSize") ?? 10),
    q: searchParams.get("q") ?? "",
    vendor: searchParams.get("vendor") ?? "",
    minPrice: parseOptionalNumber(searchParams.get("minPrice")),
    maxPrice: parseOptionalNumber(searchParams.get("maxPrice")),
    availability: (searchParams.get("availability") as TProductAvailability | null) ?? "all"
  };
};

export const GET = async (request: NextRequest) => {
  try {
    const params = parseSearchParams(request);
    const result = await searchProducts(params);

    return Response.json(result);
  } catch (error) {
    if (error instanceof ProductSearchValidationError) {
      return Response.json({status: 400, message: error.message, data: []}, {status: 400});
    }

    console.error("Error reading CSV file:", error);
    return Response.json({status: 500, message: "Error reading CSV file", data: []}, {status: 500});
  }
};
