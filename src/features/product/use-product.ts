import {useGetProductsQuery} from "@/hooks/queries/use-get-product-query";
import {useProductContext} from "@/contexts/product.context";

export const useProduct = () => {
  const {filters, patchFilters} = useProductContext();
  const productsQuery = useGetProductsQuery(filters);
  const products = productsQuery.data?.data ?? [];
  const pagination = productsQuery.data?.pagination;

  return {
    filters,
    patchFilters,
    productsQuery,
    products,
    pagination
  };
};
