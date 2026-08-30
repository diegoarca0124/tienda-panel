export interface CategoryValidationErrors {
	name?: string[];
	code?: string[];
	icon?: string[];
	description?: string[];
	prefix?: string[];
	color?: string[];

	isDimensions?: string[];
	isCharacteristics?: string[];
	isCondition?: string[];
	isWarranty?: string[];
	isCountryOfOrigin?: string[];
	isMaterial?: string[];
	isTemperature?: string[];
}

export interface SubcategoryValidationErrors {
	name?: string[];
	icon?: string[];
	description?: string[];
	prefix?: string[];
}

export interface CategoryFieldErrors {
	name: boolean;
	code: boolean;
	icon: boolean;
	description: boolean;
	prefix: boolean;
	color: boolean;

	isDimensions: boolean;
	isCharacteristics: boolean;
	isCondition: boolean;
	isWarranty: boolean;
	isCountryOfOrigin: boolean;
	isMaterial: boolean;
	isTemperature: boolean;
}

export interface SubcategoryFieldErrors {
	name: boolean;
	icon: boolean;
	description: boolean;
	prefix: boolean;
}
