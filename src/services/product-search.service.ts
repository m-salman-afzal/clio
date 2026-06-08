import "server-only";

import {getAllProducts} from "@/services/product.repository";
import type {TProductParsed, TProductSearchParams} from "@/types/product.types";
import type {TPaginatedHttpResponse} from "@/types/http.types";
import {filterProducts} from "@/utils/product-search.utils";
import {PaginationData, PaginationOptions} from "@/utils/pagination.utils";

const MAX_PAGE_SIZE = 100;

export class ProductSearchValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProductSearchValidationError";
  }
}

const validateSearchParams = (params: TProductSearchParams) => {
  if (params.pageNumber < 1) {
    throw new ProductSearchValidationError("pageNumber must be at least 1");
  }

  if (params.pageSize < 1 || params.pageSize > MAX_PAGE_SIZE) {
    throw new ProductSearchValidationError(`pageSize must be between 1 and ${MAX_PAGE_SIZE}`);
  }

  if (params.minPrice != null && params.maxPrice != null && params.minPrice > params.maxPrice) {
    throw new ProductSearchValidationError("minPrice cannot be greater than maxPrice");
  }
};

export const searchProducts = async (
  params: TProductSearchParams
): Promise<TPaginatedHttpResponse<TProductParsed[]>> => {
  validateSearchParams(params);

  const paginationOptions = PaginationOptions.create(params.pageNumber, params.pageSize);
  const allProducts = await getAllProducts();
  const filteredProducts = filterProducts(allProducts, params);
  const paginatedProducts = filteredProducts.slice(
    paginationOptions.offset,
    paginationOptions.offset + paginationOptions.pageSize
  );

  return {
    ...PaginationData.getPaginatedData(paginationOptions, filteredProducts.length, paginatedProducts),
    status: 200,
    message: "Success"
  };
};
