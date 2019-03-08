export interface IPaginationOptions {
    pageSizeOptions: Array<number>;
    pageSize: number;
}

export const paginationOptions: IPaginationOptions = {
    pageSizeOptions: [10, 25, 50, 100],
    pageSize: 10
};
