import { SafeHtml } from '@angular/platform-browser';
import { CategoryInterface, SubcategoryInterface } from './data.interface';

export interface GetCategoriesRESI {
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
		configurations: string[];
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
	data: string;
	message: string;
}

export interface MoveSubcategoryRESI {
	message: string;
	data: {
		id: string;
		name: string;
		categoryId: string;
		affectedProducts: number;
	};
}

export interface CategoryWithSubcategoriesRESI {
	id: string;
	name: string;
	icon: string;
	safeIcon?: SafeHtml;
	prefix: string;
	color: string;
	subcategories: SubcategoryInterface[];
}

export interface GetCategoriesWithSubcategoriesRESI {
	data: CategoryWithSubcategoriesRESI[];
	message: string;
}
