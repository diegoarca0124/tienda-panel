import { ActivatedRoute, Router } from '@angular/router';

export const ValidateQPProducts = (route: ActivatedRoute, params: any, router: Router, sortArray?: Array<string>): boolean => {
	//filter: string, page: number, status: string, limit: number, subcategoryIds
	let page = Number(params['page']);
	let limit = Number(params['limit']);
	let status = params['status'];
	let sort = params['sort'];
	let visibility = params['visibility'];
	let quality = params['quality'];

	const validStatusValues = ['Todos', 'draft', 'published'];
	const validVisibilityValues = ['Todos', 'public', 'private'];
	const validQualityValues = ['Todos', 'low', 'medium', 'high'];
	const validLimitValues = [10, 20, 25];
	let validSort: Array<string> = [];
	if (sortArray) validSort = sortArray;

	//corregir page
	if (!page || page < 1) {
		page = 1;
	}

	//corregir limit
	if (!validLimitValues.includes(limit)) {
		limit = 10;
	}

	//corregir status
	if (!validStatusValues.includes(status)) {
		status = 'Todos';
	}

	if (!validVisibilityValues.includes(visibility)) {
		visibility = 'Todos';
	}

	if (!validQualityValues.includes(quality)) {
		quality = 'Todos';
	}

	if (!validSort.includes(sort)) {
		sort = 'Predeterminado';
	}

	if (
		page !== Number(params['page']) ||
		limit !== Number(params['limit']) ||
		status !== params['status'] ||
		sort !== params['sort'] ||
		visibility !== params['visibility'] ||
		quality !== params['quality']
	) {
		router.navigate([], {
			relativeTo: route,
			queryParams: { ...params, page, limit, status, sort, visibility, quality },
			queryParamsHandling: 'merge',
			replaceUrl: true,
		});
		return false;
	}
	return true;
};
