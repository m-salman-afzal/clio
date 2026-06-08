import {TableBody, TableRow, TableCell} from "@/components/ui/table.ui";
import {PRODUCT_COLUMNS} from "@/constants/product.constants";
import type {TProductParsed, TProductSearchParams} from "@/types/product.types";
import type {UseQueryResult} from "@tanstack/react-query";
import type {TPaginatedHttpResponse} from "@/types/http.types";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";
import {PackageSearchIcon} from "lucide-react";
import {ProductErrorAlert} from "./product-error-alert";
import {TableSkeleton} from "@/components/common/table-skeleton";

interface Props {
  filters: TProductSearchParams;
  productsQuery: UseQueryResult<TPaginatedHttpResponse<TProductParsed[]>>;
  products: TProductParsed[];
}

export const ProductTableBody = ({filters, productsQuery, products}: Props) => {
  const {isError, error, refetch, isPending} = productsQuery;

  const hasActiveFilters =
    Boolean(filters.q) ||
    Boolean(filters.vendor) ||
    filters.minPrice != null ||
    filters.maxPrice != null ||
    filters.availability !== "all";

  if (isPending) {
    return <TableSkeleton columns={PRODUCT_COLUMNS} />;
  }

  if (isError) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={PRODUCT_COLUMNS.length} className="p-4">
            <ProductErrorAlert
              message={error.message || "Something went wrong while loading products."}
              onRetry={() => refetch()}
            />
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {products.length ? (
        products.map((product) => (
          <TableRow key={product.ID}>
            {PRODUCT_COLUMNS.map((column) => (
              <TableCell key={column}>{String(product[column] ?? "")}</TableCell>
            ))}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={PRODUCT_COLUMNS.length} className="h-48 p-0">
            <Empty className="border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <PackageSearchIcon />
                </EmptyMedia>
                <EmptyTitle>
                  {hasActiveFilters ? "No products match your search or filters" : "No products found"}
                </EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters
                    ? "Try adjusting your search terms or filters to see more results."
                    : "There are no products to display right now."}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent />
            </Empty>
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
};
