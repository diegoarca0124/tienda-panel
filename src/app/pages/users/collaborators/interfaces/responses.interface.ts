import { CollaboratorInterface } from "./collaborator.interface";

export interface GetCollaboratorsRESI {
	collaborators: CollaboratorInterface[];
	meta: {
		totalCollaborators: number;
		totalPages: number;
		currentPage: number;
		limit: number;
	};
	filters: {
		filter: string;
		status: 'Todos' | 'Activos' | 'Inactivos';
		sort: string;
	};
}

export interface GetCollaboratorRESI {
	data: CollaboratorInterface;
	message: string
}

export interface UpdateCollaboratorRESI {
	data: CollaboratorInterface;
	message: string
}

export interface UpdateCollaboratorStatusRESI {
	data: CollaboratorInterface;
	message: string
}

export interface UpdateCollaboratorsStatusRESI {
	data: string[];
	message: string
}