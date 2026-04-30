export interface AttributeList {
	id?: string;
	name: string;
	code?: string;
	unit?: string;
	categories: Array<string>;
	values: Array<{ value: string }>;
	status?: boolean;
	valuesCount?: number;
	createdAt?: Date;
	updatedAt?: Date;
	statusAt?: Date;
}
