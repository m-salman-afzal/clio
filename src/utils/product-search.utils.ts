import type {TProductAvailability, TProductParsed, TProductSearchParams} from "@/types/product.types";

const matchesQuery = (product: TProductParsed, query: string) => {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) {
    return true;
  }

  const searchableFields = [product.TITLE, product.DESCRIPTION, product.VENDOR];

  return searchableFields.some((field) => field?.toLowerCase().includes(normalizedQuery));
};

const matchesVendor = (product: TProductParsed, vendor: string) => {
  const normalizedVendor = vendor.toLowerCase().trim();
  if (!normalizedVendor) {
    return true;
  }

  return product.VENDOR.toLowerCase().includes(normalizedVendor);
};

const matchesPriceRange = (product: TProductParsed, minPrice?: number | null, maxPrice?: number | null) => {
  const price = product.PRICE_RANGE.min_variant_price.amount;

  if (minPrice != null && price < minPrice) {
    return false;
  }

  if (maxPrice != null && price > maxPrice) {
    return false;
  }

  return true;
};

const matchesAvailability = (product: TProductParsed, availability: TProductAvailability) => {
  switch (availability) {
    case "in_stock":
      return !product.HAS_OUT_OF_STOCK_VARIANTS;
    case "out_of_stock":
      return product.HAS_OUT_OF_STOCK_VARIANTS;
    default:
      return true;
  }
};

export const filterProducts = (products: TProductParsed[], params: TProductSearchParams) => {
  return products.filter((product) => {
    if (!matchesQuery(product, params.q ?? "")) {
      return false;
    }

    if (!matchesVendor(product, params.vendor ?? "")) {
      return false;
    }

    if (!matchesPriceRange(product, params.minPrice, params.maxPrice)) {
      return false;
    }

    if (!matchesAvailability(product, params.availability ?? "all")) {
      return false;
    }

    return true;
  });
};
