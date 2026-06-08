"use client";

import {DEFAULT_PRODUCT_SEARCH_PARAMS} from "@/constants/product.constants";
import type {TProductSearchParams} from "@/types/product.types";
import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type FC,
  type PropsWithChildren,
  type SetStateAction
} from "react";

type TProductContextValue = {
  filters: TProductSearchParams;
  setFilters: Dispatch<SetStateAction<TProductSearchParams>>;
  patchFilters: (partial: Partial<TProductSearchParams>) => void;
};

const ProductContext = createContext<TProductContextValue | null>(null);

export const ProductContextProvider: FC<PropsWithChildren> = ({children}) => {
  const [filters, setFilters] = useState<TProductSearchParams>(DEFAULT_PRODUCT_SEARCH_PARAMS);

  const patchFilters = useCallback((partial: Partial<TProductSearchParams>) => {
    setFilters((current) => ({...current, ...partial}));
  }, []);

  const value = useMemo(
    () => ({
      filters,
      setFilters,
      patchFilters
    }),
    [filters, patchFilters]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

export const useProductContext = () => {
  const context = use(ProductContext);

  if (!context) {
    throw new Error("useProductContext must be used within ProductContextProvider");
  }

  return context;
};
