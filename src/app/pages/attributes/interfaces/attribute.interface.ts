export interface AttributeInterface {
	id?: string;
	name: string;
	unit?: string;
	values?: Array<{ value: string }>;
	attributeGroupId?: string;
	attributeValues?: Array<string>;
	description?: string;
	status?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
	statusAt?: Date;
}
