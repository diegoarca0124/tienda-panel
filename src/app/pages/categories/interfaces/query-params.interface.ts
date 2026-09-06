export interface GetCategoriesQPI {
	filter: string;
	page: number;
	limit: number;
	status: string;
	sort: string;
	configurations: string;
}

export interface GetProductsCategoryQPI {
	filter: string;
	page: number;
	limit: number;
	status: string;
	sort: string;
	subcategoryIds: string;
	quality: string;
	visibility: string;
	minPrice: number;
	maxPrice: number;
}
