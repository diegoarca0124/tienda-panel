
import { CategoryInterface, MoveProductsInterface, SubcategoryInterface } from '../interfaces/data.interface';
import { CategoryFieldErrors, SubcategoryFieldErrors } from '../interfaces/validation.interface';

export function createEmptyCategory(): CategoryInterface {
	return {
		name: '',
		slug: '',
		icon: '',
		prefix: '',
		description: '',
		isDimensions: false,
		isCharacteristics: false,
		isCondition: false,
		isWarranty: false,
		isCountryOfOrigin: false,
		isMaterial: false,
		isTemperature: false,
	};
}

export function createEmptySubcategory(): SubcategoryInterface {
	return {
		name: '',
		prefix: '',
		icon: '',
		categoryId: '',
	};
}

export function createMoveProducts(): MoveProductsInterface {
	return {
		products: [],
		categoryId: '',
		subcategoryId: '',
	};
}

export const createEmptyFieldErrorsCategory = (): CategoryFieldErrors => ({
	name: false,
	code: false,
	icon: false,
	description: false,
	prefix: false,

	isDimensions: false,
	isCharacteristics: false,
	isCondition: false,
	isWarranty: false,
	isCountryOfOrigin: false,
	isMaterial: false,
	isTemperature: false,
});

export const createEmptyFieldErrorsSubcategory = (): SubcategoryFieldErrors => ({
	name: false,
	icon: false,
	description: false,
	prefix: false,
});
