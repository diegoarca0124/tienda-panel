export interface GroupAttributeValidationErrors {
	name?: string[];
	description?: string[];
	categories?: string[];
}

export interface GroupAttributeFieldErrors {
	name: boolean;
	description: boolean;
	categories: boolean;
}
