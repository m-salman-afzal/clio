"use client";

import type {FC, PropsWithChildren} from "react";
import {QueryClientProvider} from "@tanstack/react-query";
import {getQueryClient} from "./get-query-client";

export const ReactQueryClientProvider: FC<PropsWithChildren> = ({children}) => {
  const queryClient = getQueryClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
