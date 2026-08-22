import { CollaboratorInterface } from '../interfaces/collaborator.interface';
import { CollaboratorFieldErrors } from '../interfaces/validation.interface';

export const createEmptyCollaborator = (): CollaboratorInterface =>
	({
		names: '',
		surname: '',
		type_document: undefined,
		number_document: '',
		role: undefined,
		email: '',
		password: '',
		phone: '',
		prefix: '',
	}) satisfies CollaboratorInterface;

export const createEmptyFieldErrors = (): CollaboratorFieldErrors => ({
	names: false,
	surname: false,
	role: false,
	email: false,
	type_document: false,
	number_document: false,
	phone: false,
	password: false,
});
