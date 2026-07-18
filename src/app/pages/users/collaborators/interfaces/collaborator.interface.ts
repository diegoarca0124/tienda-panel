export interface CollaboratorInterface {
	id?: string;
	names: string;
	surname: string;
	fullnames?: string;
	type_document: string | undefined | any;
	number_document: string;
	role?: string | undefined;
	email: string;
	password?: string;
	phone: string;
	prefix: string;
	lastDatelogin?: Date;
	status?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
	statusAt?: Date;
}
