import { countries } from '@app/common/constants/countries.constant';
import { PAGINATION_LIMITS } from '@app/common/constants/pageLimit.constant';
import { sortOptions, statusOptions } from '../constants/selectors.constant';
import type { GetBrandsQPI } from '../interfaces/query-params.interface';

export interface BrandsQueryParamsValidation {
	isValid: boolean;
	queryParams: GetBrandsQPI;
}

const validStatuses = new Set(statusOptions.map(({ value }) => value));
const validSorts = new Set(sortOptions.map(({ value }) => value));
const validCountryCodes = new Set(countries.map(({ code }) => code));
const defaultSort = sortOptions[0]?.value ?? 'Predeterminado';

const parseNumber = (value: unknown): number => (typeof value === 'string' || typeof value === 'number' ? Number(value) : NaN);

const normalizeCountries = (value: unknown): string => {
	if (value === undefined || value === null || value === 'Todos') {
		return 'Todos';
	}

	const values = Array.isArray(value) ? value : [value];
	const textValues = values.filter((item): item is string => typeof item === 'string');
	const codes = textValues.flatMap((item) => item.split(','));
	const normalizedCodes = codes.map((code) => code.trim().toUpperCase());
	const validCodes = normalizedCodes.filter((code) => validCountryCodes.has(code));
	const uniqueCodes = [...new Set(validCodes)];

	return uniqueCodes.join(',') || 'Todos';
};

/** Normaliza los filtros de marcas sin modificar la URL ni los parámetros originales. */
export const validateBrandsQueryParams = (params: Readonly<Record<string, unknown>>): BrandsQueryParamsValidation => {
	// Leer los valores originales antes de validarlos.
	const filter = params['filter'];
	const page = parseNumber(params['page']);
	const limit = parseNumber(params['limit']);
	const status = params['status'];
	const sort = params['sort'];
	const countries = params['countries'];

	// Aplicar las opciones permitidas y los valores predeterminados.
	const queryParams: GetBrandsQPI = {
		filter: typeof filter === 'string' ? filter : '',
		page: Number.isInteger(page) && page >= 1 ? page : 1,
		limit: PAGINATION_LIMITS.includes(limit) ? limit : 10,
		status: typeof status === 'string' && validStatuses.has(status) ? status : 'Todos',
		sort: typeof sort === 'string' && validSorts.has(sort) ? sort : defaultSort,
		countries: normalizeCountries(countries),
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
		queryParams.countries !== (countries ?? 'Todos');

	return { isValid: !hasUnknownParams && !hasInvalidValues, queryParams };
};
