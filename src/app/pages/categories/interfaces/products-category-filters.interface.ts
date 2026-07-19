interface ProductCategoryFiltersInterface {
  searchTerm: string;
  status: string;
  quality: string;
  visibility: string;
  minPrice: number | null;
  maxPrice: number | null;
  sort: string;
  subcategoryIds: string;
  page: number;
  pageSize: number;
}