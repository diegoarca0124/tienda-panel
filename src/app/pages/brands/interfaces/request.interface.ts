export interface UpdateBrandStatusREQI {
	status: boolean;
}

export interface UpdateBrandsStatusREQI {
	ids: string[];
	status: boolean;
}

export interface FindBrandProductsREQI {
	filter: string;
	page: number;
	limit: number;
	status: string;
	sort: string;
	subcategoryIds: string;
	quality: string;
	visibility: string;
	minPrice: number | null;
	maxPrice: number | null;
}