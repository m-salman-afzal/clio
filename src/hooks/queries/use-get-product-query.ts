import {getProducts} from "@/services/product.service";
import {DEFAULT_PRODUCT_SEARCH_PARAMS} from "@/constants/product.constants";
import type {TProductSearchParams} from "@/types/product.types";
import {useQuery} from "@tanstack/react-query";

export const computeProductsQueryKey = (params: TProductSearchParams) => ["products", params];

export const useGetProductsQuery = (params: TProductSearchParams = DEFAULT_PRODUCT_SEARCH_PARAMS) => {
  return useQuery({
    queryKey: computeProductsQueryKey(params),
    queryFn: () => getProducts(params)
  });
};
