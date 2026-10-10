import type { SafeHtml } from '@angular/platform-browser';

export interface CategoryProductPreviewInterface {
	id: string;
	name: string;
	code: string;
	cover: string;
	categoryId: string;
}

export interface CategoryInterface {
	id?: string;
	name: string;
	code?: string;
	slug?: string;
	icon?: string;
	description?: string;
	prefix: string;
	safeIcon?: SafeHtml;
	color?: string;

	isDimensions?: boolean;
	isCharacteristics?: boolean;
	isCondition?: boolean;
	isWarranty?: boolean;
	isCountryOfOrigin?: boolean;
	isMaterial?: boolean;
	isTemperature?: boolean;
	totalProducts?: number;
	latestProducts?: CategoryProductPreviewInterface[];
	moreProducts?: number;
	subcategories?: SubcategoryInterface[];

	status?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
	statusAt?: Date;
}

export interface SubcategoryInterface {
	id?: string;
	name: string;
	code?: string;
	prefix: string;
	slug?: string;
	icon: string;
	categoryId: string;
	safeIcon?: SafeHtml;
	status?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
	statusAt?: Date;
}

export interface MoveProductsInterface {
	products: string[];
	categoryId: string;
	subcategoryId: string;
}
