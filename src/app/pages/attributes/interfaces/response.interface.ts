import { AttributeGroupInterface } from './attribute-group.interface';
import { GetAttributesGroupsQPI } from './query-params.interface';

export interface CreateGroupAttributeRESI {
	data: string;
	message: string;
}

export interface GetAttributesGroupsRESI {
	attributeGroups: AttributeGroupInterface[];
	meta: {
		totalAttributesGroups: number;
		totalPages: number;
		currentPage: number;
		limit: number;
	};
	filters: Pick<GetAttributesGroupsQPI, 'filter' | 'status' | 'sort' | 'categories'>;
}

export interface UpdateAttributeGroupStatusRESI {
	data: Pick<AttributeGroupInterface, 'id' | 'name' | 'status'>;
	message: string;
}

export interface UpdateAttributeGroupsStatusRESI {
	data: string[];
	message: string;
}
