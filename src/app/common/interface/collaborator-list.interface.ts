export interface CollaboratorList {
	id?: string;
	names: string;
	surname: string;
	email: string;
	phone: string;
	role: string;
	status?: boolean;
	number_document: string;
	type_document: string;
	prefix?: string;
}
