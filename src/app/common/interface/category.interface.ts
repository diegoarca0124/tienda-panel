export interface Category {
	id?: string;
	name: string;
	slug?: string;
	icon: string;
	description: string;

	isDimensions?: boolean,
	isCharacteristics?: boolean,
	isConditiom?: boolean,
	isWarranty?: boolean,
	isCountryOfOrigin?: boolean,
	isMaterial?: boolean,
	isTemperature?: boolean,

	status?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
	statusAt?: Date;
}
