import { CategoryInterface } from "./data.interface";


export interface GetCategoriessRESI {
	categories: CategoryInterface[];
	meta: {
		totalCategories: number;
		totalPages: number;
		currentPage: number;
		limit: number;
	};
	filters: {
		filter: string;
		status: 'Todos' | 'Activos' | 'Inactivos';
		sort: string;
	};
}

export interface UpdateCategoryStatusRESI {
	data: CategoryInterface;
	message: string;
}

export interface UpdateCategoriesStatusRESI {
	data: string[];
	message: string;
}

export interface CreateCategoryRESI {
	data: CategoryInterface;
	message: string;
}
