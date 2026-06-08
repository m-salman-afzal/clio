"use client";

import {type FC, useState} from "react";
import {useDebouncedCallback} from "use-debounce";
import {SearchIcon} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import {Field, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import type {TProductAvailability} from "@/types/product.types";
import {useProductContext} from "@/contexts/product.context";
import {Button} from "@/components/ui/button.ui";
import {DEFAULT_PRODUCT_SEARCH_PARAMS} from "@/constants/product.constants";

const SEARCH_DEBOUNCE_MS = 300;

const AVAILABILITY_OPTIONS: {label: string; value: TProductAvailability}[] = [
  {label: "All products", value: "all"},
  {label: "In stock", value: "in_stock"},
  {label: "Out of stock", value: "out_of_stock"}
];

export const ProductSearch: FC = () => {
  const {filters, patchFilters} = useProductContext();
  const [searchQuery, setSearchQuery] = useState(filters.q);
  const debouncedPatchQ = useDebouncedCallback((q: string) => {
    patchFilters({q, pageNumber: 1});
  }, SEARCH_DEBOUNCE_MS);

  const handleReset = () => {
    debouncedPatchQ.cancel();
    setSearchQuery("");
    patchFilters({...DEFAULT_PRODUCT_SEARCH_PARAMS});
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="product-search">Search products</FieldLabel>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              id="product-search"
              type="search"
              value={searchQuery}
              onChange={(event) => {
                const q = event.target.value;
                setSearchQuery(q);
                debouncedPatchQ(q);
              }}
              placeholder="Search by title, description, or vendor..."
            />
          </InputGroup>
        </Field>

        <FieldGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field>
            <FieldLabel htmlFor="vendor-filter">Vendor</FieldLabel>
            <Input
              id="vendor-filter"
              type="text"
              value={filters.vendor}
              onChange={(event) =>
                patchFilters({
                  vendor: event.target.value,
                  pageNumber: 1
                })
              }
              placeholder="Filter by vendor"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="min-price-filter">Min price</FieldLabel>
            <Input
              id="min-price-filter"
              type="number"
              min={0}
              step="0.01"
              value={filters.minPrice ?? ""}
              onChange={(event) =>
                patchFilters({
                  minPrice: event.target.value ? Number(event.target.value) : null,
                  pageNumber: 1
                })
              }
              placeholder="0.00"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="max-price-filter">Max price</FieldLabel>
            <Input
              id="max-price-filter"
              type="number"
              min={0}
              step="0.01"
              value={filters.maxPrice ?? ""}
              onChange={(event) =>
                patchFilters({
                  maxPrice: event.target.value ? Number(event.target.value) : null,
                  pageNumber: 1
                })
              }
              placeholder="999.99"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="availability-filter">Availability</FieldLabel>
            <Select
              value={filters.availability}
              onValueChange={(value) =>
                patchFilters({
                  availability: value as TProductAvailability,
                  pageNumber: 1
                })
              }>
              <SelectTrigger id="availability-filter" className="w-full">
                <SelectValue>
                  {AVAILABILITY_OPTIONS.find((option) => option.value === filters.availability)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
        <Button size="sm" className="w-fit" onClick={handleReset}>
          Reset
        </Button>
      </CardContent>
    </Card>
  );
};
