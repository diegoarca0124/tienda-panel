export interface Attribute {
	id?: string;
	name: string;
	code?: string;
	unit?: string;
	categories: Array<string>;
	values: Array<{ value: string }>;
	valuesCount?: number;
	status?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
	statusAt?: Date;
}
