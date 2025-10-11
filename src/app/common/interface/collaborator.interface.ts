export interface Collaborator {
	id?: string;
	names: string;
	surname: string;
	type_document: string;
	number_document: string;
	role: string;
	email: string;
	password?: string;
	phone: string;
	lastDatelogin?: Date;
	status?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
	statusAt?: Date;
}
