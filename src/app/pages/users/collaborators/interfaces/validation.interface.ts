export interface CollaboratorValidationErrors {
	names?: string[];
	surname?: string[];
	role?: string[];
	email?: string[];
	type_document?: string[];
	number_document?: string[];
	phone?: string[];
	password?: string[];
	prefix?: string[];
}

export interface CollaboratorFieldErrors {
	names: boolean;
	surname: boolean;
	role: boolean;
	email: boolean;
	type_document: boolean;
	number_document: boolean;
	phone: boolean;
	password: boolean;
}

export interface FieldExportColumns {
	key: string;
	checked: boolean;
	label: string;
	description: string;
}

export interface ImportInterface {
	file: File | undefined;
	mode: 'upsert' | 'insert' | 'update';
	identifyBy: 'email' | 'number_document';
}
