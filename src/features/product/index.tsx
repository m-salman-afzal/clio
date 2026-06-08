"use client";

import {type FC} from "react";
import {ProductSearch} from "./product-search";
import {ProductTable} from "./product-table";
import {ProductContextProvider} from "@/contexts/product.context";

export const Product: FC = () => {
  return (
    <ProductContextProvider>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4">
        <ProductSearch />

        <div className="overflow-hidden rounded-md border">
          <ProductTable />
        </div>
      </div>
    </ProductContextProvider>
  );
};
