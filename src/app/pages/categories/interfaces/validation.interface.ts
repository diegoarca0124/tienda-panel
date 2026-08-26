export interface CategoryFieldErrors {
	name: boolean;
	code: boolean;
	icon: boolean;
	description: boolean;
	prefix: boolean;

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
