export interface AttributeGroupInterface {
	id?: string;
	name: string;
	description?: string;
	categories: any[],
	status?: boolean;
	attributeCategories?: any[];
	attributes?: number,
	createdAt?: Date;
	updatedAt?: Date;
	statusAt?: Date;
}
