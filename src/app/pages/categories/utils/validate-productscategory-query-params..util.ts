import type { Params } from '@angular/router';
import { PAGINATION_LIMITS } from '@app/common/constants/pageLimit.constant';
import { qualityOptions, sortOptions, statusOptions, visibilityOptions } from '@app/pages/products/constants/selectors.constant';
import type { GetProductsCategoryQPI } from '../interfaces/query-params.interface';

interface ProductsCategoryQueryParamsValidation {
	isValid: boolean;
	queryParams: GetProductsCategoryQPI;
}

const validStatuses = new Set(statusOptions.map(({ value }) => value));
const validSorts = new Set(sortOptions.map(({ value }) => value));
const validQualities = new Set(qualityOptions.map(({ value }) => value));
const validVisibilities = new Set(visibilityOptions.map(({ value }) => value));
const defaultSort = sortOptions[0]?.value ?? 'Predeterminado';
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const parseNumber = (value: unknown): number => (typeof value === 'string' || typeof value === 'number' ? Number(value) : NaN);

const parsePrice = (value: unknown): number => {
	if (typeof value === 'number') return value;
	if (typeof value !== 'string' || !/^\d+(\.\d+)?$/.test(value.trim())) return NaN;
	return Number(value.trim());
};

const normalizeIds = (value: unknown): string => {
	const values = Array.isArray(value) ? value : [value];
	const ids = values
		.filter((item): item is string => typeof item === 'string')
		.flatMap((item) => item.split(','))
		.map((item) => item.trim().toLowerCase())
		.filter((item) => uuidRegex.test(item));

	return [...new Set(ids)].join(',') || 'Todos';
};

/** Normaliza los filtros de productos de una categoría sin modificar la URL ni los parámetros originales. */
export const validateProductsCategoryQueryParams = (params: Params): ProductsCategoryQueryParamsValidation => {
	const page = parseNumber(params['page']);
	const limit = parseNumber(params['limit']);
	const rawMinPrice = params['minPrice'];
	const rawMaxPrice = params['maxPrice'];
	const minPrice = parsePrice(rawMinPrice);
	const maxPrice = parsePrice(rawMaxPrice);
	const validMinPrice = Number.isFinite(minPrice) && minPrice >= 0;
	const validMaxPrice = Number.isFinite(maxPrice) && maxPrice >= 0;
	const validPrices =
		(rawMinPrice === undefined || validMinPrice) &&
		(rawMaxPrice === undefined || validMaxPrice) &&
		!(validMinPrice && validMaxPrice && minPrice > maxPrice);
	const queryParams: GetProductsCategoryQPI = {
		filter: typeof params['filter'] === 'string' ? params['filter'] : '',
		page: Number.isInteger(page) && page >= 1 ? page : 1,
		limit: PAGINATION_LIMITS.includes(limit) ? limit : 10,
		status: validStatuses.has(params['status']) ? params['status'] : 'Todos',
		sort: validSorts.has(params['sort']) ? params['sort'] : defaultSort,
		subcategoryIds: normalizeIds(params['subcategoryIds']),
		brandIds: normalizeIds(params['brandIds']),
		quality: validQualities.has(params['quality']) ? params['quality'] : 'Todos',
		visibility: validVisibilities.has(params['visibility']) ? params['visibility'] : 'Todos',
	};

	if (validPrices) {
		if (validMinPrice) queryParams.minPrice = minPrice;
		if (validMaxPrice) queryParams.maxPrice = maxPrice;
	}

	const hasUnknownParams = Object.keys(params).some((key) => !Object.prototype.hasOwnProperty.call(queryParams, key));
	const hasInvalidValues =
		queryParams.filter !== (params['filter'] ?? '') ||
		queryParams.page !== page ||
		queryParams.limit !== limit ||
		queryParams.status !== params['status'] ||
		queryParams.sort !== params['sort'] ||
		queryParams.subcategoryIds !== (params['subcategoryIds'] ?? 'Todos') ||
		queryParams.brandIds !== (params['brandIds'] ?? 'Todos') ||
		queryParams.quality !== params['quality'] ||
		queryParams.visibility !== params['visibility'] ||
		queryParams.minPrice !== (rawMinPrice === undefined ? undefined : minPrice) ||
		queryParams.maxPrice !== (rawMaxPrice === undefined ? undefined : maxPrice);

	return { isValid: !hasUnknownParams && !hasInvalidValues, queryParams };
};
