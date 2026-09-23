import { ActivatedRoute, Params, Router } from '@angular/router';

export const validateProductsBrandQueryParams = (route: ActivatedRoute, params: Params, router: Router, sortArray: string[] = []): boolean => {
	const filter = params['filter'] ?? '';

	let page = Number(params['page']);
	let limit = Number(params['limit']);
	let status = params['status'];
	let sort = params['sort'];
	let subcategoryIds = params['subcategoryIds'] ?? 'Todos';
	let quality = params['quality'];
	let visibility = params['visibility'];

	const validStatusValues = ['Todos', 'draft', 'published'];

	const validQualityValues = ['Todos', 'low', 'medium', 'high'];

	const validVisibilityValues = ['Todos', 'public', 'private'];

	const validLimitValues = [10, 20, 25];

	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

	// Validar página
	if (!Number.isInteger(page) || page < 1) {
		page = 1;
	}

	// Validar límite
	if (!validLimitValues.includes(limit)) {
		limit = 10;
	}

	// Validar estado
	if (!validStatusValues.includes(status)) {
		status = 'Todos';
	}

	// Validar orden
	if (!sortArray.includes(sort)) {
		sort = sortArray[0] ?? 'Predeterminado';
	}

	// Validar calidad
	if (!validQualityValues.includes(quality)) {
		quality = 'Todos';
	}

	// Validar visibilidad
	if (!validVisibilityValues.includes(visibility)) {
		visibility = 'Todos';
	}

	// Validar subcategorías
	if (subcategoryIds !== 'Todos') {
		const subcategoryList = Array.isArray(subcategoryIds)
			? subcategoryIds
			: String(subcategoryIds)
					.split(',')
					.map((id) => id.trim())
					.filter(Boolean);

		const validSubcategoryIds = [...new Set(subcategoryList.filter((id) => uuidRegex.test(id)))];

		subcategoryIds = validSubcategoryIds.length > 0 ? validSubcategoryIds.join(',') : 'Todos';
	}

	// Validar rango de precios
	const rawMinPrice = params['minPrice'];
	const rawMaxPrice = params['maxPrice'];

	const parsedMinPrice = rawMinPrice !== undefined && rawMinPrice !== null && rawMinPrice !== '' ? Number(rawMinPrice) : undefined;

	const parsedMaxPrice = rawMaxPrice !== undefined && rawMaxPrice !== null && rawMaxPrice !== '' ? Number(rawMaxPrice) : undefined;

	const validPrices =
		parsedMinPrice !== undefined &&
		parsedMaxPrice !== undefined &&
		Number.isFinite(parsedMinPrice) &&
		Number.isFinite(parsedMaxPrice) &&
		parsedMinPrice >= 0 &&
		parsedMaxPrice >= 0 &&
		parsedMinPrice <= parsedMaxPrice;

	const minPrice = validPrices ? parsedMinPrice : undefined;

	const maxPrice = validPrices ? parsedMaxPrice : undefined;

	// Construir únicamente los parámetros permitidos
	const sanitizedParams: Params = {
		filter,
		page,
		limit,
		status,
		sort,
		subcategoryIds,
		quality,
		visibility,
	};

	// Los precios solamente se agregan cuando el rango es válido
	if (minPrice !== undefined && maxPrice !== undefined) {
		sanitizedParams['minPrice'] = minPrice;
		sanitizedParams['maxPrice'] = maxPrice;
	}

	const allowedKeys = Object.keys(sanitizedParams);

	const hasUnknownParams = Object.keys(params).some((key) => !allowedKeys.includes(key));

	const originalMinPrice = rawMinPrice !== undefined ? Number(rawMinPrice) : undefined;

	const originalMaxPrice = rawMaxPrice !== undefined ? Number(rawMaxPrice) : undefined;

	const hasInvalidValues =
		filter !== (params['filter'] ?? '') ||
		page !== Number(params['page']) ||
		limit !== Number(params['limit']) ||
		status !== params['status'] ||
		sort !== params['sort'] ||
		subcategoryIds !== (params['subcategoryIds'] ?? 'Todos') ||
		quality !== params['quality'] ||
		visibility !== params['visibility'] ||
		minPrice !== originalMinPrice ||
		maxPrice !== originalMaxPrice;

	if (hasUnknownParams || hasInvalidValues) {
		router.navigate([], {
			relativeTo: route,
			queryParams: sanitizedParams,
			replaceUrl: true,
		});

		return false;
	}

	return true;
};
