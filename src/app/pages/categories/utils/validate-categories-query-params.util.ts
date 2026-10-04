import type { Params } from '@angular/router';
import { PAGINATION_LIMITS } from '@app/common/constants/pageLimit.constant';
import { configurationsOptions, sortOptions, statusOptions } from '../constants/selectors.constant';
import type { GetCategoriesQPI } from '../interfaces/query-params.interface';

interface CategoriesQueryParamsValidation {
	isValid: boolean;
	queryParams: GetCategoriesQPI;
}

const validStatuses = new Set(statusOptions.map(({ value }) => value));
const validSorts = new Set(sortOptions.map(({ value }) => value));
const validConfigurations = new Set(configurationsOptions.map(({ value }) => value));
const defaultSort = sortOptions[0]?.value ?? 'Predeterminado';

const parseNumber = (value: unknown): number => (typeof value === 'string' || typeof value === 'number' ? Number(value) : NaN);

const normalizeConfigurations = (value: unknown): string => {
	const values = Array.isArray(value) ? value : [value];
	const configurations = values
		.filter((item): item is string => typeof item === 'string')
		.flatMap((item) => item.split(','))
		.map((item) => item.trim())
		.filter((item) => validConfigurations.has(item));

	return [...new Set(configurations)].join(',') || 'Predeterminado';
};

/** Normaliza los filtros de categorías sin modificar la URL ni los parámetros originales. */
export const validateCategoriesQueryParams = (params: Params): CategoriesQueryParamsValidation => {
	const page = parseNumber(params['page']);
	const limit = parseNumber(params['limit']);
	const queryParams: GetCategoriesQPI = {
		filter: typeof params['filter'] === 'string' ? params['filter'] : '',
		page: Number.isInteger(page) && page >= 1 ? page : 1,
		limit: PAGINATION_LIMITS.includes(limit) ? limit : 10,
		status: validStatuses.has(params['status']) ? params['status'] : 'Todos',
		sort: validSorts.has(params['sort']) ? params['sort'] : defaultSort,
		configurations: normalizeConfigurations(params['configurations']),
	};

	const hasUnknownParams = Object.keys(params).some((key) => !Object.prototype.hasOwnProperty.call(queryParams, key));
	const hasInvalidValues =
		queryParams.filter !== (params['filter'] ?? '') ||
		queryParams.page !== page ||
		queryParams.limit !== limit ||
		queryParams.status !== params['status'] ||
		queryParams.sort !== params['sort'] ||
		queryParams.configurations !== (params['configurations'] ?? 'Predeterminado');

	return { isValid: !hasUnknownParams && !hasInvalidValues, queryParams };
};
