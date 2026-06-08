"use client";

import {type FC} from "react";
import {TableHeader, TableRow, TableHead, Table} from "@/components/ui/table.ui";
import {PRODUCT_COLUMNS} from "@/constants/product.constants";
import {ProductTableBody} from "./product-table-body";
import {Pagination} from "@/components/common/pagination";
import {useProduct} from "./use-product";

export const ProductTable: FC = () => {
  const {filters, patchFilters, productsQuery, products, pagination} = useProduct();

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {PRODUCT_COLUMNS.map((column) => (
              <TableHead key={column}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <ProductTableBody filters={filters} productsQuery={productsQuery} products={products} />
      </Table>
      {!productsQuery.isPending && (
        <Pagination
          pageNumber={filters.pageNumber}
          pageSize={filters.pageSize}
          pageCount={pagination?.pageCount ?? 0}
          rowsOnPage={products.length}
          onPageNumberChange={(pageNumber) => patchFilters({pageNumber})}
          onPageSizeChange={(pageSize) => patchFilters({pageSize, pageNumber: 1})}
        />
      )}
    </>
  );
};
