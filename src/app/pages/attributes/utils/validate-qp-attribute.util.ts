import { ActivatedRoute, Router } from '@angular/router';

export const ValidateQPAttributes = (route: ActivatedRoute, params: any, router: Router, sortArray?: Array<string>): boolean => {
	//filter: string, page: number, status: string, limit: number, subcategoryIds
	let page = Number(params['page']);
	let limit = Number(params['limit']);
	let status = params['status'];
	let sort = params['sort'];

	const validStatusValues = ['Todos', 'Activos', 'Inactivos'];
	const validLimitVales = [10, 20, 25];
	let validSort: Array<string> = [];
	if (sortArray) validSort = sortArray;

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

	if (!validSort.includes(sort)) {
		sort = 'Predeterminado';
	}

	if (page !== Number(params['page']) || limit !== Number(params['limit']) || status !== params['status'] || sort !== params['sort']) {
		router.navigate([], {
			relativeTo: route,
			queryParams: { ...params, page, limit, status, sort },
			queryParamsHandling: 'merge',
			replaceUrl: true,
		});
		return false;
	}
	return true;
};
