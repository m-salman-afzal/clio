export class PaginationOptions {
  pageIndex: number;
  pageSize: number;
  offset: number;

  constructor(pageIndex = 1, pageSize = 10) {
    this.pageIndex = Number(pageIndex);
    this.pageSize = Number(pageSize);
    this.offset = (this.pageIndex - 1) * this.pageSize;
  }

  static create(pageIndex: number, pageSize: number) {
    return new PaginationOptions(pageIndex, pageSize);
  }
}

export class PaginationData<T> {
  data: T;
  pagination: {rowCount: number; pageCount: number; pageIndex: number};

  constructor(paginationOptions: PaginationOptions, rowCount: number, data: T) {
    this.data = data;
    this.pagination = {
      rowCount: rowCount,
      pageCount: Math.ceil(rowCount / paginationOptions.pageSize),
      pageIndex: paginationOptions.pageIndex
    };
  }

  static getPaginatedData<T>(paginationOptions: PaginationOptions, rowCount: number, data: T) {
    return new PaginationData(paginationOptions, rowCount, data);
  }
}
