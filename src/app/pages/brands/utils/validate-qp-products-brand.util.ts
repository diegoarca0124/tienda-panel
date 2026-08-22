import { ActivatedRoute, Router } from '@angular/router';

export const ValidateQPProductsBrand = (route: ActivatedRoute, params: any, router: Router, sortArray?: Array<string>): boolean => {
	//filter: string, page: number, status: string, limit: number, subcategoryIds
	let page = Number(params['page']);
	let limit = Number(params['limit']);
	let status = params['status'];
	let subcategoryIds = params['subcategoryIds'];
	let sort = params['sort'];

	const validStatusValues = ['Todos', 'draft', 'published'];
	const validLimitVales = [10, 20, 25];
	const validSort = sortArray ?? [];

	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

	//corregir page
	if (!page || page < 1) {
		page = 1;
	}

	//corregir limit
	if (!validLimitVales.includes(limit)) {
		limit = 10;
	}

	//corregir status
	if (!validStatusValues.includes(status)) {
		status = 'Todos';
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

	if (
		page !== Number(params['page']) ||
		limit !== Number(params['limit']) ||
		status !== params['status'] ||
		sort !== params['sort'] ||
		subcategoryIds !== params['subcategoryIds']
	) {
		router.navigate([], {
			relativeTo: route,
			queryParams: { ...params, page, limit, status, sort, subcategoryIds },
			queryParamsHandling: 'merge',
			replaceUrl: true,
		});
		return false;
	}
	return true;
};
