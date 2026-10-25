import { ProductInterface } from '@app/pages/products/interfaces/product.interface';
import { BrandInterface } from './data.interface';
import { SafeHtml } from '@angular/platform-browser';
import { SubcategoryInterface } from '@app/pages/products/interfaces/subcategory.interface';
import { CategoryProductInterface } from '@app/pages/categories/interfaces/response.interface';

export interface GetBrandsRESI {
	brands: BrandInterface[];
	meta: {
		totalBrands: number;
		totalPages: number;
		currentPage: number;
		limit: number;
	};
	filters: {
		filter: string;
		status: 'Todos' | 'Activos' | 'Inactivos';
		sort: string;
		countries: string[];
	};
}

export interface CreateBrandRESI {
	data: string;
	message: string;
}

export interface GetBrandRESI {
	data: BrandInterface;
	message: string;
}

export interface UpdateBrandRESI {
	data: BrandInterface;
	message: string;
}

export interface UpdateBrandStatusRESI {
	data: BrandInterface;
	message: string;
}

export interface UpdateBrandsStatusRESI {
	data: string[];
	message: string;
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

export interface FindBrandProductsRESI {
	brand: string;
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
		categoryIds: string;
		quality: string;
		visibility: string;
		minPrice?: number;
		maxPrice?: number;
	};
}
