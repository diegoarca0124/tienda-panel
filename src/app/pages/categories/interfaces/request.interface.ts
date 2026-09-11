export interface UpdateCategoryStatusREQI {
	status: boolean;
}

export interface UpdateCategoriesStatusREQI {
	ids: string[];
	status: boolean;
}

export interface UpdateSubcategoryStatusREQI {
	status: boolean;
}

export interface UpdateSubcategoriesStatusREQI {
	ids: string[];
	status: boolean;
}

export interface FindCategoryProductsREQI {
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

export interface MoveSubcategoryREQI {
	categoryId: string;
}
