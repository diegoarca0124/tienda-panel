export interface CategoryInterface {
	id?: string;
	name: string;
	code?: string;
	slug?: string;
	icon: string;
	description: string;
	prefix: string;
	safeIcon?: any;

	isDimensions?: boolean,
	isCharacteristics?: boolean,
	isConditiom?: boolean,
	isWarranty?: boolean,
	isCountryOfOrigin?: boolean,
	isMaterial?: boolean,
	isTemperature?: boolean,
	totalProducts?: number,
	latestProducts?: Array<any>,
	moreProducts?: number,
	subcategories?: any,

	status?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
	statusAt?: Date;
}
