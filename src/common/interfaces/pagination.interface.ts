interface PaginationResult<T> {
    data: T[];
    total_size: number;
    current_page_size: number;
    current_page: number;
    total_pages: number;
    perPage: number;
}
