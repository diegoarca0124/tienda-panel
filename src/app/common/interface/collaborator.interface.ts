export interface Collaborator {
	id?: string;
	names: string;
	surname: string;
	type_document: string | undefined | any;
	number_document: string;
	role?: string | undefined;
	email: string;
	password?: string;
	phone: string;
	lastDatelogin?: Date;
	status?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
	statusAt?: Date;
}
