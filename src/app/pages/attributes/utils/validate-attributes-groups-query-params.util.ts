import { PAGINATION_LIMITS } from '@app/common/constants/pageLimit.constant';
import { sortOptions, statusOptions } from '../constants/selectors.constant';
import type { GetAttributesGroupsQPI } from '../interfaces/query-params.interface';

export interface AttributesGroupsQueryParamsValidation {
	isValid: boolean;
	queryParams: GetAttributesGroupsQPI;
}

const validStatuses = new Set(statusOptions.map(({ value }) => value));
const validSorts = new Set(sortOptions.map(({ value }) => value));
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const defaultSort = sortOptions[0]?.value ?? 'Predeterminado';

const parseNumber = (value: unknown): number => (typeof value === 'string' || typeof value === 'number' ? Number(value) : NaN);

const normalizeCategories = (value: unknown): string => {
	if (value === undefined || value === null || value === 'Todos') {
		return 'Todos';
	}

	const values = Array.isArray(value) ? value : [value];
	const textValues = values.filter((item): item is string => typeof item === 'string');
	const ids = textValues.flatMap((item) => item.split(','));
	const normalizedIds = ids.map((id) => id.trim().toLowerCase());
	const validIds = normalizedIds.filter((id) => uuidPattern.test(id));
	const uniqueIds = [...new Set(validIds)];

	return uniqueIds.join(',') || 'Todos';
};

/** Normaliza los filtros de grupos de atributos sin modificar la URL ni los parámetros originales. */
export const validateAttributesGroupsQueryParams = (params: Readonly<Record<string, unknown>>): AttributesGroupsQueryParamsValidation => {
	// Leer los valores originales antes de validarlos.
	const filter = params['filter'];
	const page = parseNumber(params['page']);
	const limit = parseNumber(params['limit']);
	const status = params['status'];
	const sort = params['sort'];
	const categories = params['categories'];

	// Aplicar las opciones permitidas y los valores predeterminados.
	const queryParams: GetAttributesGroupsQPI = {
		filter: typeof filter === 'string' ? filter : '',
		page: Number.isInteger(page) && page >= 1 ? page : 1,
		limit: PAGINATION_LIMITS.includes(limit) ? limit : 10,
		status: typeof status === 'string' && validStatuses.has(status) ? status : 'Todos',
		sort: typeof sort === 'string' && validSorts.has(sort) ? sort : defaultSort,
		categories: normalizeCategories(categories),
	};

	// Indicar al componente si debe corregir los parámetros de la URL.
	const allowedKeys = Object.keys(queryParams);
	const hasUnknownParams = Object.keys(params).some((key) => !allowedKeys.includes(key));
	const hasInvalidValues =
		queryParams.filter !== (filter ?? '') ||
		queryParams.page !== page ||
		queryParams.limit !== limit ||
		queryParams.status !== status ||
		queryParams.sort !== sort ||
		queryParams.categories !== (categories ?? 'Todos');

	return { isValid: !hasUnknownParams && !hasInvalidValues, queryParams };
};
