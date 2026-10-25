import { AttributeGroupInterface } from '../interfaces/attribute-group.interface';
import { AttributeInterface } from '../interfaces/attribute.interface';
import { GroupAttributeFieldErrors } from '../interfaces/validation.interface';

export const createEmptyFieldErrorsGroupAttribute = (): GroupAttributeFieldErrors => ({
	name: false,
	description: false,
	categories: false,
});

export function createEmptyGroupAttribute(): AttributeGroupInterface {
	return {
		name: '',
		description: '',
		categories: [],
	};
}

export function createEmptyAttribute(): AttributeInterface {
	return {
		name: '',
		unit: '',
		values: [],
	};
}
