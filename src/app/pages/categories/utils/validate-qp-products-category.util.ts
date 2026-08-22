import { ActivatedRoute, Router } from '@angular/router';

export const ValidateQPProductsCategory = (route: ActivatedRoute, params: any, router: Router, sortArray: Array<string>): boolean => {
	//filter: string, page: number, status: string, limit: number, subcategoryIds
	let page = Number(params['page']);
	let limit = Number(params['limit']);
	let status = params['status'];
	let subcategoryIds = params['subcategoryIds'];
	let sort = params['sort'];
	let quality = params['quality'];
	let visibility = params['visibility'];
	let minPrice: number | undefined = Number(params['minPrice']);
	let maxPrice: number | undefined = Number(params['maxPrice']);

	const validStatusValues = ['Todos', 'draft', 'published'];
	const validQualityValues = ['Todos', 'low', 'medium', 'high'];
	const validVisibilityValues = ['Todos', 'public', 'private'];
	const validLimitVales = [10, 20, 25];
	const validSort = sortArray ?? [];
	const validPrices =
		minPrice !== undefined && maxPrice !== undefined && Number.isFinite(minPrice) && Number.isFinite(maxPrice) && minPrice >= 0 && maxPrice >= 0 && minPrice <= maxPrice;
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

	//corregir page
	if (isNaN(page) || page < 1) {
		page = 1;
	}

	if (isNaN(limit) || !validLimitVales.includes(limit)) {
		limit = 10;
	}

	//corregir status
	if (!validStatusValues.includes(status)) {
		status = 'Todos';
	}

	if (!validVisibilityValues.includes(visibility)) {
		visibility = 'Todos';
	}

	if (!subcategoryIds) {
		subcategoryIds = 'Todos';
	} else {
		const validIds = subcategoryIds
			.split(',')
			.map((id: string) => id.trim())
			.filter((id: string) => uuidRegex.test(id));

		subcategoryIds = validIds.length ? validIds.join(',') : 'Todos';
	}

	if (validSort.length > 0 && !validSort.includes(sort)) {
		sort = validSort[0];
	}

	if (!validQualityValues.includes(quality)) {
		quality = 'Todos';
	}
	console.log('validPrices', validPrices);

	if (!validPrices) {
		minPrice = undefined;
		maxPrice = undefined;
	}

	if (
		page !== Number(params['page']) ||
		limit !== Number(params['limit']) ||
		status !== params['status'] ||
		sort !== params['sort'] ||
		subcategoryIds !== params['subcategoryIds'] ||
		quality !== params['quality'] ||
		visibility !== params['visibility'] ||
		minPrice !== (params['minPrice'] !== undefined ? Number(params['minPrice']) : undefined) ||
		maxPrice !== (params['maxPrice'] !== undefined ? Number(params['maxPrice']) : undefined)
	) {
		const queryParams: any = {
			...params,
			page,
			limit,
			status,
			sort,
			subcategoryIds,
			quality,
			visibility,
		};

		if (minPrice !== undefined && maxPrice !== undefined) {
			queryParams.minPrice = minPrice;
			queryParams.maxPrice = maxPrice;
		} else {
			delete queryParams.minPrice;
			delete queryParams.maxPrice;
		}

		router.navigate([], {
			relativeTo: route,
			queryParams: queryParams,
			replaceUrl: true,
		});
		return false;
	}
	return true;
};
