export interface GetBrandsQPI {
	filter: string;
	page: number;
	limit: number;
	status: string;
	sort: string;
	countries: string;
}

export interface GetProductsBrandQPI {
	filter: string;
	page: number;
	limit: number;
	status: string;
	sort: string;
	subcategoryIds: string;
	categoryIds: string;
	quality: string;
	visibility: string;
	minPrice?: number;
	maxPrice?: number;
}
