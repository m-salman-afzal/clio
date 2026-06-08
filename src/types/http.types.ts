import type {PaginationData} from "@/utils/pagination.utils";

export type THttpResponse<T> = {
  data: T;
  status: number;
  message: string;
};

export type TPaginatedHttpResponse<T> = THttpResponse<T> & PaginationData<T>;
