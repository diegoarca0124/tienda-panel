import { SafeHtml } from '@angular/platform-browser';
import { CategoryInterface, SubcategoryInterface } from './data.interface';
import { BrandInterface } from '@app/pages/brands/interfaces/data.interface';

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
	data: {
		id: string;
		name: string;
		categoryId: string;
		status: boolean;
		affectedProducts: number;
	};
}

export interface GetSubcategoriesByCategorySelectRESI {
	message: string;
	data: SubcategorySelectInterface[];
}

export interface SubcategorySelectInterface {
	id: string;
	name: string;
	icon: string | null;
	status: boolean;
	prefix: string;
	code: string;
	totalProducts: number;
}

export interface BrandSelectInterface {
	id: string;
	name: string;
	status: boolean;
	logoUrl: string | null;
}

export interface GetBrandsByCategoryRESI {
	message: string;
	data: BrandInterface[];
}

export interface MappingSubcategoryInterface {
	id: string;
	name: string;
	categoryId: string;
	status: boolean;
	prefix?: string;
	code?: string;
}

export interface CategoryWithSubcategoriesRESI {
	id: string;
	name: string;
	status: boolean;
	icon: string | null;
	safeIcon?: SafeHtml;
	code?: string;
	color: string;
	subcategories: MappingSubcategoryInterface[];
}

export interface GetCategoriesWithSubcategoriesRESI {
	data: CategoryWithSubcategoriesRESI[];
	message: string;
}

export interface FindCategoryProductsRESI {
	category: string;
	products: CategoryProductInterface[];
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
		subcategoryIds: string;
		brandIds: string;
		quality: string;
		visibility: string;
		minPrice?: number;
		maxPrice?: number;
	};
}

export interface CategoryProductInterface {
	id: string;
	name: string;
	cover: string;
	status: 'draft' | 'published';
	visibility: 'public' | 'private';
	createdAt: string;
	// PostgreSQL decimal columns are returned as strings by the driver.
	priceRegular: number | string;
	priceDiscount: number | string | null;
	quality: number;
	quality_label: string;
	stockQuantity: number | null;
	category: { id: string; name: string };
	subcategory: { id: string; name: string; prefix: string; code: string };
	brand: { id: string; name: string; logoUrl: string };
}

export interface MoveProductsToSubcategoryRESI {
	data: number;
	message: string;
}
