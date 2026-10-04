import type { Params } from '@angular/router';
import { PAGINATION_LIMITS } from '@app/common/constants/pageLimit.constant';
import { sortOptions, statusOptions } from '../constants/selectors.constants';
import type { GetCollaboratorsQPI } from '../interfaces/query-params.interface';

interface CollaboratorsQueryParamsValidation {
	isValid: boolean;
	queryParams: GetCollaboratorsQPI;
}

const validStatuses = new Set(statusOptions.map(({ value }) => value));
const validSorts = new Set(sortOptions.map(({ value }) => value));
const defaultSort = sortOptions[0]?.value ?? 'Predeterminado';

const parseNumber = (value: unknown): number => (typeof value === 'string' || typeof value === 'number' ? Number(value) : NaN);

/** Normaliza los filtros de colaboradores sin modificar la URL ni los parámetros originales. */
export const validateCollaboratorsQueryParams = (params: Params): CollaboratorsQueryParamsValidation => {
	const page = parseNumber(params['page']);
	const limit = parseNumber(params['limit']);
	const queryParams: GetCollaboratorsQPI = {
		filter: typeof params['filter'] === 'string' ? params['filter'] : '',
		page: Number.isInteger(page) && page >= 1 ? page : 1,
		limit: PAGINATION_LIMITS.includes(limit) ? limit : 10,
		status: validStatuses.has(params['status']) ? params['status'] : 'Todos',
		sort: validSorts.has(params['sort']) ? params['sort'] : defaultSort,
	};

	const hasUnknownParams = Object.keys(params).some((key) => !Object.prototype.hasOwnProperty.call(queryParams, key));
	const hasInvalidValues =
		queryParams.filter !== (params['filter'] ?? '') ||
		queryParams.page !== page ||
		queryParams.limit !== limit ||
		queryParams.status !== params['status'] ||
		queryParams.sort !== params['sort'];

	return { isValid: !hasUnknownParams && !hasInvalidValues, queryParams };
};
