import { CollaboratorInterface } from "../interfaces/collaborator.interface";

export function createEmptyCollaborator(): CollaboratorInterface {
    return {
        names: '',
        surname: '',
        type_document: undefined,
        number_document: '',
        role: undefined,
        email: '',
        password: '',
        phone: '',
        prefix: ''
    };
}