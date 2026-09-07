import { SafeHtml } from '@angular/platform-browser';
import { CategoryInterface, SubcategoryInterface } from './data.interface';
import { ProductInterface } from '@app/pages/products/interfaces/product.interface';

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

export interface UpdateSubcategoryStatusRESI {
	data: SubcategoryInterface;
	message: string;
}

export interface UpdateSubcategoriesStatusRESI {
	data: string[];
	message: string;
}

export interface GetCategoryRESI {
	data: CategoryInterface;
	message: string;
}

export interface GetSubcategoriesRESI {
	data: SubcategoryInterface[];
	message: string;
}

export interface CreateSubcategoryRESI {
	data: SubcategoryInterface;
	message: string;
}

export interface UpdateCategoryRESI {
	data: CategoryInterface;
	message: string;
}

export interface UpdateSubcategoryRESI {
	data: SubcategoryInterface;
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
	data: number;
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

export interface MoveProductsToSubcategoryRERSI {
	data: number;
	message: string;
}

export interface FindCategoryProductsRESI {
	products: ProductInterface[];
	meta: {
		totalProducts: number;
		totalPages: number;
		currentPage: number;
		limit: number;
	};
	filters: {
		filter: string;
		status: 'Todos' | 'published' | 'draft';
		sort: string;
		subcategoryIds: string[];
		quality: string;
		visibility: string;
		minPrice: string;
		maxPrice: string;
	};
}
